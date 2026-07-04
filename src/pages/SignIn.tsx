// pages/SignIn.tsx

import { useState } from 'react';
import {
  Mail,
  Lock,
  ArrowRight,
  Github,
  Loader2,
  Check,
  AlertCircle,  
  LogIn,
  User,
  Building2,
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';

import { authAPI } from '../lib/api';

interface SignInProps {
  onNavigate: (page: string) => void;
  onAuthSuccess: () => void;
}

interface SignInSuccess {
  username : string;
  email    : string;
  isShown  : boolean;
}

interface PendingOAuthUser {
  provider: 'google' | 'github';
  email: string;
  sub: string; // Stores Google sub OR resolved GitHub provider_user_id
}

export default function SignIn({ onNavigate, onAuthSuccess }: SignInProps) {

  // ─ Form State ─────────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // ─ API Status States ──────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─ Success screen state toggle ─────────────────────────────────────────────
  const [showSuccess, setShowSuccess] = useState<SignInSuccess>({
    username : '',
    email    : '',
    isShown  : false,
  });

  // ─ Pending OAuth State ───────────────────────────────────────────────────
  const [pendingOAuthUser, setPendingOAuthUser] = useState<PendingOAuthUser | null>(null);
  const [oauthUserType, setOauthUserType] = useState<'individual' | 'company'>('individual');
  const [oauthCompanyName, setOauthCompanyName] = useState('');

  // ─ Validation ──────────────────────────────────────────────────────────────
  const isFormValid = () => {
    return email.trim().length > 0 && password.length > 0;
  };

  // ─ Google OAuth Handler ───────────────────────────────────────────────────
  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    console.log('[SignIn] Google Login Credential received:', credentialResponse);
    if (!credentialResponse.credential) {
      setError('Failed to retrieve authentication token from Google.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);

      const response = await authAPI.oauthCallback({
        provider: 'google',
        provider_user_id: decoded.sub,
        email: decoded.email,
      });

      setIsLoading(false);

      if (response.success && response.data) {
        if (response.data.isNewUser) {
          setPendingOAuthUser({
            provider: 'google',
            email: decoded.email,
            sub: decoded.sub,
          });
        } else {
          if (response.data.accessToken) localStorage.setItem('accessToken', response.data.accessToken);
          if (response.data.refreshToken) localStorage.setItem('refreshToken', response.data.refreshToken);
          onAuthSuccess(); // Immediately sync state in App.tsx

          setShowSuccess({
            username: response.data.profile?.username || 'user',
            email: decoded.email,
            isShown: true,
          });
          setTimeout(() => onNavigate('profile'), 2000);
        }
      } else {
        setError(response.error || 'Google Sign In failed.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('An error occurred during Google Sign In.');
    }
  };

  // ─ GitHub OAuth Handler ────────────────────────────────────────────────────
  const handleGithubLogin = () => {
    setError(null);

    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}/auth/callback`;
    const scope = 'read:user user:email';

    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=github`;

    const popup = window.open(
      authUrl,
      'GitHub Login',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
    );

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data && event.data.type === 'GITHUB_OAUTH_SUCCESS') {
        const { code } = event.data;
        console.log('[SignIn] GitHub Code successfully received directly:', code);
        
        if (popup) popup.close();
        window.removeEventListener('message', handleMessage);

        setIsLoading(true);

        try {
          const response = await authAPI.oauthCallback({
            provider: 'github',
            code,
          });

          setIsLoading(false);

          if (response.success && response.data) {
            if (response.data.isNewUser) {
              // Store resolved details returned by backend instead of raw code
              setPendingOAuthUser({
                provider: 'github',
                email: response.data.email || 'Retrieving email...',
                sub: response.data.provider_user_id!, // Store returned provider_user_id directly
              });
            } else {
              if (response.data.accessToken) localStorage.setItem('accessToken', response.data.accessToken);
              if (response.data.refreshToken) localStorage.setItem('refreshToken', response.data.refreshToken);
              onAuthSuccess(); // Sync state in App.tsx

              setShowSuccess({
                username: response.data.profile?.username || 'user',
                email: response.data.user?.email || 'GitHub User',
                isShown: true,
              });
              setTimeout(() => onNavigate('profile'), 2000);
            }
          } else {
            setError(response.error || 'GitHub Login failed.');
          }
        } catch (err) {
          setIsLoading(false);
          setError('An error occurred during GitHub Sign In.');
        }
      }
    };

    window.addEventListener('message', handleMessage);
  };

  // ─ Complete OAuth Onboarding registration ──────────────────────────────────
  const completeOAuthSignup = async () => {
    if (!pendingOAuthUser) return;
    if (oauthUserType === 'company' && !oauthCompanyName.trim()) return;

    setIsLoading(true);
    setError(null);

    // Clean, dynamic payload supporting both providers seamlessly
    const payload = {
      provider: pendingOAuthUser.provider,
      provider_user_id: pendingOAuthUser.sub, // Holds Google sub OR GitHub provider_user_id
      email: pendingOAuthUser.email,         // Holds Google email OR GitHub email
      user_type: oauthUserType,
      company_name: oauthUserType === 'company' ? oauthCompanyName.trim() : 'Null',
    };

    try {
      const response = await authAPI.oauthCallback(payload);
      setIsLoading(false);

      if (response.success && response.data) {
        if (response.data.accessToken) localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) localStorage.setItem('refreshToken', response.data.refreshToken);
        onAuthSuccess(); // Sync state in App.tsx

        setPendingOAuthUser(null);
        setShowSuccess({
          username: response.data.profile?.username || 'user',
          email: response.data.user?.email || pendingOAuthUser.email,
          isShown: true,
        });
        setTimeout(() => onNavigate('profile'), 2000);
      } else {
        setError(response.error || 'Failed to complete registration.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('An unexpected connection error occurred.');
    }
  };

  // ─ Local Signin Handler ────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid()) return;

    console.log('[SignIn] Submitting Local Sign In Form', { email });
    setIsLoading(true);

    try {
      const response = await authAPI.login({
        email: email.trim(),
        password,
      });

      setIsLoading(false);

      if (response.success && response.data) {
        if (response.data.accessToken) localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) localStorage.setItem('refreshToken', response.data.refreshToken);
        onAuthSuccess(); // Sync state in App.tsx

        setShowSuccess({
          username: response.data.profile?.username || 'user',
          email: email.trim(),
          isShown: true,
        });

        setEmail('');
        setPassword('');
        setTimeout(() => onNavigate('profile'), 2000);
      } else {
          setError(response.error || 'No account found matching these credentials.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('An unexpected connection error occurred.');
    }
  };

  // ─ SCREEN 1: Success screen overlay ────────────────────────────────────────
  if (showSuccess.isShown) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 w-full max-w-md p-8 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
          <div className="text-center space-y-6 relative z-10 py-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center animate-pulse">
                <Check className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Welcome back! 👋</h2>
              <p className="text-neutral-400">You're signed in and ready to go</p>
            </div>
            <div className="space-y-3 bg-black/30 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                <span className="text-sm text-neutral-300">{showSuccess.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <LogIn className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                <span className="text-sm text-neutral-300">@{showSuccess.username}</span>
              </div>
            </div>
            <div className="space-y-2 pt-4">
              <button
                onClick={() => {
                  setShowSuccess({ ...showSuccess, isShown: false });
                  onNavigate('profile');
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold text-sm tracking-wide hover:bg-white transition-all duration-200 shadow-lg shadow-[#00AAFF]/25 hover:shadow-white/10 hover:scale-[1.02] active:scale-[0.98]"
              >
                Go to profile
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-neutral-500 text-center">Auto-redirecting in 2 seconds...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─ SCREEN 2: OAuth account type onboarding ───────────────────────────────
  if (pendingOAuthUser) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00AAFF]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 w-full max-w-md p-8 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/30 to-transparent" />
          <div className="space-y-6 relative z-10">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-[#00AAFF]/10 border border-[#00AAFF]/30 flex items-center justify-center">
                  <Check className="w-7 h-7 text-[#00AAFF]" />
                </div>
              </div>
              <h1 className="text-2xl font-black text-white mb-2 tracking-tight">One last step</h1>
              <p className="text-neutral-400 text-sm">
                Signed in via {pendingOAuthUser.provider === 'google' ? 'Google' : 'GitHub'}{' '}
                {pendingOAuthUser.provider === 'google' && (
                  <span className="text-neutral-200 font-medium">({pendingOAuthUser.email})</span>
                )}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-2 items-start font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Account Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOauthUserType('individual')}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all border ${
                    oauthUserType === 'individual'
                      ? 'bg-[#00AAFF]/20 border-[#00AAFF]/50 text-[#00AAFF]'
                      : 'bg-black/30 border-white/10 text-neutral-400 hover:bg-black/50'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-1.5" />
                  Individual
                </button>
                <button
                  type="button"
                  onClick={() => setOauthUserType('company')}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all border ${
                    oauthUserType === 'company'
                      ? 'bg-[#00AAFF]/20 border-[#00AAFF]/50 text-[#00AAFF]'
                      : 'bg-black/30 border-white/10 text-neutral-400 hover:bg-black/50'
                  }`}
                >
                  <Building2 className="w-4 h-4 inline mr-1.5" />
                  Company
                </button>
              </div>
            </div>

            {oauthUserType === 'company' && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Company Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-neutral-500" />
                  </div>
                  <input
                    type="text"
                    value={oauthCompanyName}
                    onChange={(e) => setOauthCompanyName(e.target.value)}
                    placeholder="Acme Corporation"
                    className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all placeholder:text-neutral-600 font-medium"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={completeOAuthSignup}
              disabled={isLoading || (oauthUserType === 'company' && !oauthCompanyName.trim())}
              className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold text-sm tracking-wide hover:bg-white transition-all duration-200 shadow-lg shadow-[#00AAFF]/25 hover:shadow-white/10 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setPendingOAuthUser(null);
                setOauthUserType('individual');
                setOauthCompanyName('');
                setError(null);
              }}
              className="w-full py-2.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─ SCREEN 3: Main login form ──
  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00AAFF]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="relative z-10 w-full max-w-md p-8 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/30 to-transparent" />
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome back</h1>
          <p className="text-neutral-400">Enter your credentials to access your account</p>
        </div>
        <div className="space-y-6 relative z-10">
          <div className="flex flex-col gap-3">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  setError('Google Sign In failed.');
                }}
                theme="filled_black"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="384"
              />
            </div>
            <button
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 border border-white/10 bg-black/20 rounded-xl hover:bg-white/5 hover:border-white/20 transition-all text-neutral-300 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Github className="w-5 h-5 text-white" />
              Continue with GitHub
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-neutral-950 text-neutral-500 font-medium">Or continue with email</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-2 items-start font-medium animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all placeholder:text-neutral-600 font-medium"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Password</label>
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-xs font-bold text-[#00AAFF] hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all placeholder:text-neutral-600 font-medium"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold text-sm tracking-wide hover:bg-white transition-all duration-200 shadow-lg shadow-[#00AAFF]/25 hover:shadow-white/10 hover:scale-[1.02] active:scale-[0.98] mt-6 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          <p className="text-center text-sm text-neutral-400">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('signup')}
              className="font-bold text-[#00AAFF] hover:text-white transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}