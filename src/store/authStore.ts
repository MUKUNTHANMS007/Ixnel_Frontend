// store/authStore.ts

import { create }  from 'zustand';
import { persist } from 'zustand/middleware';
import {
  authAPI,
  type RegisterPayload,
  type LoginPayload,
  type OAuthCallbackPayload,
} from '../lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// Shapes match backend response exactly
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id             : string;
  email          : string;
  auth_provider  : 'local' | 'google' | 'github';
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
  reserved_credits   : number;
  available_credits  : number;    // computed by backend, sent directly
  total_credits_used : number;
  is_blocked         : boolean;
  created_at         : string;
  updated_at         : string;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

interface AuthState {
  user            : User | null;
  profile         : UserProfile | null;
  accessToken     : string | null;
  refreshToken    : string | null;
  isLoading       : boolean;
  error           : string | null;
  isAuthenticated : boolean;    // plain boolean — updated on every auth change

  register           : (
    username      : string,
    email         : string,
    password      : string,
    user_type     : 'individual' | 'company',
    company_name ?: string,
  ) => Promise<boolean>;

  login              : (email: string, password: string) => Promise<boolean>;
  oauthLogin         : (payload: OAuthCallbackPayload) => Promise<boolean>;
  logout             : () => Promise<void>;
  clearError         : () => void;
  refreshAccessToken : () => Promise<boolean>;
  fetchMe            : () => Promise<void>;
  getAvailableCredits: () => number;
  canAffordJob       : (jobCost: number) => boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// Centralized set calls — isAuthenticated always stays in sync
// ─────────────────────────────────────────────────────────────────────────────

type SetFn = (
  partial : Partial<AuthState>
         | ((state: AuthState) => Partial<AuthState>)
) => void;

/**
 * Sets authenticated state.
 * Always syncs isAuthenticated, resets loading + error.
 */
const setAuth = (
  set  : SetFn,
  data : {
    user         : User | null;
    profile      : UserProfile | null;
    accessToken  : string | null;
    refreshToken : string | null;
  },
): void => {
  set({
    ...data,
    isAuthenticated : !!data.user && !!data.accessToken,
    isLoading       : false,
    error           : null,
  });
};

/**
 * Clears all auth state.
 * Used on logout, token expiry, account suspension.
 */
const clearAuth = (set: SetFn): void => {
  set({
    user            : null,
    profile         : null,
    accessToken     : null,
    refreshToken    : null,
    isAuthenticated : false,
    isLoading       : false,
    error           : null,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({

      // ── Initial state ─────────────────────────────────────────────────────
      user            : null,
      profile         : null,
      accessToken     : null,
      refreshToken    : null,
      isLoading       : false,
      error           : null,
      isAuthenticated : false,

      // ── Credit helpers ────────────────────────────────────────────────────

      getAvailableCredits: () => {
        const { profile } = get();
        if (!profile) return 0;
        // Use server-computed field — avoids recomputing from potentially stale values
        return profile.available_credits;
      },

      canAffordJob: (jobCost: number) => {
        return get().getAvailableCredits() >= jobCost;
      },

      // ═══════════════════════════════════════════════════════════════════════
      // REGISTER
      // ═══════════════════════════════════════════════════════════════════════
      register: async (
        username,
        email,
        password,
        user_type,
        company_name,
      ) => {
        set({ isLoading: true, error: null });

        console.log('[authStore][register] start', { email, user_type });

        const payload: RegisterPayload = { email, password, username, user_type };
        if (company_name?.trim()) {
          payload.company_name = company_name.trim();
        }

        const response = await authAPI.register(payload);

        console.log('[authStore][register] response', {
          success : response.success,
          error   : response.error,
          hasData : !!response.data,
        });

        if (response.success && response.data) {
          setAuth(set, {
            user         : response.data.user,
            profile      : response.data.profile,
            accessToken  : response.data.accessToken,
            refreshToken : response.data.refreshToken,
          });
          console.log('[authStore][register] success');
          return true;
        }

        console.warn('[authStore][register] failed', { error: response.error });
        set({ isLoading: false, error: response.error || 'Registration failed' });
        return false;
      },

      // ═══════════════════════════════════════════════════════════════════════
      // LOGIN
      // ═══════════════════════════════════════════════════════════════════════
      login: async (email, password) => {
        set({ isLoading: true, error: null });

        console.log('[authStore][login] start', { email });

        const response = await authAPI.login({ email, password });

        console.log('[authStore][login] FULL RESPONSE', response);
        console.log('[authStore][login] response.data', response.data);

        if (response.success && response.data) {
          setAuth(set, {
            user         : response.data.user,
            profile      : response.data.profile,
            accessToken  : response.data.accessToken,
            refreshToken : response.data.refreshToken,
          });
          console.log('[authStore][login] success');
          return true;
        }

        console.warn('[authStore][login] failed', { error: response.error });
        set({ isLoading: false, error: response.error || 'Login failed' });
        return false;
      },

      // ═══════════════════════════════════════════════════════════════════════
      // OAUTH LOGIN
      // ═══════════════════════════════════════════════════════════════════════
      oauthLogin: async (payload) => {
        set({ isLoading: true, error: null });

        console.log('[authStore][oauthLogin] start', {
          provider : payload.provider,
          email    : payload.email,
        });

        const response = await authAPI.oauthCallback(payload);

        console.log('[authStore][oauthLogin] response', {
          success   : response.success,
          error     : response.error,
          hasData   : !!response.data,
          isNewUser : response.data?.isNewUser,
        });

        if (response.success && response.data) {
          setAuth(set, {
            user         : response.data.user,
            profile      : response.data.profile,
            accessToken  : response.data.accessToken,
            refreshToken : response.data.refreshToken,
          });
          console.log('[authStore][oauthLogin] success', {
            isNewUser: response.data.isNewUser,
          });
          return true;
        }

        console.warn('[authStore][oauthLogin] failed', { error: response.error });
        set({ isLoading: false, error: response.error || 'OAuth login failed' });
        return false;
      },

      // ═══════════════════════════════════════════════════════════════════════
      // LOGOUT
      // ═══════════════════════════════════════════════════════════════════════
      logout: async () => {
        const { accessToken } = get();

        console.log('[authStore][logout] start');

        if (accessToken) {
          // Fire and forget — do not block local logout on server response
          authAPI.logout(accessToken).catch((err) => {
            console.warn('[authStore][logout] server call failed (ignored):', err);
          });
        }

        clearAuth(set);   // resets everything including isLoading + isAuthenticated
        console.log('[authStore][logout] complete');
      },

      // ═══════════════════════════════════════════════════════════════════════
      // CLEAR ERROR
      // ═══════════════════════════════════════════════════════════════════════
      clearError: () => {
        set({ error: null });
      },

      // ═══════════════════════════════════════════════════════════════════════
      // REFRESH ACCESS TOKEN
      // ═══════════════════════════════════════════════════════════════════════
      refreshAccessToken: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          console.warn('[authStore][refreshAccessToken] no refresh token in store');
          return false;
        }

        console.log('[authStore][refreshAccessToken] attempting refresh');

        const response = await authAPI.refreshToken(refreshToken);

        if (response.success && response.data) {
          if (!response.data.refreshToken) {
            // Backend should always return both — log if contract violated
            console.warn('[authStore][refreshAccessToken] backend did not return new refreshToken');
          }

          set({
            accessToken  : response.data.accessToken,
            refreshToken : response.data.refreshToken,
            isAuthenticated : true,
          });

          console.log('[authStore][refreshAccessToken] success');
          return true;
        }

        console.warn('[authStore][refreshAccessToken] failed — logging out');
        await get().logout();
        return false;
      },

      // ═══════════════════════════════════════════════════════════════════════
      // FETCH ME
      // Tries /me with current token
      // On failure, tries refresh then retries /me
      // On any unrecoverable failure, clears auth
      // ═══════════════════════════════════════════════════════════════════════
      fetchMe: async () => {
        const { accessToken } = get();

        if (!accessToken) {
          console.warn('[authStore][fetchMe] no access token — clearing auth');
          clearAuth(set);
          return;
        }

        console.log('[authStore][fetchMe] fetching with current token');

        const response = await authAPI.me(accessToken);

        if (response.success && response.data) {
          set({
            user    : response.data.user    ?? null,
            profile : response.data.profile ?? null,
          });
          console.log('[authStore][fetchMe] success');
          return;
        }

        // ── /me failed — try to refresh token ───────────────────────────────
        console.warn('[authStore][fetchMe] /me failed — attempting token refresh', {
          error: response.error,
        });

        const { refreshToken } = get();

        if (!refreshToken) {
          console.warn('[authStore][fetchMe] no refresh token available — clearing auth');
          clearAuth(set);
          return;
        }

        const refreshResponse = await authAPI.refreshToken(refreshToken);

        if (!refreshResponse.success || !refreshResponse.data) {
          console.warn('[authStore][fetchMe] token refresh failed — clearing auth');
          clearAuth(set);
          return;
        }

        // ── Capture new token directly — do not read from store ──────────────
        // Store set() is async-batched — reading get().accessToken here
        // might return the old value
        const newAccessToken  = refreshResponse.data.accessToken;
        const newRefreshToken = refreshResponse.data.refreshToken;

        set({
          accessToken     : newAccessToken,
          refreshToken    : newRefreshToken,
          isAuthenticated : true,
        });

        console.log('[authStore][fetchMe] token refreshed — retrying /me');

        // ── Retry /me with captured token ─────────────────────────────────
        const retryResponse = await authAPI.me(newAccessToken);

        if (retryResponse.success && retryResponse.data) {
          set({
            user    : retryResponse.data.user    ?? null,
            profile : retryResponse.data.profile ?? null,
          });
          console.log('[authStore][fetchMe] retry success');
        } else {
          console.warn('[authStore][fetchMe] retry /me failed after refresh — clearing auth');
          clearAuth(set);
        }
      },

    }),

    // ── Persistence config ───────────────────────────────────────────────────
    // Only persist what is needed to restore session across page reloads
    // isLoading, error, isAuthenticated are intentionally excluded —
    // they are derived or transient
    {
      name      : 'auth-storage',
      partialize: (state) => ({
        user         : state.user,
        profile      : state.profile,
        accessToken  : state.accessToken,
        refreshToken : state.refreshToken,
      }),
    }
  )
);