// pages/Profile.tsx

import { useState, useEffect } from 'react';
import { authAPI } from '../lib/api';
import type { User, UserProfile, SubscriptionRecord, PaymentRecord } from '../lib/api'; // Safe type-only imports [1.1.9, 1.3.1]
import { developerAPI } from '../lib/developer_api';
import type { ApiKeyRecord } from '../lib/developer_api';
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
  Clock,
  Terminal, 
  Key, 
  Copy,
  ChevronRight,
  LogOut
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

  // ─── Developer Keys Management States ───
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyRecord, setNewKeyRecord] = useState<ApiKeyRecord | null>(null);
  const [keyNameInput, setKeyNameInput] = useState('');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Fetch API keys on mount
  const loadApiKeys = async () => {
    try {
      const response = await developerAPI.listApiKeys();
      if (response.success && response.data) {
        setApiKeys(response.data as any);
      }
    } catch (err) {
      console.warn('[Profile] Failed to fetch API keys on startup:', err);
    }
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  const handleCopyClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyNameInput.trim()) return;
    setIsGeneratingKey(true);
    setKeyError(null);

    try {
      const response = await developerAPI.createApiKey(keyNameInput.trim());
      setIsGeneratingKey(false);

      if (response.success && response.data) {
        setNewKeyRecord(response.data.key);
        setKeyNameInput('');
        setShowKeyModal(true);
        loadApiKeys(); // Refresh key listings
      } else {
        setKeyError(response.error || 'Failed to generate key.');
      }
    } catch (err) {
      setIsGeneratingKey(false);
      setKeyError('An unexpected connection error occurred.');
    }
  };

  const handleRevokeKey = async (id: string) => {
    const confirmRevoke = window.confirm('Are you sure you want to revoke this API key? Any software relying on this key (like After Effects) will stop working immediately.');
    if (!confirmRevoke) return;

    try {
      const response = await developerAPI.revokeApiKey(id);
      if (response.success) {
        loadApiKeys(); // Refresh key listings
      }
    } catch (err) {
      console.error('[Profile] Failed to revoke API key:', err);
    }
  };

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

  const totalBalance = (profile as any).current_credit_balance ?? (profile as any).credits ?? 0;
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
        window.location.reload();
      } else {
        setCancelError(response.error || 'Failed to cancel subscription.');
      }
    } catch (err) {
      setIsCancelling(false);
      setCancelError('An unexpected connection error occurred.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ─── LEFT COLUMN: IDENTITY, ACTIONS, & BILLING LEDGER (Span 5 of 12) ─── */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Profile Identity Card (No Image Placeholder) */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Username</p>
              <h1 className="text-3xl font-black text-white tracking-tight">{profile.username}</h1>
              <p className="text-sm text-neutral-400 font-semibold select-all">{user.email}</p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="px-4 py-1.5 bg-[#00AAFF]/15 border border-[#00AAFF]/30 text-[#00AAFF] text-[10px] font-black tracking-widest uppercase rounded-full">
                {planDetails.badge} Account
              </span>
            </div>

            <div className="border-t border-white/10 pt-5 space-y-3.5 text-xs">
              <div className="flex justify-between items-center bg-black/10 p-3 rounded-xl border border-white/5">
                <span className="text-neutral-500 font-bold uppercase tracking-wider text-[9px]">Auth Provider</span>
                <span className="text-white font-semibold capitalize flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#00AAFF]" />
                  {user.auth_provider}
                </span>
              </div>
              <div className="flex justify-between items-center bg-black/10 p-3 rounded-xl border border-white/5">
                <span className="text-neutral-500 font-bold uppercase tracking-wider text-[9px]">Account Type</span>
                <span className="text-white font-semibold capitalize">{profile.user_type}</span>
              </div>
              {profile.company_name && (
                <div className="flex justify-between items-center bg-black/10 p-3 rounded-xl border border-white/5">
                  <span className="text-neutral-500 font-bold uppercase tracking-wider text-[9px]">Company</span>
                  <span className="text-white font-semibold">{profile.company_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Menu Actions */}
          <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-4 shadow-xl space-y-2">
            <button
              onClick={() => onNavigate('home')}
              className="w-full px-4 py-3 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold text-sm hover:bg-white transition-all flex items-center justify-between group"
            >
              <span>Back to Home Workspace</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-between group"
            >
              <span>{activePlanCode === 'free' ? 'Upgrade Plan' : 'Buy More Credits'}</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={onLogout}
              className="w-full px-4 py-3 border border-red-500/20 text-red-400/80 hover:text-red-400 rounded-xl font-bold text-sm hover:bg-red-500/10 transition-all flex items-center justify-between group"
            >
              <span>Log Out</span>
              <LogOut className="w-4 h-4 text-red-500/50 group-hover:text-red-400" />
            </button>
          </div>

          {/* ─── MOVED: Billing History Ledger (Positioned Below Logout Area) ─── */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <Clock className="w-5 h-5 text-[#00AAFF]" />
              <h2 className="text-base font-bold text-white">Billing History Ledger</h2>
            </div>

            {payments.length === 0 ? (
              <div className="p-6 text-center bg-black/20 border border-white/5 rounded-xl">
                <p className="text-xs text-neutral-500">No payment transactions found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-white/5 rounded-xl bg-black/20">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="p-3 font-bold text-neutral-500 uppercase tracking-widest text-[9px]">Date</th>
                      <th className="p-3 font-bold text-neutral-500 uppercase tracking-widest text-[9px]">Amount</th>
                      <th className="p-3 font-bold text-neutral-500 uppercase tracking-widest text-[9px]">Credits</th>
                      <th className="p-3 font-bold text-neutral-500 uppercase tracking-widest text-[9px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-neutral-300 font-medium">
                    {payments.slice(0, 8).map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-3">{formatDate(tx.created_at)}</td>
                        <td className="p-3 font-bold text-white">{tx.amount} {tx.currency_code}</td>
                        <td className="p-3 font-bold text-[#00AAFF]">
                          {tx.credits_added !== null 
                            ? `+${tx.credits_added}` 
                            : (tx.payment_type === 'subscription' ? '+500/mo' : '-')}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${
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
        </div>

        {/* ─── RIGHT COLUMN: MAIN INTERACTIVE DETAILS (Span 7 of 12) ─── */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Credits Dashboard */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <CreditCard className="w-5 h-5 text-[#00AAFF]" />
              <h2 className="text-lg font-bold text-white">Credit Balance</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-black/20 border border-white/5 rounded-2xl p-5 space-y-1">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Subscription Allowance</p>
                <p className="text-3xl font-black text-white">{subscriptionBalance}</p>
                <p className="text-[10px] text-neutral-500 font-medium">Expires on period reset</p>
              </div>

              <div className="bg-black/20 border border-white/5 rounded-xl p-5">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Non-Expiring Top-Ups</p>
                <p className="text-3xl font-black text-neutral-300">{purchasedBalance}</p>
                <p className="text-xs text-neutral-500 mt-1">Never expires</p>
              </div>

              <div className="bg-[#00AAFF]/10 border border-[#00AAFF]/20 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00AAFF]/10 rounded-full blur-2xl pointer-events-none" />
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Available Balance</p>
                <p className="text-3.5xl font-black text-green-400 leading-none">{availableCredits}</p>
                <p className="text-xs text-neutral-500 mt-2 font-medium">Ready to use</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div className="p-4 bg-black/20 border border-white/5 rounded-xl">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Total Credits Used</p>
                <p className="text-xl font-bold text-white">{profile.total_credits_used}</p>
              </div>
              <div className="p-4 bg-black/20 border border-white/5 rounded-xl">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Locked Reserved Hold</p>
                <p className={`text-xl font-bold ${reservedCredits > 0 ? 'text-yellow-400' : 'text-neutral-500'}`}>{reservedCredits}</p>
              </div>
            </div>

            {profile.is_blocked && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold">Your account is currently blocked from launching remote workers. Please contact support.</span>
              </div>
            )}
          </div>

          {/* Active Plan Specifications Card */}
          <div className="p-6 rounded-3xl bg-[#00AAFF]/[0.01] border border-white/10 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-[#00AAFF]" />
                <h2 className="text-lg font-bold text-white">Active Plan Specifications</h2>
              </div>
              {hasActiveSub && (
                <button
                  onClick={() => setShowWarningModal(true)}
                  className="px-4 py-1.5 border border-red-500/30 text-red-400/80 hover:text-red-400 rounded-full text-xs font-bold hover:bg-red-500/10 transition-all"
                >
                  Cancel Plan subscription
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white mb-1">{planDetails.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">You are currently assigned the {planDetails.title}. See features and parameters below.</p>
              </div>

              {hasActiveSub && subscription && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-black/20 border border-white/5 text-xs text-neutral-300">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#00AAFF]" />
                    <span>
                      Billing cycle: <strong className="text-white capitalize">{subscription.billing_cycle}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#00AAFF]" />
                    <span>
                      {subscription.cancel_at_period_end ? 'Expires on: ' : 'Renews on: '}
                      <strong className="text-white">{formatDate(subscription.current_period_end)}</strong>
                    </span>
                  </div>

                  {subscription.cancel_at_period_end && (
                    <div className="sm:col-span-2 flex items-center gap-2.5 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-medium">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>Your subscription will terminate on {formatDate(subscription.current_period_end)}. Renew to keep Pro privileges.</span>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Included Features</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {planDetails.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-xs text-neutral-400">
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

          {/* Developer Settings & API Keys Panel */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-[#00AAFF]" />
                <h2 className="text-lg font-bold text-white">Developer Settings</h2>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                Generate secure secret keys to authenticate third-party software integrations (like your After Effects Plugin or Blender pipelines) directly with your Ixnel account balance.
              </p>

              {/* In-Line Key Generator Form */}
              <form onSubmit={handleGenerateKey} className="flex gap-3 max-w-lg">
                <input
                  type="text"
                  value={keyNameInput}
                  onChange={(e) => setKeyNameInput(e.target.value)}
                  placeholder="e.g. After Effects Workstation"
                  disabled={isGeneratingKey}
                  className="flex-1 px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all placeholder:text-neutral-700 font-medium"
                />
                <button
                  type="submit"
                  disabled={isGeneratingKey || !keyNameInput.trim()}
                  className="px-5 py-2.5 bg-[#00AAFF] hover:bg-white text-neutral-950 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isGeneratingKey ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      Generate Key
                    </>
                  )}
                </button>
              </form>

              {keyError && (
                <p className="text-xs font-semibold text-red-400 animate-in fade-in">{keyError}</p>
              )}

              {/* Keys Listing Table */}
              {apiKeys.length === 0 ? (
                <p className="text-xs text-neutral-600 font-bold italic pt-2">No active API keys found on this profile.</p>
              ) : (
                <div className="overflow-hidden border border-white/5 rounded-xl bg-black/30">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        <th className="p-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Key Name</th>
                        <th className="p-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Prefix</th>
                        <th className="p-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Last Used</th>
                        <th className="p-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-neutral-300 font-semibold">
                      {apiKeys.map((key) => (
                        <tr key={key.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-3.5 font-bold text-white">{key.key_name}</td>
                          <td className="p-3.5 font-mono text-neutral-400 select-all">{key.key_prefix}</td>
                          <td className="p-3.5 text-neutral-500 font-medium">
                            {key.last_used_at ? formatDate(key.last_used_at) : 'Never used'}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRevokeKey(key.id)}
                              className="text-red-400 hover:text-red-500 font-bold transition-colors"
                            >
                              Revoke Key
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

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
                Money consumed for credits up to now **will not be refunded**. However, all credits you have already acquired will remain fully available in your account.
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

      {/* ─── OVERLAY 3: Secure Single-View Secret Key Modal ─── */}
      {showKeyModal && newKeyRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-8 bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl space-y-6 overflow-hidden text-center">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/50 to-transparent" />
            
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-[#00AAFF]/10 border border-[#00AAFF]/30 flex items-center justify-center animate-bounce">
                <Shield className="w-7 h-7 text-[#00AAFF]" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white tracking-tight">API Key Generated! 🎉</h3>
              <p className="text-neutral-400 text-xs leading-relaxed px-2">
                Copy this key immediately. For security reasons, your raw key is encrypted and **will never be shown to you again** [2].
              </p>
            </div>

            {/* Raw API Key Secure Box */}
            <div className="flex items-center gap-2 p-3 bg-black border border-white/10 rounded-xl relative overflow-hidden">
              <div className="flex-1 text-left font-mono text-[11px] text-yellow-400 tracking-wider font-bold truncate pr-8 select-all">
                {newKeyRecord.raw_key}
              </div>
              <button
                type="button"
                onClick={() => handleCopyClipboard(newKeyRecord.raw_key || '', newKeyRecord.id)}
                className="absolute right-3 p-1.5 hover:bg-white/5 rounded-md text-neutral-400 hover:text-white transition-colors"
                title="Copy secret key"
              >
                {copiedKeyId === newKeyRecord.id ? (
                  <Check className="w-4 h-4 text-green-400 animate-in zoom-in-95" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowKeyModal(false);
                setNewKeyRecord(null);
              }}
              className="w-full py-3 bg-[#00AAFF] text-neutral-950 hover:bg-white rounded-xl font-bold text-xs tracking-wide transition-all shadow-md shadow-[#00AAFF]/15"
            >
              I Have Saved This Key
            </button>
          </div>
        </div>
      )}

    </div>
  );
}