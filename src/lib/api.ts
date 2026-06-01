// api.ts

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─────────────────────────────────────────────────────────────────────────────
// CORE TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id             : string;
  email          : string;
  auth_provider  : string;
  email_verified : boolean;
  created_at     : string;
  updated_at     : string;
}
export interface UserProfile {
  id                 : string;
  auth_user_id       : string;
  username           : string;
  user_type          : 'individual' | 'company';
  company_name       : string | null;
  credits            : number;
  subscription_credits: number; // Added to support separated balance rendering [1.2.4]
  purchased_credits  : number;  // Added to support separated balance rendering [1.2.4]
  reserved_credits   : number;
  available_credits  : number;
  total_credits_used : number;
  is_blocked         : boolean;
  created_at         : string;
  updated_at         : string;
}

// Subscription interface matching your Postgres schema
export interface SubscriptionRecord {
  id: string;
  profile_id: string;
  payment_provider: 'paddle' | 'razorpay';
  provider_subscription_id: string;
  provider_customer_id: string;
  plan_code: string;
  subscription_status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'expired';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiOptions {
  method? : string;
  body?   : unknown;
  token?  : string | null;
}

export interface ApiResponse<T = unknown> {
  success     : boolean;
  data?       : T;
  error?      : string;
  message?    : string;
  pagination? : {
    page  : number;
    limit : number;
    total : number;
    pages : number;
  };
}

export interface RegisterPayload {
  email        : string;
  password     : string;
  username     : string;
  user_type    : 'individual' | 'company';
  company_name?: string;
}

export interface LoginPayload {
  email    : string;
  password : string;
}

export interface OAuthCallbackPayload {
  provider          : 'google' | 'github';
  provider_user_id? : string;
  email?            : string;
  code?             : string;
  user_type?        : 'individual' | 'company';
  company_name?     : string;
}

export interface AuthResponse {
  accessToken  : string;
  refreshToken : string;
  user         : User;
  profile      : UserProfile;
  isNewUser?   : boolean;
  provider_user_id?: string;
  email?: string;  
}

export interface PaymentRecord {
  id: string;
  amount: number;
  payment_status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'chargeback';
  created_at: string;
  currency_code: string;
  payment_type: 'credit_purchase' | 'subscription' | 'addon_purchase' | 'enterprise_invoice';
  credits_added: number | null;
}

export interface MeResponse {
  user          : User;
  profile       : UserProfile;
  subscription? : SubscriptionRecord | null; // Added supporting dynamic persistence [1]
  payments?     : PaymentRecord[];
}

export interface RefreshResponse {
  accessToken  : string;
  refreshToken : string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BASE FETCH WRAPPER (Real HTTP Callouts)
// ─────────────────────────────────────────────────────────────────────────────

export async function api<T = unknown>(
  endpoint : string,
  options  : ApiOptions = {},
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // If a JWT token is passed, add the standard Bearer header
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body   : body ? JSON.stringify(body) : undefined,
      signal : controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse JSON response safely
    let raw: Record<string, unknown>;
    try {
      raw = await res.json();
    } catch {
      console.error(`[api][${endpoint}] non-JSON response`, { status : res.status });
      return {
        success : false,
        error   : `Server returned non-JSON response (status ${res.status})`,
      };
    }

    if (import.meta.env.DEV) {
      console.log(`[api][${endpoint}]`, {
        status : res.status,
        ok     : res.ok,
        keys   : Object.keys(raw),
      });
    }

    // Handle non-OK HTTP statuses
    if (!res.ok) {
      return {
        success : false,
        error   : (raw.error as string) || `Server error: ${res.status}`,
      };
    }

    // Pull out envelop keys and normalize payload data
    const { success, error, message, pagination, ...payload } = raw;

    return {
      success    : success as boolean,
      error      : error      as string | undefined,
      message    : message    as string | undefined,
      pagination : pagination as ApiResponse['pagination'],
      data       : payload    as T,
    };

  } catch (err: unknown) {
    clearTimeout(timeoutId);

    const isAbort   = err instanceof Error && err.name === 'AbortError';
    const isNetwork = err instanceof TypeError;

    console.error(`[api][${endpoint}] fetch exception:`, {
      type   : err instanceof Error ? err.name    : 'unknown',
      reason : err instanceof Error ? err.message : String(err),
    });

    return {
      success : false,
      error   : isAbort
        ? 'Request timed out. Please try again.'
        : isNetwork
          ? 'Network error. Is the server running?'
          : 'Unexpected error. Please try again.',
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH API METHODS
// ─────────────────────────────────────────────────────────────────────────────

export const authAPI = {
  register: async (payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> => {
    // Exclude undefined parameters
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== undefined)
    );
    return api<AuthResponse>('/auth/register', {
      method : 'POST',
      body   : cleanPayload,
    });
  },

  login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponse>> => {
    return api<AuthResponse>('/auth/login', {
      method : 'POST',
      body   : payload,
    });
  },

  oauthCallback: async (payload: OAuthCallbackPayload): Promise<ApiResponse<AuthResponse>> => {
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== undefined)
    );
    return api<AuthResponse>('/auth/oauth/callback', {
      method : 'POST',
      body   : cleanPayload,
    });
  },

  me: async (token: string): Promise<ApiResponse<MeResponse>> => {
    return api<MeResponse>('/auth/me', {
      method : 'GET',
      token,
    });
  },

  verifyEmail: async (token: string): Promise<ApiResponse> => {
    return api(`/auth/verify-email?token=${encodeURIComponent(token)}`);
  },

  forgotPassword: async (email: string): Promise<ApiResponse> => {
    return api('/auth/forgot-password', {
      method : 'POST',
      body   : { email },
    });
  },

  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse> => {
    return api('/auth/reset-password', {
      method : 'POST',
      body   : { token, newPassword },
    });
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<RefreshResponse>> => {
    return api<RefreshResponse>('/auth/refresh', {
      method : 'POST',
      body   : { refreshToken },
    });
  },

  logout: async (token: string): Promise<ApiResponse> => {
    return api('/auth/logout', {
      method : 'POST',
      token,
    });
  },

  /**
   * Securely requests the backend to cancel the active subscription.
   */
  cancelSubscription: async (): Promise<ApiResponse<void>> => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return { success: false, error: 'Authentication is required.' };
    }
    // Requests cancellation on the authenticated session
    return api<void>('/payments/cancel-subscription', {
      method: 'POST',
      token,
    });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// OAUTH HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export const oauthHelpers = {
  initiateGithubLogin: (): void => {
    const clientId    = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI
      || `${window.location.origin}/auth/callback`;
    const scope = 'read:user user:email';

    if (!clientId) {
      console.error('[oauthHelpers] VITE_GITHUB_CLIENT_ID is not set');
      return;
    }

    const params = new URLSearchParams({
      client_id    : clientId,
      redirect_uri : redirectUri,
      scope,
      state        : 'github',
    });

    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
  },

  parseOAuthCallback: (): { provider : 'google' | 'github'; code : string } | null => {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get('code');
    const state  = params.get('state');

    if (!code || !state) return null;
    if (!['google', 'github'].includes(state)) return null;

    return {
      provider : state as 'google' | 'github',
      code,
    };
  },
};
