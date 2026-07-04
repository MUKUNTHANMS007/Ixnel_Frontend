// pages/SignUp.tsx

import { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  Github,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';

import { authAPI } from '../lib/api';

interface SignUpProps {
  onNavigate: (page: string) => void;
  onAuthSuccess: () => void;
}

interface PendingOAuthUser {
  provider: 'google' | 'github';
  email: string;
  sub?: string;   // Google sub OR completed GitHub provider_user_id
  code?: string;  // Raw GitHub auth code
}

export default function SignUp({ onNavigate, onAuthSuccess }: SignUpProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'individual' | 'company'>('individual');
  const [companyName, setCompanyName] = useState('Null');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showSuccess, setShowSuccess] = useState({
    email: '',
    username: '',
    user_type: '',
    company_name: '',
    isShown: false,
  });

  const [pendingOAuthUser, setPendingOAuthUser] = useState<PendingOAuthUser | null>(null);
  const [oauthUserType, setOauthUserType] = useState<'individual' | 'company'>('individual');
  const [oauthCompanyName, setOauthCompanyName] = useState('');

  const isFormValid = () => {
    if (!email.trim() || !password.trim() || !username.trim()) return false;
    if (password.length < 8) return false;
    if (userType === 'company' && !companyName.trim()) return false;
    return true;
  };

  const passwordStrength = password.length >= 8
    ? password.length >= 12
      ? 'strong'
      : 'medium'
    : 'weak';

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
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
          onAuthSuccess();

          setShowSuccess({
            email: decoded.email,
            username: response.data.profile?.username || 'user',
            user_type: response.data.profile?.user_type || 'individual',
            company_name: response.data.profile?.company_name || 'Null',
            isShown: true,
          });
        }
      } else {
        setError(response.error || 'Google Sign In failed.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('An error occurred during Google Sign In.');
    }
  };

  // ─ Complete Google/GitHub OAuth signup with onboarding payload ─────────────
  const completeOAuthSignup = async () => {
    if (!pendingOAuthUser) return;
    if (oauthUserType === 'company' && !oauthCompanyName.trim()) return;

    console.log('[SignUp] Completing OAuth Registration:', {
      provider: pendingOAuthUser.provider,
      userType: oauthUserType,
    });

    setIsLoading(true);
    setError(null);

    // Clean, dynamic payload mapping matching SignIn.tsx precisely
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
        onAuthSuccess(); // Sync menu state immediately

        setPendingOAuthUser(null);
        onNavigate('home');
      } else {
        setError(response.error || 'Failed to complete OAuth registration');
      }
    } catch (err) {
      setIsLoading(false);
      setError('An unexpected connection error occurred.');
    }
  };

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
        console.log('[SignUp] GitHub Code successfully received directly:', code);
        
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
              setPendingOAuthUser({
                provider: 'github',
                email: response.data.email || 'Retrieving email...',
                sub: response.data.provider_user_id!,
              });
            } else {
              if (response.data.accessToken) localStorage.setItem('accessToken', response.data.accessToken);
              if (response.data.refreshToken) localStorage.setItem('refreshToken', response.data.refreshToken);
              onAuthSuccess();

              onNavigate('home');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    console.log('[SignUp] Submitting Local Registration Form');

    setIsLoading(true);
    setError(null);

    const payload = {
      username: username.trim(),
      email: email.trim(),
      password,
      user_type: userType,
      company_name: userType === 'company' ? companyName.trim() : 'Null',
    };

    try {
      const response = await authAPI.register(payload);
      setIsLoading(false);

      // ⚠️ MODIFICATION: Success response triggers a prompt to check inbox — no tokens are saved yet until verification occurs
      if (response.success) {
        setShowSuccess({
          email: email.trim(),
          username: username.trim(),
          user_type: userType.trim(),
          company_name: companyName.trim(),
          isShown: true,
        });

        setUsername('');
        setEmail('');
        setPassword('');
        setUserType('individual');
        setCompanyName('Null');
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (err) {
      setIsLoading(false);
      setError('An unexpected connection error occurred.');
    }
  };

  // Screen Rendering layout blocks are completely unchanged...
  if (showSuccess.isShown) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00AAFF]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 w-full max-w-md p-8 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/30 to-transparent" />
          <div className="text-center space-y-6 relative z-10 py-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-[#00AAFF]/20 border border-[#00AAFF]/40 flex items-center justify-center animate-pulse">
                <Mail className="w-8 h-8 text-[#00AAFF]" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Verify Your Inbox! 🚀</h2>
              <p className="text-neutral-400 text-sm">We sent an activation link to complete your signup.</p>
            </div>
            <div className="space-y-3 bg-black/30 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                <span className="text-sm text-neutral-300 select-all font-semibold">{showSuccess.email}</span>
              </div>
            </div>
            <p className="text-xs text-neutral-500 font-semibold leading-relaxed px-4">
              Please click the link inside that email to activate your <strong className="text-[#00AAFF] font-bold">Ixnel account workspace</strong> and start rendering. This link will remain valid for <strong className="text-[#00AAFF] font-bold">24 hours</strong>.
            </p>
            <div className="space-y-2 pt-4">
              <button
                onClick={() => {
                  setShowSuccess({ ...showSuccess, isShown: false });
                  onNavigate('signin');
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-sm tracking-wide transition-all duration-200"
              >
                Back to Sign In
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                Signed in as{' '}
                <span className="text-neutral-200 font-medium">{pendingOAuthUser.email}</span>
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

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00AAFF]/10 blur-[120px] rounded-full pointer-events-none" />
     <div className="relative z-10 w-full max-w-md p-8 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/30 to-transparent" />
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Create an account</h1>
          <p className="text-neutral-400">Join Ixnel to start creating</p>
        </div>
        <div className="space-y-6 relative z-10">
          <div className="flex flex-col gap-3">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  setError('Google Login failed.');
                }}
                useOneTap
                theme="filled_black"
                size="large"
                text="signup_with"
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
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-2 items-start font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="johndoe"
                  className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all placeholder:text-neutral-600 font-medium"
                />
              </div>
            </div>
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
                  className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all placeholder:text-neutral-600 font-medium"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all placeholder:text-neutral-600 font-medium"
                />
              </div>
              <div className="flex items-center gap-2 px-1">
                <div className="flex-1 h-1 rounded-full bg-neutral-700 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength === 'strong' ? '✓ Strong' : passwordStrength === 'medium' ? 'Medium' : 'Weak'
                    }`}
                  />
                </div>
                <span className="text-xs text-neutral-500">
                  {passwordStrength === 'strong' ? '✓ Strong' : passwordStrength === 'medium' ? 'Medium' : 'Weak'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 ml-1">Must be at least 8 characters long.</p>
            </div>
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Account Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUserType('individual');
                    setCompanyName('Null');
                  }}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all border ${
                    userType === 'individual'
                      ? 'bg-[#00AAFF]/20 border-[#00AAFF]/50 text-[#00AAFF]'
                      : 'bg-black/30 border-white/10 text-neutral-400 hover:bg-black/50'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-1.5" />
                  Individual
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserType('company');
                    setCompanyName('');
                  }}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all border ${
                    userType === 'company'
                      ? 'bg-[#00AAFF]/20 border-[#00AAFF]/50 text-[#00AAFF]'
                      : 'bg-black/30 border-white/10 text-neutral-400 hover:bg-black/50'
                  }`}
                >
                  <Building2 className="w-4 h-4 inline mr-1.5" />
                  Company
                </button>
              </div>
            </div>

            {userType === 'company' && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Company Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-neutral-500" />
                  </div>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    placeholder="Acme Corporation"
                    className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all placeholder:text-neutral-600 font-medium"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold text-sm tracking-wide hover:bg-white transition-all duration-200 shadow-lg shadow-[#00AAFF]/25 hover:shadow-white/10 hover:scale-[1.02] active:scale-[0.98] mt-6 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-400">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('signin')}
              className="font-bold text-[#00AAFF] hover:text-white transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}