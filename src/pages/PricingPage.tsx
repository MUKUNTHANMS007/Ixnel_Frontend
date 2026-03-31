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
  color: string;
}

const animatorPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: { monthly: "$0", yearly: "$0" },
    description: "Perfect for hobbyists exploring AI animation for the first time.",
    icon: <Zap className="w-6 h-6" />,
    color: "emerald",
    features: [
      "5 Generations / month",
      "Standard Resolution (720p)",
      "Standard AI Interpolation",
      "Community Support",
      "Basic PSD Fallback Export",
      "Public Gallery Access"
    ],
    cta: "Start for Free"
  },
  {
    name: "Professional",
    price: { monthly: "$29", yearly: "$24" },
    description: "For professional creators who need high-fidelity results.",
    icon: <Crown className="w-6 h-6" />,
    color: "indigo",
    popular: true,
    features: [
      "Unlimited Generations",
      "4K Ultra High Fidelity",
      "Fine-Tuned Character Weights",
      "Real Layered PSD Export",
      "Model Personalization (5 Characters)",
      "Priority GPU Queue Access",
      "Advanced AI Motion Smoothing"
    ],
    cta: "Upgrade to Pro"
  },
  {
    name: "Studio",
    price: { monthly: "Custom", yearly: "Custom" },
    description: "Dedicated infrastructure for animation studios.",
    icon: <Building2 className="w-6 h-6" />,
    color: "purple",
    features: [
      "Private API Endpoints",
      "Multi-User Team License",
      "Custom Model Training",
      "On-Premise Private Cluster",
      "Dedicated Solutions Architect",
      "SLA & Custom Contracts",
      "White-label Exports"
    ],
    cta: "Contact Sales"
  }
];

const nonAnimatorPlans: PricingPlan[] = [
  {
    name: "Casual",
    price: { monthly: "$9", yearly: "$7" },
    description: "For simple AI-assisted visuals and quick renders.",
    icon: <Sparkles className="w-6 h-6" />,
    color: "amber",
    features: [
      "20 Generations / month",
      "Standard HD Resolution",
      "Basic AI Enhancement",
      "Cloud Storage (10GB)",
      "Standard Support"
    ],
    cta: "Get Started"
  },
  {
    name: "Credit Pack",
    price: { monthly: "$15", yearly: "$15", oneTime: "$15" },
    description: "One-time credit recharge. No subscription required.",
    icon: <Layers className="w-6 h-6" />,
    color: "rose",
    features: [
      "50 Generation Credits",
      "Never Expires",
      "4K Rendering Support",
      "Priority Single Queue",
      "Easy UPI/Card Checkout"
    ],
    cta: "Buy Credits"
  }
];

