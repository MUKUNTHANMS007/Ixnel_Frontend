// pages/Profile.tsx

import { useState } from 'react';
import { authAPI } from '../lib/api';
import type { User, UserProfile, SubscriptionRecord, PaymentRecord } from '../lib/api'; // Safe type-only imports [1.1.9, 1.3.1]
import { 
  User as UserIcon, 
  Mail, 
  Building2, 
  CreditCard, 
  Shield, 
  Crown, 
  Calendar, 
  AlertTriangle,
  Check,
  X,
  Loader2,
  Clock
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
  user: User | null;
  profile: UserProfile | null;
  subscription: SubscriptionRecord | null;
  payments: PaymentRecord[]; // Linked to your transaction ledger [1.2.4]
  onLogout: () => void;
}

interface PlanFeature {
  title: string;
  badge: string;
  features: string[];
}

const PLAN_TIER_DETAILS: Record<string, PlanFeature> = {
  free: {
    title: "Limited Plan",
    badge: "Limited",
    features: [
      "5 Generations / month",
      "Standard Resolution (720p)",
      "Standard AI Interpolation",
      "Community Support",
      "Basic PSD Fallback Export",
      "Public Gallery Access",
    ]
  },
  [import.meta.env.VITE_PADDLE_PRICE_ID_PRO_MONTHLY || 'pro_monthly']: {
    title: "Pro Creator (Monthly)",
    badge: "Pro",
    features: [
      "Unlimited Generations",
      "4K Ultra High Fidelity",
      "Fine-Tuned Character Weights",
      "Real Layered PSD Export",
      "Model Personalization (5 Characters)",
      "Priority GPU Queue Access",
      "Advanced AI Motion Smoothing",
    ]
  },
  [import.meta.env.VITE_PADDLE_PRICE_ID_PRO_YEARLY || 'pro_yearly']: {
    title: "Pro Creator (Yearly)",
    badge: "Pro",
    features: [
      "Unlimited Generations",
      "4K Ultra High Fidelity",
      "Fine-Tuned Character Weights",
      "Real Layered PSD Export",
      "Model Personalization (5 Characters)",
      "Priority GPU Queue Access",
      "Advanced AI Motion Smoothing",
    ]
  }
};

