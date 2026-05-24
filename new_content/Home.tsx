import { useAuthStore } from '../store/authStore';
import { ImageCarouselHero } from '../components/ai-image-generator-hero';
import cinarizationArt from '../assets/cinarization_line_art.png';
import { motion } from 'framer-motion';
import { Zap, Shield, Cpu, Target, ArrowRight } from 'lucide-react';

const Home = ({ onNavigate }: { onNavigate?: (page: string) => void }) => {
  const { isAuthenticated } = useAuthStore();
  const images = [
    { id: '1', src: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600', alt: '3D Character Posing', rotation: -5 },
    { id: '2', src: cinarizationArt, alt: 'Cinarization Line Art', rotation: 8 },
    { id: '3', src: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=600', alt: 'Dope Sheet Timeline', rotation: -3 },
    { id: '4', src: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=600', alt: 'Onion Skinning', rotation: 5 },
    { id: '5', src: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600', alt: 'Digital Reference Sheet', rotation: -2 },
  ];

  return (
    <div className="w-full bg-neutral-950">

      {/* Hero */}
      <ImageCarouselHero
        title={
          <>
            <span className="text-[#00AAFF]">Ixnel</span>: Evolution of Animation
          </>
        }
        subtitle="Hybrid 2D/3D Animation Pipeline"
        description="Bridge the gap between 3D modeling and hand-drawn aesthetics. Capture poses, apply Cinarization filters, and trigger AI interpolation for fluid character motion."
        ctaText={isAuthenticated ? "Enter Workspace" : "Get Started Now"}
        onCtaClick={() => onNavigate?.(isAuthenticated ? 'projects' : 'signin')}
        images={images}
        features={[
          { title: "AI Integration", description: "Automated correspondence matching for smooth 2D/3D hybrids." },
          { title: "Industry Formats", description: "Native .PSD and .CLIP metadata support for design layers." },
          { title: "Pro Animation Tools", description: "Real-time Onion Skinning and Dope Sheet management." }
        ]}
      />

      {/* Why Ixnel Section */}
      <section className="py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          {/* Eyebrow label */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00AAFF]/30 bg-[#00AAFF]/5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00AAFF] animate-pulse" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#00AAFF]">Core Advantages</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Why <span className="text-[#00AAFF]">Ixnel</span>?
          </h2>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Traditional animation is slow. AI is often unpredictable. Ixnel combines the control of 3D with the soul of 2D.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: <Zap className="w-5 h-5" />, title: "Lightning Fast", desc: "Reduce turnaround time by 70% with automated in-betweening." },
            { icon: <Shield className="w-5 h-5" />, title: "Full Control", desc: "You pose the 3D models, the AI handles the rendering." },
            { icon: <Cpu className="w-5 h-5" />, title: "H100 Powered", desc: "Experience near-instant generations on our high-speed GPU clusters." },
            { icon: <Target className="w-5 h-5" />, title: "Precision", desc: "Maintain character consistency across every single frame." },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5, ease: 'easeOut' }}
              className="relative group p-7 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-[#00AAFF]/5 hover:border-[#00AAFF]/20 transition-all duration-300 overflow-hidden"
            >
              {/* Subtle top-edge glow on hover */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/0 to-transparent group-hover:via-[#00AAFF]/50 transition-all duration-500" />

              <div className="w-11 h-11 rounded-xl bg-[#00AAFF]/10 border border-[#00AAFF]/20 flex items-center justify-center text-[#00AAFF] mb-5 group-hover:bg-[#00AAFF]/20 transition-all duration-300">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[#00AAFF]/[0.04]" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#00AAFF]/10 rounded-full blur-[80px]" />
        </div>
        {/* Top / bottom border lines */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {[
              { label: "Frames Generated", value: "1.2M+" },
              { label: "Active Animators", value: "50k+" },
              { label: "Time Saved", value: "70%" },
              { label: "Studio Partners", value: "120+" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
              >
                <p className="text-4xl md:text-5xl font-black mb-2 text-[#00AAFF] tabular-nums">{stat.value}</p>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto relative"
        >
          {/* Card */}
          <div className="relative p-12 rounded-3xl border border-[#00AAFF]/20 bg-gradient-to-br from-[#00AAFF]/10 via-neutral-900 to-neutral-950 overflow-hidden text-center shadow-2xl shadow-[#00AAFF]/5">
            {/* Glow orbs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#00AAFF]/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-[#00AAFF]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

            {/* Top border accent */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/60 to-transparent" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00AAFF]/30 bg-[#00AAFF]/5 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00AAFF] animate-pulse" />
                <span className="text-xs font-semibold tracking-widest uppercase text-[#00AAFF]">Start Today</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                Ready to redefine your workflow?
              </h2>
              <p className="text-neutral-400 mb-10 text-base max-w-lg mx-auto leading-relaxed">
                Join thousands of creators already using Ixnel to bring their ideas to life.
              </p>

              <button
                onClick={() => onNavigate?.(isAuthenticated ? 'projects' : 'signin')}
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold text-sm tracking-wide hover:bg-white transition-all duration-200 shadow-lg shadow-[#00AAFF]/25 hover:shadow-white/10 hover:scale-[1.02] active:scale-[0.99]"
              >
                Start Creating for Free
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
