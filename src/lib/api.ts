const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function api<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    // Parse the JSON response regardless of status code
    const data: ApiResponse<T> = await res.json().catch(() => ({ success: false, error: `API error: ${res.status}` }));

    if (!res.ok) {
      // Return the actual error message from the backend if it exists
      return {
        success: false,
        error: data.error || `Server responded with status ${res.status}`,
      };
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error(`API Fetch Error [${endpoint}]:`, err);
    return { 
      success: false, 
      error: err.name === 'AbortError' ? 'Request timed out' : 'Network error. Is the server running?' 
    };
  }
}

// ============================================================
// AUTH API METHODS
// ============================================================

// ── RegisterPayload ────────────────────────────────────────────────
export interface RegisterPayload {
  email         : string;
  password      : string;
  username      : string;                       // was "name"
  user_type     : 'individual' | 'company';     // new required field
  company_name ?: string;                       // conditional
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface OAuthCallbackPayload {
  provider          : 'google' | 'github';
  provider_user_id  : string;                   // now required
  email             : string;
  user_type         : 'individual' | 'company'; // required for new users
  company_name     ?: string;
}

export interface AuthResponse {
  user    : {
    id             : string;
    email          : string;
    name           : string;           // username mapped to name
    auth_provider  : string;
    email_verified : boolean;
  };
  profile : {                          // ← added
    id                : string;
    username          : string;
    user_type         : 'individual' | 'company';
    company_name      : string | null;
    credits           : number;
    reserved_credits  : number;
    available_credits : number;
    is_blocked        : boolean;
  };
  accessToken  : string;
  refreshToken : string;
}

export const authAPI = {
  // Local registration
  register: async (payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> => {
    return api<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    });
  },

  // Local login
  login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponse>> => {
    return api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    });
  },

  // OAuth callback
  oauthCallback: async (payload: OAuthCallbackPayload): Promise<ApiResponse<AuthResponse>> => {
    return api<AuthResponse>('/auth/oauth/callback', {
      method: 'POST',
      body: payload,
    });
  },

  // Verify email
  verifyEmail: async (token: string): Promise<ApiResponse> => {
    return api(`/auth/verify-email?token=${token}`);
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    return api('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse> => {
    return api('/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
    });
  },

  // ── refreshToken response - now returns both tokens ──────────────────────────
refreshToken: async (
  refreshToken: string
): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
  return api<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
    method : 'POST',
    body   : { refreshToken },
  });
},

  // Logout
  logout: async (token: string): Promise<ApiResponse> => {
    return api('/auth/logout', {
      method: 'POST',
      token,
    });
  },

  me: async (token: string): Promise<ApiResponse<User>> => {
    return api<User>('/auth/me', {
      method: 'GET',
      token,
    });
  },
};

// Add User interface
interface User {
  id: string;
  email: string;
  name: string;
  auth_provider: string;
  email_verified: boolean;
  role?: 'admin' | 'user';
}

// ============================================================
// OAUTH HELPERS
// ============================================================

export const oauthHelpers = {
  // Initialize GitHub OAuth
  initiateGithubLogin: () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}/auth/callback`;
    const scope = 'read:user user:email';
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=github`;
    
    window.location.href = githubAuthUrl;
  },

  // Parse OAuth callback
  parseOAuthCallback: (): { provider: 'google' | 'github'; code: string } | null => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (!code || !state) return null;

    return {
      provider: state as 'google' | 'github',
      code,
    };
  },
};

export interface MeResponse {
  user    : AuthResponse['user'];
  profile : AuthResponse['profile'];
}