const faqs = [
  {
    q: "How does 'Model Personalization' work?",
    a: "Our engine uses a simulated process that analyzes your character sheet (PSD/CLIP) to ensure the AI maintains consistent details across every frame."
  },
  {
    q: "Can I cancel my subscription at any time?",
    a: "Yes! There are no long-term contracts for Monthly plans. If you choose Yearly, you save 20% on professional rendering power."
  },
  {
    q: "What payment methods do you support?",
    a: "We currently support Credit/Debit cards via Razorpay for domestic and international payments. UPI and other local methods are being integrated."
  }
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [segment, setSegment] = useState<'animator' | 'non-animator'>('animator');

  const currentPlans = segment === 'animator' ? animatorPlans : nonAnimatorPlans;

  return (
    <div className="w-full min-h-screen bg-white relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-32 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold mb-6"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            Flexible Pricing for Everyone
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black text-neutral-900 tracking-tight mb-6">
            Pick your <span className="text-indigo-600">Power tier.</span>
          </h1>
          
          {/* Segment Selector */}
          <div className="flex items-center justify-center p-1.5 bg-neutral-100 rounded-2xl w-fit mx-auto mb-10 border border-neutral-200">
            <button
              onClick={() => setSegment('animator')}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                segment === 'animator' 
                  ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' 
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Animator Segment
            </button>
            <button
              onClick={() => setSegment('non-animator')}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                segment === 'non-animator' 
                  ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' 
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Non-Animators
            </button>
          </div>

          <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
            Tailored plans for professional creators and casual enthusiasts alike.
          </p>

          {/* Toggle */}
          <div className="mt-12 flex items-center justify-center gap-4">
            <span className={`text-sm font-bold transition-colors ${!isYearly ? 'text-neutral-900' : 'text-neutral-400'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="w-16 h-8 bg-neutral-100 border border-neutral-200 rounded-full p-1 relative transition-all hover:border-indigo-300"
            >
              <div className={`w-6 h-6 bg-indigo-600 rounded-full shadow-md transition-transform duration-300 ${isYearly ? 'translate-x-8' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-bold transition-colors ${isYearly ? 'text-neutral-900' : 'text-neutral-400'}`}>
              Yearly <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px] ml-1">SAVE 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-${currentPlans.length} gap-8 mb-32 max-w-6xl mx-auto`}>
          {currentPlans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className={`relative p-8 rounded-[32px] border ${
                plan.popular 
                ? 'border-indigo-200 bg-white shadow-2xl shadow-indigo-500/10' 
                : 'border-neutral-100 bg-white/50 backdrop-blur-xl'
              } flex flex-col items-start`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 text-white text-xs font-black rounded-full shadow-lg shadow-indigo-600/30 tracking-widest uppercase">
                  Most Popular
                </div>
              )}

              <div className={`w-12 h-12 rounded-2xl bg-${plan.color}-50 flex items-center justify-center text-${plan.color}-600 mb-6 border border-${plan.color}-100`}>
                {plan.icon}
              </div>

              <h3 className="text-2xl font-black text-neutral-900 mb-2">{plan.name}</h3>
              <p className="text-sm text-neutral-500 font-medium mb-8 leading-relaxed">{plan.description}</p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black text-neutral-900">
                  {isYearly ? plan.price.yearly : plan.price.monthly}
                </span>
                {plan.price.monthly !== 'Custom' && (
                  <span className="text-neutral-400 font-bold text-sm">/mo</span>
                )}
              </div>

              <button className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 mb-10 ${
                plan.popular 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20' 
                : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}>
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="space-y-4 w-full">
                {plan.features.map(feature => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-neutral-600 font-medium">
                    <div className={`w-5 h-5 rounded-full bg-${plan.color}-50 flex items-center justify-center flex-shrink-0 border border-${plan.color}-100`}>
                      <Check className={`w-3 h-3 text-${plan.color}-600`} />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-neutral-900 mb-4">Compare capabilities</h2>
            <div className="w-12 h-1 bg-indigo-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Shield className="w-5 h-5" />, title: "Secure Pipeline", desc: "Private sessions and encrypted scene storage." },
              { icon: <Cpu className="w-5 h-5" />, title: "GPU Clusters", desc: "Instantly queue your frames on our high-speed networks." },
              { icon: <Layers className="w-5 h-5" />, title: "Multilayer PSD", desc: "The only AI engine providing native .PSD output." },
              { icon: <Check className="w-5 h-5" />, title: "Verified Results", desc: "Advanced motion vectors for smooth frame consistency." },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-neutral-100 bg-neutral-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all group">
                <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 mb-4 group-hover:text-indigo-600 transition-colors">
                  {f.icon}
                </div>
                <h4 className="font-bold text-neutral-900 mb-2">{f.title}</h4>
                <p className="text-xs text-neutral-500 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-neutral-900">Questions? We have answers.</h2>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 rounded-3xl border border-neutral-100 bg-white shadow-sm">
                <h4 className="flex items-center gap-3 font-bold text-neutral-900 mb-3 text-lg">
                  <HelpCircle className="w-5 h-5 text-indigo-500" />
                  {faq.q}
                </h4>
                <p className="text-neutral-500 font-medium leading-relaxed pl-8">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
