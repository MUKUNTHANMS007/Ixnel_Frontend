// src/pages/ResetPassword.tsx

import { useState, useEffect } from 'react';
import {
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { authAPI } from '../lib/api';

interface ResetPasswordProps {
  onNavigate: (page: string) => void;
}

export default function ResetPassword({ onNavigate }: ResetPasswordProps) {
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Parse token parameters automatically on mount [1.2.4]
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Missing password reset token. Please request a new reset link.');
    }
  }, []);

  const isFormValid = () => {
    return newPassword.length >= 8 && newPassword === confirmPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Reset token is missing or invalid.');
      return;
    }

    // ⚠️ Explicit length validation check before processing
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.resetPassword(token, newPassword);
      setIsLoading(false);

      if (response.success) {
        setIsSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => onNavigate('signin'), 3000); // Redirect back to Sign In
      } else {
        setError(response.error || 'Failed to reset password.');
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
        
        {isSuccess ? (
          // ── Success Screen ──
          <div className="text-center space-y-6 relative z-10 py-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center animate-pulse">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Password Reset Complete! 🎉</h2>
              <p className="text-neutral-400 text-sm">
                Your credentials have been securely updated.
              </p>
            </div>
            
            <div className="space-y-2 pt-4">
              <button
                onClick={() => onNavigate('signin')}
                className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold text-sm tracking-wide hover:bg-white transition-all duration-200 shadow-lg shadow-[#00AAFF]/25"
              >
                Sign In Now
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-neutral-500">Auto-redirecting in 3 seconds...</p>
            </div>
          </div>
        ) : (
          // ── Main Form Screen ──
          <div className="space-y-6 relative z-10">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-[#00AAFF]/10 border border-[#00AAFF]/30 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-[#00AAFF]" />
                </div>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2">Configure Password</h1>
              <p className="text-neutral-400 text-sm">
                Set a secure, new password for your Ixnel profile.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-2 items-start font-medium animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!token ? (
              // If loaded without token, prevent form entry [1.2.4]
              <button
                onClick={() => onNavigate('forgot-password')}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-neutral-900 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-neutral-800 transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-yellow-500" />
                Request New Reset Link
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-neutral-500" />
                    </div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all placeholder:text-neutral-600 font-medium"
                    />
                  </div>
                  {/* Dynamic 8-character limit visual indicator */}
                  {newPassword && (
                    <p className={`text-[10px] ml-1 mt-1 font-semibold transition-colors duration-200 ${newPassword.length >= 8 ? 'text-green-400' : 'text-neutral-500'}`}>
                      {newPassword.length >= 8 ? '✓ Password is at least 8 characters' : '• Password must be at least 8 characters'}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-neutral-500" />
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all placeholder:text-neutral-600 font-medium"
                    />
                  </div>
                  {/* Dynamic password-match visual indicator */}
                  {confirmPassword && (
                    <p className={`text-[10px] ml-1 mt-1 font-semibold transition-colors duration-200 ${newPassword === confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                      {newPassword === confirmPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isFormValid()}
                  className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold text-sm tracking-wide hover:bg-white transition-all duration-200 shadow-lg shadow-[#00AAFF]/25 hover:scale-[1.02] active:scale-[0.98] mt-6 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}