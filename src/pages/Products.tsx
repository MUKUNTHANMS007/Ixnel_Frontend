import { motion } from 'framer-motion';
import { Palette, Layers, Wind, ArrowRight, Puzzle, FileText } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface ProductsProps {
  onNavigate?: (page: string) => void;
}

export default function ProductsPage({ onNavigate }: ProductsProps) {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="w-full bg-neutral-950 min-h-screen pt-12 pb-24 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#00AAFF]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00AAFF]/30 bg-[#00AAFF]/5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00AAFF] animate-pulse" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#00AAFF]">Ixnel Solutions</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Our <span className="text-[#00AAFF]">Products</span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            We separate motion from rendering. Explore our specialized AI engines and plugins designed to give you absolute control over your animation pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Tool 1: Colorization (Active) */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-[#00AAFF]/40 hover:bg-[#00AAFF]/[0.02] transition-all duration-300 shadow-xl shadow-black/50 flex flex-col h-full relative overflow-hidden group"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="w-14 h-14 rounded-2xl bg-[#00AAFF]/10 border border-[#00AAFF]/20 flex items-center justify-center mb-6 text-[#00AAFF] group-hover:scale-110 transition-transform duration-300">
              <Palette className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Semantic Colorization</h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-8 flex-grow">
              Zero-bleed, studio-accurate coloring. Maps the exact texture and palette from your character reference sheet across all frames with perfect temporal consistency.
            </p>
            
            <button 
              onClick={() => {
                if (!isAuthenticated) onNavigate?.('signin');
                else onNavigate?.('pipeline');
              }}
              className="w-full py-4 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold text-sm tracking-wide hover:bg-white transition-all shadow-lg shadow-[#00AAFF]/25 hover:shadow-white/10 flex items-center justify-center gap-2 group/btn"
            >
              Try Colorization <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Tool 2: In-Betweening */}
          <motion.div 
            className="p-8 rounded-[32px] bg-white/[0.01] border border-white/5 flex flex-col h-full relative"
          >
            <div className="absolute top-6 right-6 px-3 py-1 bg-neutral-900 border border-white/10 text-neutral-500 text-[10px] font-black uppercase tracking-wider rounded-full">
              In Dev
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-neutral-400">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Primary Motion</h3>
            <p className="text-neutral-500 text-sm leading-relaxed mb-8 flex-grow">
              Math-driven interpolation. Maintain strict control over motion paths using your manual strokes to calculate flawless in-betweens, eliminating generative hallucinations.
            </p>
            
            <button disabled className="w-full py-4 bg-neutral-900/50 text-neutral-600 rounded-xl font-bold text-sm tracking-wide cursor-not-allowed border border-white/5">
              Coming Soon
            </button>
          </motion.div>

          {/* Tool 3: Physics */}
          <motion.div 
            className="p-8 rounded-[32px] bg-white/[0.01] border border-white/5 flex flex-col h-full relative"
          >
            <div className="absolute top-6 right-6 px-3 py-1 bg-neutral-900 border border-white/10 text-neutral-500 text-[10px] font-black uppercase tracking-wider rounded-full">
              In Dev
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-neutral-400">
              <Wind className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Automated Physics</h3>
            <p className="text-neutral-500 text-sm leading-relaxed mb-8 flex-grow">
              Automated secondary motion for cloth, wavy hair, and fluid dynamics guided by deterministic physical equations.
            </p>
            
            <button disabled className="w-full py-4 bg-neutral-900/50 text-neutral-600 rounded-xl font-bold text-sm tracking-wide cursor-not-allowed border border-white/5">
              Coming Soon
            </button>
          </motion.div>
        </div>

        {/* Plugins & Workflows CTA */}
        <div className="p-10 md:p-14 rounded-[40px] border border-[#00AAFF]/20 bg-gradient-to-br from-[#00AAFF]/10 via-neutral-900 to-neutral-950 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-[#00AAFF]/5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00AAFF]/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-2xl relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Puzzle className="w-6 h-6 text-[#00AAFF]" />
              <h3 className="text-2xl font-black text-white">Plugins & Animation Workflows</h3>
            </div>
            <p className="text-neutral-400 leading-relaxed text-base">
              Seamlessly integrate Ixnel's AI engines directly into your native workspace. We support animation-ready workflows designed specifically for <strong className="text-white">After Effects, Toon Boom, and Blender.</strong>
            </p>
          </div>

          <button 
            onClick={() => onNavigate?.('docs')}
            className="relative z-10 flex-shrink-0 flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-bold hover:bg-white hover:text-neutral-950 transition-all shadow-lg"
          >
            <FileText className="w-4 h-4" /> READ DOCS
          </button>
        </div>
      </div>
    </div>
  );
}