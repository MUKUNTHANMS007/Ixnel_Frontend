import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Building2, HelpCircle, ArrowRight, Sparkles, Shield, Cpu, Layers } from 'lucide-react';

interface PricingPlan {
  name: string;
  price: {
    monthly: string;
    yearly: string;
    oneTime?: string;
  };
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  icon: React.ReactNode;
}

const animatorPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: { monthly: "$0", yearly: "$0" },
    description: "Perfect for hobbyists exploring AI animation for the first time.",
    icon: <Zap className="w-5 h-5" />,
    features: [
      "5 Generations / month",
      "Standard Resolution (720p)",
      "Standard AI Interpolation",
      "Community Support",
      "Basic PSD Fallback Export",
      "Public Gallery Access",
    ],
    cta: "Start for Free",
  },
  {
    name: "Professional",
    price: { monthly: "$29", yearly: "$24" },
    description: "For professional creators who need high-fidelity results.",
    icon: <Crown className="w-5 h-5" />,
    popular: true,
    features: [
      "Unlimited Generations",
      "4K Ultra High Fidelity",
      "Fine-Tuned Character Weights",
      "Real Layered PSD Export",
      "Model Personalization (5 Characters)",
      "Priority GPU Queue Access",
      "Advanced AI Motion Smoothing",
    ],
    cta: "Upgrade to Pro",
  },
  {
    name: "Studio",
    price: { monthly: "Custom", yearly: "Custom" },
    description: "Dedicated infrastructure for animation studios.",
    icon: <Building2 className="w-5 h-5" />,
    features: [
      "Private API Endpoints",
      "Multi-User Team License",
      "Custom Model Training",
      "On-Premise Private Cluster",
      "Dedicated Solutions Architect",
      "SLA & Custom Contracts",
      "White-label Exports",
    ],
    cta: "Contact Sales",
  },
];

const nonAnimatorPlans: PricingPlan[] = [
  {
    name: "Casual",
    price: { monthly: "$9", yearly: "$7" },
    description: "For simple AI-assisted visuals and quick renders.",
    icon: <Sparkles className="w-5 h-5" />,
    features: [
      "20 Generations / month",
      "Standard HD Resolution",
      "Basic AI Enhancement",
      "Cloud Storage (10GB)",
      "Standard Support",
    ],
    cta: "Get Started",
  },
  {
    name: "Credit Pack",
    price: { monthly: "$15", yearly: "$15", oneTime: "$15" },
    description: "One-time credit recharge. No subscription required.",
    icon: <Layers className="w-5 h-5" />,
    popular: true,
    features: [
      "50 Generation Credits",
      "Never Expires",
      "4K Rendering Support",
      "Priority Single Queue",
      "Easy UPI/Card Checkout",
    ],
    cta: "Buy Credits",
  },
];

