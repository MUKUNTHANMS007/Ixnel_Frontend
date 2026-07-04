// src/pages/VerifyEmail.tsx

import { useEffect, useState, useRef } from 'react'; // ⚠️ MODIFICATION: Imported useRef
import { Check, X, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { authAPI } from '../lib/api';

interface VerifyEmailProps {
  onNavigate: (page: string) => void;
  onAuthSuccess: () => void;
}

export default function VerifyEmail({ onNavigate, onAuthSuccess }: VerifyEmailProps) {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // ⚠️ MODIFICATION: Lock ref to guarantee the API call only dispatches exactly once
  const hasRun = useRef(false);

  useEffect(() => {
    // ⚠️ MODIFICATION: Abort execution if the verification is already in progress or has completed
    if (hasRun.current) return;
    hasRun.current = true;

    const executeVerification = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        setStatus('error');
        setErrorMsg('Missing email verification token.');
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        setIsLoading(false);

        if (response.success && response.data) {
          // Save verified auth tokens to restore session
          if (response.data.accessToken) localStorage.setItem('accessToken', response.data.accessToken);
          if (response.data.refreshToken) localStorage.setItem('refreshToken', response.data.refreshToken);
          
          onAuthSuccess(); // Synchronize central auth state instantly
          setStatus('success');
          
          // Automatically redirect home after 3 seconds
          setTimeout(() => {
            onNavigate('home');
          }, 3000);
        } else {
          setStatus('error');
          setErrorMsg(response.error || 'Verification failed. Link may be expired.');
        }
      } catch (err) {
        setStatus('error');
        setErrorMsg('A connection error occurred. Please try again.');
      }
    };

    executeVerification();
  }, []);

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00AAFF]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="relative z-10 w-full max-w-md p-8 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/30 to-transparent" />
        
        <div className="text-center space-y-6 py-8 relative z-10">
          {status === 'verifying' && (
            <>
              <div className="flex justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#00AAFF]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Verifying your email...</h2>
                <p className="text-neutral-400 text-sm">Please wait while we confirm your credentials with our servers.</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center animate-bounce">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Email Verified! 🎉</h2>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Your Ixnel account is now <strong className="text-[#00AAFF] font-bold">fully active</strong>. Launching your creative workspace panel now...
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                  <X className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white tracking-tight">Verification Failed ⚠️</h2>
                <p className="text-red-400 text-sm font-semibold">{errorMsg}</p>
                <p className="text-neutral-500 text-xs leading-relaxed px-4 pt-2">
                  The activation link may be <strong className="text-white font-bold">expired</strong> (valid for 24 hours) or already <strong className="text-white font-bold">used</strong>. Please try signing up again.
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => onNavigate('signup')}
                  className="w-full flex items-center justify-center gap-2.5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-sm tracking-wide transition-all"
                >
                  Back to Sign Up
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}