import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { oauthHelpers } from '../lib/api';
import { Loader2 } from 'lucide-react';

interface OAuthCallbackProps {
  onNavigate: (page: string) => void;
}

export default function OAuthCallback({ onNavigate }: OAuthCallbackProps) {
  const { oauthLogin } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const callbackData = oauthHelpers.parseOAuthCallback();

      if (!callbackData) {
        console.error('Invalid OAuth callback');
        onNavigate('signin');
        return;
      }

      const { provider, code } = callbackData;

      // Send code to backend for processing
      const success = await oauthLogin({
        provider,
        code,
        email: '', // Backend will extract this from the OAuth provider
      });

      if (success) {
        onNavigate('home');
      } else {
        onNavigate('signin');
      }
    };

    handleCallback();
  }, [oauthLogin, onNavigate]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#00AAFF] mx-auto mb-4" />
        <p className="text-neutral-400">Completing authentication...</p>
      </div>
    </div>
  );
}