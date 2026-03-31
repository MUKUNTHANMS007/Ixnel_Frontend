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
    <div className="w-full bg-white">
      <ImageCarouselHero 
        title={
          <>
            <span className="text-indigo-600">Ixnel</span>: Evolution of Animation
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
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6">
            Why <span className="text-indigo-600">Ixnel</span>?
          </h2>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
            Traditional animation is slow. AI is often unpredictable. Ixnel combines the control of 3D with the soul of 2D.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <Zap className="w-6 h-6" />, title: "Lightning Fast", desc: "Reduce turnaround time by 70% with automated in-betweening." },
            { icon: <Shield className="w-6 h-6" />, title: "Full Control", desc: "You pose the 3D models, the AI handles the rendering." },
            { icon: <Cpu className="w-6 h-6" />, title: "H100 Powered", desc: "Experience near-instant generations on our high-speed GPU clusters." },
            { icon: <Target className="w-6 h-6" />, title: "Precision", desc: "Maintain character consistency across every single frame." },
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-[32px] border border-neutral-100 bg-neutral-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">{item.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-neutral-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: "Frames Generated", value: "1.2M+" },
              { label: "Active Animators", value: "50k+" },
              { label: "Time Saved", value: "70%" },
              { label: "Studio Partners", value: "120+" },
            ].map((stat, idx) => (
              <div key={idx}>
                <p className="text-4xl md:text-5xl font-black mb-2 text-indigo-400">{stat.value}</p>
                <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto p-12 rounded-[48px] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          
          <h2 className="text-4xl font-black mb-6 relative z-10">Ready to redefine your workflow?</h2>
          <p className="text-indigo-100 mb-10 text-lg font-medium relative z-10">
            Join thousands of creators who are already using Ixnel to bring their ideas to life.
          </p>
          <button 
            onClick={() => onNavigate?.(isAuthenticated ? 'projects' : 'signin')}
            className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-2 mx-auto relative z-10"
          >
            Start Creating for Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;