export default function ProfilePage({ onNavigate, user, profile, subscription, payments, onLogout }: ProfilePageProps) {
  const [showWarningModal, setShowWarningModal] = useState(false); // Overlay 1 [1.2.4]
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Overlay 2 [1.2.4]
  const [cancelInput, setCancelInput] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

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

  const hasActiveSub = subscription && ['active', 'trialing', 'past_due'].includes(subscription.subscription_status);
  const activePlanCode = hasActiveSub ? subscription.plan_code : 'free';
  const planDetails = PLAN_TIER_DETAILS[activePlanCode] || PLAN_TIER_DETAILS.free;

  const totalBalance = profile.credits;
  const subscriptionBalance = profile.subscription_credits;
  const purchasedBalance = profile.purchased_credits;
  const reservedCredits = profile.reserved_credits;
  const availableCredits = totalBalance - reservedCredits;

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  /**
   * Finalizes the cancellation sequence by calling the backend [1.2.4]
   */
  const handleFinalCancel = async () => {
    if (cancelInput !== 'CANCEL') return;
    setIsCancelling(true);
    setCancelError(null);

    try {
      const response = await authAPI.cancelSubscription();
      setIsCancelling(false);

      if (response.success) {
        setShowConfirmModal(false);
        setCancelInput('');
        window.location.reload(); // Instantly refreshes the session to show the cancelled plan status [1, 1.2.4]
      } else {
        setCancelError(response.error || 'Failed to cancel subscription.');
      }
    } catch (err) {
      setIsCancelling(false);
      setCancelError('An unexpected connection error occurred.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-8">
        
        {/* Profile Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-white/10">
          <div className="w-16 h-16 rounded-full bg-[#00AAFF]/20 border-2 border-[#00AAFF]/50 flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-[#00AAFF]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">{profile.username}</h1>
            <p className="text-neutral-400">{user.email}</p>
          </div>
        </div>

        {/* ─── Active Subscription Plan Details ─── */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00AAFF]/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-[#00AAFF]" />
              <h2 className="text-xl font-bold text-white">Active Plan</h2>
            </div>
            <div className="flex items-center gap-3">
              {hasActiveSub && (
                <button
                  onClick={() => setShowWarningModal(true)}
                  className="px-4 py-1.5 border border-red-500/30 text-red-400 rounded-full text-xs font-bold hover:bg-red-500/10 transition-all"
                >
                  Cancel Subscription
                </button>
              )}
              <span className="px-4 py-1.5 bg-[#00AAFF]/15 border border-[#00AAFF]/30 text-[#00AAFF] text-xs font-black tracking-widest uppercase rounded-full">
                {planDetails.badge} Tier
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">{planDetails.title}</h3>
              <p className="text-sm text-neutral-400 font-medium">You are currently on the {planDetails.title}. See features and parameters below.</p>
            </div>

            {hasActiveSub && subscription && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <Calendar className="w-4 h-4 text-[#00AAFF]" />
                  <span>
                    Billing cycle: <strong className="text-white capitalize">{subscription.billing_cycle}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <Calendar className="w-4 h-4 text-[#00AAFF]" />
                  <span>
                    {subscription.cancel_at_period_end ? 'Expires on: ' : 'Renews on: '}
                    <strong className="text-white">{formatDate(subscription.current_period_end)}</strong>
                  </span>
                </div>

                {subscription.cancel_at_period_end && (
                  <div className="sm:col-span-2 flex items-center gap-2.5 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Your subscription will terminate on {formatDate(subscription.current_period_end)}. Renew to keep Pro privileges.</span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-6 border-t border-white/5">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Included Features</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {planDetails.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-sm text-neutral-400">
                    <div className="w-4 h-4 rounded-full bg-[#00AAFF]/10 border border-[#00AAFF]/20 flex items-center justify-center text-[#00AAFF] flex-shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    {feat}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Account Information</h2>
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
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-[#00AAFF]" />
            <h2 className="text-xl font-bold text-white">Credits</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Subscription Allowance</p>
              <p className="text-3xl font-black text-neutral-300">{subscriptionBalance}</p>
              <p className="text-xs text-neutral-500 mt-1">Expires on period reset</p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Non-Expiring Top-Ups</p>
              <p className="text-3xl font-black text-neutral-300">{purchasedBalance}</p>
              <p className="text-xs text-neutral-500 mt-1">Never expires</p>
            </div>

            <div className="bg-[#00AAFF]/10 border border-[#00AAFF]/20 rounded-xl p-6">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Total Available Balance</p>
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

        {/* ─── Webhook Payments Audit Ledger Table ─── */}
        <div className="space-y-4 pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#00AAFF]" />
            <h2 className="text-xl font-bold text-white">Billing & Payment History</h2>
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center bg-black/20 border border-white/5 rounded-2xl">
              <p className="text-sm text-neutral-500">No payment transactions found on this account [1.2.4].</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-white/5 rounded-2xl bg-black/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Date</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Type</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Amount</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Credits</th>
                    <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-neutral-300">
                  {payments.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 font-medium">{formatDate(tx.created_at)}</td>
                      <td className="p-4 font-semibold capitalize">{tx.payment_type.replace('_', ' ')}</td>
                      <td className="p-4 font-bold text-white">{tx.amount} {tx.currency_code}</td>
                      
                      {/* Dynamically renders +500/mo for subscription payments to keep the ledger intuitive */}
                      <td className="p-4 font-bold text-[#00AAFF]">
                        {tx.credits_added !== null 
                          ? `+${tx.credits_added}` 
                          : (tx.payment_type === 'subscription' ? '+500/mo' : '-')}
                      </td>
                      
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          tx.payment_status === 'completed' 
                            ? 'bg-green-500/15 border border-green-500/30 text-green-400' 
                            : tx.payment_status === 'pending' || tx.payment_status === 'processing'
                              ? 'bg-yellow-500/15 border border-yellow-500/30 text-yellow-400'
                              : 'bg-red-500/15 border border-red-500/30 text-red-400'
                        }`}>
                          {tx.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Navigation CTAs */}
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
            {activePlanCode === 'free' ? 'Upgrade Plan' : 'Buy More Credits'}
          </button>
          <button
            onClick={onLogout}
            className="px-6 py-3 border border-red-500/30 text-red-400 rounded-xl font-bold hover:bg-red-500/10 transition-all ml-auto"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* ─── OVERLAY 1: Cancellation warning ─── */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-8 bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl space-y-6 text-center overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white tracking-tight">Are you sure? ⚠️</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Money consumed for credits up to now **will not be refunded** [1.2.4]. However, all credits you have already acquired will remain fully available in your account [1.2.4].
              </p>
              <p className="text-neutral-300 text-sm font-semibold pt-2">Do you wish to continue?</p>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setShowWarningModal(false)}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
              >
                No, Keep Plan
              </button>
              <button
                onClick={() => {
                  setShowWarningModal(false);
                  setShowConfirmModal(true); // Open Overlay 2 [1.2.4]
                }}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all"
              >
                Yes, Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── OVERLAY 2: Double-Confirm Text input ─── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-8 bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl space-y-6 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <h3 className="text-xl font-black text-white">Confirm Cancellation</h3>
              <button onClick={() => { setShowConfirmModal(false); setCancelInput(''); }} className="text-neutral-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {cancelError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-2 items-start font-medium animate-in fade-in">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{cancelError}</span>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-neutral-400 text-sm leading-relaxed">
                To confirm the cancellation, please type <strong className="text-red-400">"CANCEL"</strong> (in all caps) in the field below [1.2.4].
              </p>

              <input
                autoFocus
                type="text"
                value={cancelInput}
                onChange={(e) => setCancelInput(e.target.value)}
                placeholder="CANCEL"
                className="w-full px-5 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder:text-neutral-700 font-bold tracking-widest text-center uppercase"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => { setShowConfirmModal(false); setCancelInput(''); }}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
              >
                Go Back
              </button>
              <button
                onClick={handleFinalCancel}
                disabled={cancelInput !== 'CANCEL' || isCancelling}
                className="flex-1 py-3 bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}