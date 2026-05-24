import { create }   from 'zustand';
import { persist }  from 'zustand/middleware';
import {
  authAPI,
  type RegisterPayload,
  type LoginPayload,
  type OAuthCallbackPayload,
} from '../lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// User shape - aligned with backend getMe / login / register response
// backend returns: { user: { id, email, name(=username), auth_provider,
//                            email_verified }, profile: { ... } }
// ─────────────────────────────────────────────────────────────────────────────
export interface User {
  id             : string;
  email          : string;
  name           : string;          // maps to username in DB
  auth_provider  : string;
  email_verified : boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile shape - full credit + business info
// stored separately so components can access credit data
// ─────────────────────────────────────────────────────────────────────────────
export interface UserProfile {
  id                 : string;
  username           : string;
  user_type          : 'individual' | 'company';
  company_name       : string | null;
  credits            : number;
  reserved_credits   : number;
  available_credits  : number;
  total_credits_used?: number;
  is_blocked         : boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth State
// ─────────────────────────────────────────────────────────────────────────────
interface AuthState {
  user         : User | null;
  profile      : UserProfile | null;      // ← added, was missing before
  accessToken  : string | null;
  refreshToken : string | null;
  isLoading    : boolean;
  error        : string | null;

  // Computed
  isAuthenticated : boolean;

  // Actions
  register    : (
    username      : string,
    email         : string,
    password      : string,
    user_type     : 'individual' | 'company',
    company_name ?: string
  ) => Promise<boolean>;

  login       : (email: string, password: string) => Promise<boolean>;

  oauthLogin  : (payload: OAuthCallbackPayload) => Promise<boolean>;

  logout      : () => Promise<void>;

  clearError  : () => void;

  refreshAccessToken : () => Promise<boolean>;

  fetchMe     : () => Promise<void>;

