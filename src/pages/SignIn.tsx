import { useState } from 'react';
import { Mail, Lock, ArrowRight, Github, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface SignInProps {
  onNavigate: (page: string) => void;
}

export default function SignIn({ onNavigate }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleGoogleLogin = async () => {
    // Mock Google Login
    const success = await login('google-user@gmail.com', 'google-auth-token');
    if (success) {
      onNavigate('home');
    }
  };

  const handleGithubLogin = async () => {
    // Mock GitHub Login
    const success = await login('github-user@github.com', 'github-auth-token');
    if (success) {
      onNavigate('home');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await login(email, password);
    if (success) {
      onNavigate('home');
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 bg-white/60 backdrop-blur-xl border border-neutral-200 rounded-3xl shadow-xl shadow-neutral-200/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2 tracking-tight">Welcome back</h1>
          <p className="text-neutral-500">Enter your credentials to access your account</p>
        </div>

        <div className="space-y-6">
          {/* Social Logins */}
          <div className="flex gap-4">
            <button 
              onClick={handleGoogleLogin}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors text-neutral-700 font-medium"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button 
              onClick={handleGithubLogin}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors text-neutral-700 font-medium"
            >
              <Github className="w-5 h-5" />
              GitHub
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-neutral-500">Or continue with</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-neutral-400"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-700">Password</label>
                <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-neutral-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-neutral-200/50 active:scale-[0.98] group mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500">
            Don't have an account?{' '}
            <button 
              onClick={() => onNavigate('signup')} 
              className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline transition-all"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
