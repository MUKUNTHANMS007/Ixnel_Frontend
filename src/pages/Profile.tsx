// pages/Profile.tsx

import type { User, UserProfile } from '../lib/api';
import { User as UserIcon, Mail, Building2, CreditCard, Shield } from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
  user: User | null;
  profile: UserProfile | null;
  onLogout: () => void;
}

export default function ProfilePage({ onNavigate, user, profile, onLogout }: ProfilePageProps) {
  // If session is still loading/missing, show generic fallback
  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-neutral-400 mb-4">No active profile session found.</p>
        <button
          onClick={() => onNavigate('signin')}
          className="px-6 py-2 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold hover:bg-white transition-all"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Calculate credits locally
  const availableCredits = profile.credits - profile.reserved_credits;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
          <div className="w-16 h-16 rounded-full bg-[#00AAFF]/20 border-2 border-[#00AAFF]/50 flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-[#00AAFF]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">{profile.username}</h1>
            <p className="text-neutral-400">{user.email}</p>
          </div>
        </div>

        {/* Account Info */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-black/20 border border-white/10 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-[#00AAFF]" />
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Email</p>
              </div>
              <p className="text-white font-semibold">{user.email}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {user.email_verified ? '✓ Verified' : '⚠ Not verified'}
              </p>
            </div>

            <div className="p-4 bg-black/20 border border-white/10 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-[#00AAFF]" />
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Auth Provider</p>
              </div>
              <p className="text-white font-semibold capitalize">{user.auth_provider}</p>
            </div>

            <div className="p-4 bg-black/20 border border-white/10 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <UserIcon className="w-5 h-5 text-[#00AAFF]" />
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Account Type</p>
              </div>
              <p className="text-white font-semibold capitalize">{profile.user_type}</p>
            </div>

            {profile.company_name && (
              <div className="p-4 bg-black/20 border border-white/10 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-[#00AAFF]" />
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Company</p>
                </div>
                <p className="text-white font-semibold">{profile.company_name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Credits Section */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-[#00AAFF]" />
            <h2 className="text-xl font-bold text-white">Credits</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#00AAFF]/10 border border-[#00AAFF]/20 rounded-xl p-6">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Total Credits</p>
              <p className="text-3xl font-black text-[#00AAFF]">{profile.credits}</p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Reserved</p>
              <p className="text-3xl font-black text-yellow-500">{profile.reserved_credits}</p>
              <p className="text-xs text-neutral-500 mt-1">In active jobs</p>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Available</p>
              <p className="text-3xl font-black text-green-500">{availableCredits}</p>
              <p className="text-xs text-neutral-500 mt-1">Ready to use</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-black/20 border border-white/10 rounded-xl">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Credits Used</p>
            <p className="text-2xl font-black text-white">{profile.total_credits_used}</p>
          </div>

          {profile.is_blocked && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 font-semibold">⚠️ Your account is currently blocked</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-3 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold hover:bg-white transition-all"
          >
            Back to Home
          </button>
          <button
            onClick={() => onNavigate('pricing')}
            className="px-6 py-3 border border-white/20 text-white rounded-xl font-bold hover:bg-white/5 transition-all"
          >
            Buy More Credits
          </button>
          <button
            onClick={onLogout}
            className="px-6 py-3 border border-red-500/30 text-red-400 rounded-xl font-bold hover:bg-red-500/10 transition-all ml-auto"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}