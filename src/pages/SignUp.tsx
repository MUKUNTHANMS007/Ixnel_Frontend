import { useState }                          from 'react';
import {
  Mail, Lock, User, ArrowRight,
  Github, Loader2, Building2, ChevronDown,
}                                            from 'lucide-react';
import { useAuthStore }                      from '../store/authStore';
import { GoogleLogin }                       from '@react-oauth/google';
import type { CredentialResponse }           from '@react-oauth/google';
import { oauthHelpers }                      from '../lib/api';
import { jwtDecode }                         from 'jwt-decode';

interface SignUpProps {
  onNavigate: (page: string) => void;
}

interface GoogleJwtPayload {
  sub            : string;
  email          : string;
  name           : string;
  picture?       : string;
  email_verified : boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// User type options
// ─────────────────────────────────────────────────────────────────────────────
const USER_TYPE_OPTIONS = [
  {
    value       : 'individual' as const,
    label       : 'Individual',
    description : 'Personal use / freelancer',
    icon        : User,
  },
  {
    value       : 'company' as const,
    label       : 'Company',
    description : 'Team or business account',
    icon        : Building2,
  },
];

export default function SignUp({ onNavigate }: SignUpProps) {

  // ── Form state ─────────────────────────────────────────────────────────────
  const [username,     setUsername]     = useState('');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [userType,     setUserType]     = useState<'individual' | 'company'>('individual');
  const [companyName,  setCompanyName]  = useState('');

  // ── OAuth pending state ────────────────────────────────────────────────────
  // When OAuth user is new, we need user_type before completing registration
  const [pendingOAuth, setPendingOAuth] = useState<{
    provider         : 'google' | 'github';
    provider_user_id : string;
    email            : string;
  } | null>(null);

  const [oauthUserType,    setOauthUserType]    = useState<'individual' | 'company'>('individual');
  const [oauthCompanyName, setOauthCompanyName] = useState('');

  const { register, oauthLogin, isLoading, error, clearError } = useAuthStore();

  // ── Google OAuth ───────────────────────────────────────────────────────────
  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;

    try {
      const decoded = jwtDecode<GoogleJwtPayload>(credentialResponse.credential);

      // Store pending OAuth - we need to ask user_type first
      setPendingOAuth({
        provider         : 'google',
        provider_user_id : decoded.sub,
        email            : decoded.email,
      });

    } catch (err) {
      console.error('Google login decode failed:', err);
    }
  };

  // ── Complete OAuth after user selects user_type ────────────────────────────
  const handleCompleteOAuth = async () => {
    if (!pendingOAuth) return;

    if (oauthUserType === 'company' && !oauthCompanyName.trim()) {
      return; // form validation handles display
    }

    const success = await oauthLogin({
      provider         : pendingOAuth.provider,
      provider_user_id : pendingOAuth.provider_user_id,
      email            : pendingOAuth.email,
      user_type        : oauthUserType,
      ...(oauthUserType === 'company'
        ? { company_name: oauthCompanyName.trim() }
        : {}
      ),
    });

    if (success) {
      onNavigate('home');
    }
  };

  // ── GitHub OAuth ───────────────────────────────────────────────────────────
  const handleGithubLogin = () => {
    oauthHelpers.initiateGithubLogin();
  };

  // ── Local register submit ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await register(
      username.trim(),
      email.trim(),
      password,
      userType,
      userType === 'company' ? companyName.trim() : undefined,
    );

    if (success) {
      onNavigate('home');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // If pending OAuth → show user_type selection modal/step
  // ─────────────────────────────────────────────────────────────────────────
  if (pendingOAuth) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00AAFF]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-md p-8 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/30 to-transparent" />

          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white mb-2">One last step</h1>
            <p className="text-neutral-400 text-sm">
              Tell us how you'll be using Ixnel
            </p>
            <p className="text-neutral-500 text-xs mt-1">
              Signing in as <span className="text-[#00AAFF]">{pendingOAuth.email}</span>
            </p>
          </div>

          <div className="space-y-5">
            {/* User type selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {USER_TYPE_OPTIONS.map(({ value, label, description, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setOauthUserType(value)}
                    className={`
                      p-4 rounded-xl border text-left transition-all
                      ${oauthUserType === value
                        ? 'border-[#00AAFF] bg-[#00AAFF]/10 text-white'
                        : 'border-white/10 bg-black/20 text-neutral-400 hover:border-white/20'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${oauthUserType === value ? 'text-[#00AAFF]' : ''}`} />
                    <div className="font-bold text-sm">{label}</div>
                    <div className="text-xs opacity-70 mt-0.5">{description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Company name - conditional */}
            {oauthUserType === 'company' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">
                  Company Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-neutral-500" />
                  </div>
                  <input
                    type="text"
                    value={oauthCompanyName}
                    onChange={(e) => setOauthCompanyName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all placeholder:text-neutral-600 font-medium"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
                {error}
              </div>
            )}

            {/* Confirm button */}
            <button
              type="button"
              onClick={handleCompleteOAuth}
              disabled={
                isLoading ||
                (oauthUserType === 'company' && !oauthCompanyName.trim())
              }
              className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold text-sm tracking-wide hover:bg-white transition-all duration-200 shadow-lg shadow-[#00AAFF]/25 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up account...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Back */}
            <button
              type="button"
              onClick={() => {
                setPendingOAuth(null);
                clearError();
              }}
              className="w-full text-center text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              ← Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Main signup form
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00AAFF]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/30 to-transparent" />

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Create an account</h1>
          <p className="text-neutral-400">Join Ixnel to start creating</p>
        </div>

        <div className="space-y-6 relative z-10">

          {/* ── Social Logins ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => console.error('Google Login Failed')}
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
              <span className="px-3 bg-neutral-950 text-neutral-500 font-medium">
                Or continue with email
              </span>
            </div>
          </div>

          {/* ── Error ─────────────────────────────────────────────────── */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
              {error}
            </div>
          )}

          {/* ── Form ──────────────────────────────────────────────────── */}
          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Account type selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {USER_TYPE_OPTIONS.map(({ value, label, description, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setUserType(value)}
                    className={`
                      p-3 rounded-xl border text-left transition-all
                      ${userType === value
                        ? 'border-[#00AAFF] bg-[#00AAFF]/10 text-white'
                        : 'border-white/10 bg-black/20 text-neutral-400 hover:border-white/20'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 mb-1.5 ${userType === value ? 'text-[#00AAFF]' : ''}`} />
                    <div className="font-bold text-sm">{label}</div>
                    <div className="text-xs opacity-70">{description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all placeholder:text-neutral-600 font-medium"
                  placeholder="john_doe"
                />
              </div>
            </div>

            {/* Company name - conditional */}
            {userType === 'company' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">
                  Company Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-neutral-500" />
                  </div>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required={userType === 'company'}
                    className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all placeholder:text-neutral-600 font-medium"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all placeholder:text-neutral-600 font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">
                Password
              </label>
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
                  className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all placeholder:text-neutral-600 font-medium"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1 ml-1">
                Must be at least 8 characters long.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                isLoading ||
                (userType === 'company' && !companyName.trim())
              }
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