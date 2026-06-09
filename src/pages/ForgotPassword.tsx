// src/pages/ForgotPassword.tsx

import { useState } from 'react';
import {
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { authAPI } from '../lib/api';

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
}

export default function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    console.log('[ForgotPassword] Requesting reset link for email:', email.trim());
    setIsLoading(true);

    try {
      const response = await authAPI.forgotPassword(email.trim().toLowerCase());
      setIsLoading(false);

      if (response.success) {
        setSuccessMessage(response.message || 'If that email exists, a reset link has been sent.');
        setEmail('');
      } else {
        setError(response.error || 'Failed to request password reset.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('An unexpected connection error occurred.');
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00AAFF]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="relative z-10 w-full max-w-md p-8 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/30 to-transparent" />
        
        {successMessage ? (
          // ── Success Screen ──
          <div className="text-center space-y-6 relative z-10 py-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center animate-pulse">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Email Dispatched! ✉️</h2>
              <p className="text-neutral-400 text-sm leading-relaxed px-4">
                We have sent a time-sensitive secure link to your inbox. Please check your spam folder if you do not receive it in 2 minutes.
              </p>
            </div>
            
            <button
              onClick={() => onNavigate('signin')}
              className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold text-sm tracking-wide hover:bg-white transition-all duration-200 shadow-lg shadow-[#00AAFF]/25 hover:shadow-white/10 hover:scale-[1.02] active:scale-[0.98]"
            >
              Back to Sign In
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          // ── Main Form Screen ──
          <div className="space-y-6 relative z-10">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-[#00AAFF]/10 border border-[#00AAFF]/30 flex items-center justify-center">
                  <KeyRound className="w-6 h-6 text-[#00AAFF]" />
                </div>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">Forgot Password</h1>
              <p className="text-neutral-400 text-sm">
                Enter your email address and we'll send you a time-sensitive link to reset your password.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-2 items-start font-medium animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold text-sm tracking-wide hover:bg-white transition-all duration-200 shadow-lg shadow-[#00AAFF]/25 hover:shadow-white/10 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <button
              onClick={() => onNavigate('signin')}
              className="w-full py-2.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors font-semibold flex items-center justify-center gap-2 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}