  // Credit helpers (reads from profile)
  getAvailableCredits : () => number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({

      // ── Initial state ────────────────────────────────────────────────────
      user         : null,
      profile      : null,
      accessToken  : null,
      refreshToken : null,
      isLoading    : false,
      error        : null,

      // ── Computed ─────────────────────────────────────────────────────────
      get isAuthenticated() {
        return !!get().user && !!get().accessToken;
      },

      // ── Credit helper ─────────────────────────────────────────────────────
      getAvailableCredits: () => {
        const { profile } = get();
        if (!profile) return 0;
        return profile.credits - profile.reserved_credits;
      },

      // ═══════════════════════════════════════════════════════════════════
      // REGISTER
      // Sends: { email, password, username, user_type, company_name? }
      // Receives: { success, accessToken, refreshToken, user, profile }
      // ═══════════════════════════════════════════════════════════════════
      register: async (
        username     : string,
        email        : string,
        password     : string,
        user_type    : 'individual' | 'company',
        company_name?: string
      ) => {
        set({ isLoading: true, error: null });

        // Build payload matching backend RegisterPayload exactly
        const payload: RegisterPayload = {
          email,
          password,
          username,
          user_type,
          ...(company_name ? { company_name } : {}),
        };

        const response = await authAPI.register(payload);

        if (response.success && response.data) {
          set({
            user         : response.data.user,
            profile      : response.data.profile ?? null,
            accessToken  : response.data.accessToken,
            refreshToken : response.data.refreshToken,
            isLoading    : false,
            error        : null,
          });
          return true;
        }

        set({
          isLoading : false,
          error     : response.error || 'Registration failed',
        });
        return false;
      },

      // ═══════════════════════════════════════════════════════════════════
      // LOGIN
      // Sends: { email, password }
      // Receives: { success, accessToken, refreshToken, user, profile }
      // ═══════════════════════════════════════════════════════════════════
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        const payload: LoginPayload = { email, password };
        const response = await authAPI.login(payload);

        if (response.success && response.data) {
          set({
            user         : response.data.user,
            profile      : response.data.profile ?? null,
            accessToken  : response.data.accessToken,
            refreshToken : response.data.refreshToken,
            isLoading    : false,
            error        : null,
          });
          return true;
        }

        set({
          isLoading : false,
          error     : response.error || 'Login failed',
        });
        return false;
      },

      // ═══════════════════════════════════════════════════════════════════
      // OAUTH LOGIN
      // Sends: { provider, provider_user_id, email, user_type, company_name? }
      // Receives: { success, accessToken, refreshToken, user, profile, isNewUser }
      // ═══════════════════════════════════════════════════════════════════
      oauthLogin: async (payload: OAuthCallbackPayload) => {
        set({ isLoading: true, error: null });

        const response = await authAPI.oauthCallback(payload);

        if (response.success && response.data) {
          set({
            user         : response.data.user,
            profile      : response.data.profile ?? null,
            accessToken  : response.data.accessToken,
            refreshToken : response.data.refreshToken,
            isLoading    : false,
            error        : null,
          });
          return true;
        }

        set({
          isLoading : false,
          error     : response.error || 'OAuth login failed',
        });
        return false;
      },

      // ═══════════════════════════════════════════════════════════════════
      // LOGOUT
      // Clears all auth state locally
      // Calls backend (stateless - backend logs, frontend clears)
      // ═══════════════════════════════════════════════════════════════════
      logout: async () => {
        const { accessToken } = get();

        if (accessToken) {
          // Fire and forget - don't block UI on this
          authAPI.logout(accessToken).catch(() => {});
        }

        set({
          user         : null,
          profile      : null,
          accessToken  : null,
          refreshToken : null,
          error        : null,
        });
      },

      // ═══════════════════════════════════════════════════════════════════
      // CLEAR ERROR
      // ═══════════════════════════════════════════════════════════════════
      clearError: () => set({ error: null }),

      // ═══════════════════════════════════════════════════════════════════
      // REFRESH ACCESS TOKEN
      // Sends: { refreshToken }
      // Receives: { success, accessToken, refreshToken }
      // Rotates both tokens
      // ═══════════════════════════════════════════════════════════════════
      refreshAccessToken: async () => {
        const { refreshToken } = get();

        if (!refreshToken) return false;

        const response = await authAPI.refreshToken(refreshToken);

        if (response.success && response.data) {
          set({
            accessToken  : response.data.accessToken,
            // Backend rotates refresh token too - update if returned
            refreshToken : response.data.refreshToken ?? get().refreshToken,
          });
          return true;
        }

        // Refresh failed → full logout
        await get().logout();
        return false;
      },

      // ═══════════════════════════════════════════════════════════════════
      // FETCH ME
      // Used on app load to restore session from persisted token
      // GET /api/auth/me
      // Receives: { success, user, profile }
      // ═══════════════════════════════════════════════════════════════════
      fetchMe: async () => {
        const { accessToken } = get();

        if (!accessToken) {
          set({ user: null, profile: null });
          return;
        }

        const isUserWithProfile = (payload: unknown): payload is { user: User; profile: UserProfile | null } =>
          typeof payload === 'object'
          && payload !== null
          && 'user' in payload
          && 'profile' in payload;

        try {
          const response = await authAPI.me(accessToken);

          if (response.success && response.data) {
            const responsePayload = isUserWithProfile(response.data)
              ? response.data
              : { user: response.data as User, profile: null };

            set({
              user    : responsePayload.user    ?? null,
              profile : responsePayload.profile ?? null,
            });
          } else {
            // Token invalid or expired → try refresh first
            const refreshed = await get().refreshAccessToken();

            if (!refreshed) {
              // Refresh also failed → clear everything
              set({
                user         : null,
                profile      : null,
                accessToken  : null,
                refreshToken : null,
              });
            } else {
              // Retry fetchMe with new token
              const retryResponse = await authAPI.me(get().accessToken!);
              if (retryResponse.success && retryResponse.data) {
                const retryPayload = isUserWithProfile(retryResponse.data)
                  ? retryResponse.data
                  : { user: retryResponse.data as User, profile: null };

                set({
                  user    : retryPayload.user    ?? null,
                  profile : retryPayload.profile ?? null,
                });
              }
            }
          }
        } catch (error) {
          console.error('fetchMe error:', error);
          set({
            user         : null,
            profile      : null,
            accessToken  : null,
            refreshToken : null,
          });
        }
      },
    }),

    {
      name      : 'auth-storage',
      // Persist tokens + user + profile across sessions
      partialize: (state) => ({
        user         : state.user,
        profile      : state.profile,
        accessToken  : state.accessToken,
        refreshToken : state.refreshToken,
      }),
    }
  )
);