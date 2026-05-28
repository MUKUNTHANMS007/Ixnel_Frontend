// pages/OAuthCallback.tsx

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface OAuthCallbackProps {
  onNavigate: (page: string) => void;
}

export default function OAuthCallback({ onNavigate }: OAuthCallbackProps) {
  useEffect(() => {
    // 1. Extract 'code' from URL query params inside the popup
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      console.log('[OAuthCallback] Found authorization code, dispatching message to parent window.');
      
      // 2. Dispatch code back to the parent SignUp.tsx or SignIn.tsx window
      window.opener?.postMessage(
        { type: 'GITHUB_OAUTH_SUCCESS', code },
        window.location.origin
      );
    } else {
      console.error('[OAuthCallback] No authorization code found in URL');
      // If something goes wrong, navigate back to signin
      onNavigate('signin');
    }
  }, [onNavigate]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#00AAFF] mx-auto mb-4" />
        <p className="text-sm text-neutral-400 font-medium">Completing authentication...</p>
      </div>
    </div>
  );
}