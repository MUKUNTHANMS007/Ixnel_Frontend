import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Github, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface SignUpProps {
  onNavigate: (page: string) => void;
}

export default function SignUp({ onNavigate }: SignUpProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();

  const handleGoogleLogin = async () => {
    // Mock Google Login
    const success = await register('Google User', 'google-user@gmail.com', 'google-auth-token');
    if (success) {
      onNavigate('home');
    }
  };

  const handleGithubLogin = async () => {
    // Mock GitHub Login
    const success = await register('GitHub User', 'github-user@github.com', 'github-auth-token');
    if (success) {
      onNavigate('home');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await register(name, email, password);
    if (success) {
      onNavigate('home');
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00AAFF]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Subtle top edge glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/30 to-transparent" />

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Create an account</h1>
          <p className="text-neutral-400">Join Ixnel to start creating</p>
        </div>

        <div className="space-y-6 relative z-10">
          {/* Social Logins */}
          <div className="flex gap-4">
            <button 
              onClick={handleGoogleLogin}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/10 bg-black/20 rounded-xl hover:bg-white/5 hover:border-white/20 transition-all text-neutral-300 font-medium shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button 
              onClick={handleGithubLogin}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/10 bg-black/20 rounded-xl hover:bg-white/5 hover:border-white/20 transition-all text-neutral-300 font-medium shadow-sm"
            >
              <Github className="w-5 h-5 text-white" />
              GitHub
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-neutral-950 text-neutral-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-neutral-500" />
                </div>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all placeholder:text-neutral-600 font-medium"
                  placeholder="John Doe"
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
                  className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all placeholder:text-neutral-600 font-medium"
                  placeholder="name@company.com"
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
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all placeholder:text-neutral-600 font-medium"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1 ml-1">Must be at least 6 characters long.</p>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
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