const faqs = [
  {
    q: "How does 'Model Personalization' work?",
    a: "Our engine analyzes your character sheet (PSD/CLIP) to ensure the AI maintains consistent details across every frame.",
  },
  {
    q: "Can I cancel my subscription at any time?",
    a: "Yes! There are no long-term contracts for Monthly plans. If you choose Yearly, you save 20% on professional rendering power.",
  },
  {
    q: "What payment methods do you support?",
    a: "We currently support Credit/Debit cards via Razorpay for domestic and international payments. UPI and other local methods are being integrated.",
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [segment, setSegment] = useState<'animator' | 'non-animator'>('animator');

  const currentPlans = segment === 'animator' ? animatorPlans : nonAnimatorPlans;

  return (
    <div className="w-full min-h-screen bg-neutral-950 relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-[#00AAFF]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#00AAFF]/4 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-32 relative z-10">

        {/* ─── Header ─── */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00AAFF]/10 border border-[#00AAFF]/20 text-[#00AAFF] text-xs font-bold tracking-widest uppercase mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00AAFF] animate-pulse" />
            Flexible Pricing for Everyone
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 leading-none"
          >
            Pick your{' '}
            <span className="text-[#00AAFF]">Power tier.</span>
          </motion.h1>

          {/* Segment Selector */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center p-1.5 bg-white/[0.04] border border-white/10 rounded-2xl w-fit mx-auto mb-10"
          >
            {(['animator', 'non-animator'] as const).map((seg) => (
              <button
                key={seg}
                onClick={() => setSegment(seg)}
                className={`px-7 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  segment === seg
                    ? 'bg-[#00AAFF] text-neutral-950 shadow-lg shadow-[#00AAFF]/20'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {seg === 'animator' ? 'Animator Segment' : 'Non-Animators'}
              </button>
            ))}
          </motion.div>

          <p className="text-lg text-neutral-500 max-w-xl mx-auto">
            Tailored plans for professional creators and casual enthusiasts alike.
          </p>

          {/* Billing Toggle */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={`text-sm font-bold transition-colors ${!isYearly ? 'text-white' : 'text-neutral-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="w-14 h-7 bg-white/[0.06] border border-white/10 rounded-full p-1 relative transition-all hover:border-[#00AAFF]/40"
            >
              <div
                className={`w-5 h-5 bg-[#00AAFF] rounded-full shadow-md shadow-[#00AAFF]/30 transition-transform duration-300 ${
                  isYearly ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-bold transition-colors flex items-center gap-2 ${isYearly ? 'text-white' : 'text-neutral-500'}`}>
              Yearly
              <span className="text-[#00AAFF] bg-[#00AAFF]/10 border border-[#00AAFF]/20 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* ─── Pricing Cards ─── */}
        <div className={`grid grid-cols-1 md:grid-cols-${currentPlans.length} gap-6 mb-32 max-w-6xl mx-auto`}>
          {currentPlans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -6 }}
              className={`relative p-8 rounded-3xl border flex flex-col items-start overflow-hidden ${
                plan.popular
                  ? 'border-[#00AAFF]/30 bg-[#00AAFF]/5 shadow-2xl shadow-[#00AAFF]/10'
                  : 'border-white/5 bg-white/[0.03]'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 px-5 py-1 bg-[#00AAFF] text-neutral-950 text-[10px] font-black rounded-b-xl tracking-widest uppercase shadow-lg shadow-[#00AAFF]/30">
                  Most Popular
                </div>
              )}

              {/* Top edge glow for popular */}
              {plan.popular && (
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/70 to-transparent" />
              )}

              {/* Icon */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-6 mt-4 border transition-all ${
                plan.popular
                  ? 'bg-[#00AAFF]/15 border-[#00AAFF]/30 text-[#00AAFF]'
                  : 'bg-white/[0.06] border-white/10 text-neutral-400'
              }`}>
                {plan.icon}
              </div>

              <h3 className="text-xl font-black text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-neutral-500 font-medium mb-7 leading-relaxed">{plan.description}</p>

              <div className="flex items-baseline gap-1 mb-7">
                <span className="text-4xl font-black text-white">
                  {isYearly ? plan.price.yearly : plan.price.monthly}
                </span>
                {plan.price.monthly !== 'Custom' && (
                  <span className="text-neutral-500 font-semibold text-sm">/mo</span>
                )}
              </div>

              <button
                className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 mb-8 ${
                  plan.popular
                    ? 'bg-[#00AAFF] text-neutral-950 hover:bg-white shadow-lg shadow-[#00AAFF]/25'
                    : 'bg-white/[0.07] text-white border border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="space-y-3.5 w-full">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-neutral-400 font-medium">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                      plan.popular
                        ? 'bg-[#00AAFF]/10 border-[#00AAFF]/25 text-[#00AAFF]'
                        : 'bg-white/[0.05] border-white/10 text-neutral-500'
                    }`}>
                      <Check className="w-3 h-3" />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── Feature Comparison ─── */}
        <section className="mb-32">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00AAFF]/10 border border-[#00AAFF]/20 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00AAFF]" />
              <span className="text-xs font-bold tracking-widest uppercase text-[#00AAFF]">Platform</span>
            </div>
            <h2 className="text-3xl font-black text-white">Compare capabilities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Shield className="w-5 h-5" />, title: "Secure Pipeline", desc: "Private sessions and encrypted scene storage." },
              { icon: <Cpu className="w-5 h-5" />, title: "GPU Clusters", desc: "Instantly queue your frames on our high-speed networks." },
              { icon: <Layers className="w-5 h-5" />, title: "Multilayer PSD", desc: "The only AI engine providing native .PSD output." },
              { icon: <Check className="w-5 h-5" />, title: "Verified Results", desc: "Advanced motion vectors for smooth frame consistency." },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group p-6 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-[#00AAFF]/5 hover:border-[#00AAFF]/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-neutral-500 mb-4 group-hover:text-[#00AAFF] group-hover:border-[#00AAFF]/20 transition-all">
                  {f.icon}
                </div>
                <h4 className="font-bold text-white mb-2 text-sm">{f.title}</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── FAQs ─── */}
        <section className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white">Questions? We have answers.</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="p-6 rounded-2xl border border-white/5 bg-white/[0.03] hover:border-[#00AAFF]/15 transition-all"
              >
                <h4 className="flex items-center gap-3 font-bold text-white mb-3">
                  <HelpCircle className="w-5 h-5 text-[#00AAFF] flex-shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-neutral-500 text-sm leading-relaxed pl-8">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
