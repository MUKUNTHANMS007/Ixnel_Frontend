// src/pages/Products.tsx

import { motion } from 'framer-motion';
import { Palette, Layers, ArrowRight, Puzzle, FileText, Check } from 'lucide-react';

interface ProductsProps {
  onNavigate?: (page: string) => void;
  isAuthenticated: boolean;
}

export default function ProductsPage({ onNavigate, isAuthenticated }: ProductsProps) {
  return (
    <div className="w-full bg-neutral-950 min-h-screen pt-12 pb-24 px-6 relative overflow-hidden select-none">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-[#00AAFF]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        
        {/* Header Block */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00AAFF]/30 bg-[#00AAFF]/5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00AAFF] animate-pulse" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#00AAFF]">Ixnel Solutions</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Our AI <span className="text-[#00AAFF]">Products</span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed font-medium">
            We separate motion from rendering. Explore our production-ready creative engines designed to give you absolute control over your animation pipeline.
          </p>
        </div>

        {/* ─── PRODUCT SHOWCASE GRID (Widescreen Asymmetric Split) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Flagship Product: Semantic Colorization (7 of 12 Cols) */}
          <motion.div 
            whileHover={{ y: -6 }}
            className="lg:col-span-7 p-8 md:p-10 rounded-[40px] bg-white/[0.02] border border-white/10 hover:border-[#00AAFF]/40 hover:bg-[#00AAFF]/[0.01] transition-all duration-300 shadow-2xl shadow-black/60 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-8 right-8 px-4 py-1.5 bg-[#00AAFF]/15 border border-[#00AAFF]/30 text-[#00AAFF] text-[10px] font-black tracking-widest uppercase rounded-full">
              Flagship Engine
            </div>

            <div className="space-y-6 flex-grow">
              <div className="w-16 h-16 rounded-2xl bg-[#00AAFF]/10 border border-[#00AAFF]/20 flex items-center justify-center text-[#00AAFF] group-hover:scale-110 transition-transform duration-300">
                <Palette className="w-8 h-8" />
              </div>
              
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight mb-3">Semantic Colorization</h3>
                <p className="text-neutral-400 text-sm leading-relaxed max-w-xl font-medium">
                  Zero-bleed, studio-accurate automatic coloring. Maps the exact palette from your reference drawings across raw ink outlines, ensuring your final animation stays <strong className="text-[#00AAFF] font-bold">fully coherent and matched</strong> across frames.
                </p>
              </div>

              {/* Unique Flagship Features List */}
              <div className="py-4 border-t border-white/5 space-y-3 max-w-lg">
                <div className="flex items-center gap-3 text-xs text-neutral-400 font-semibold">
                  <Check className="w-4 h-4 text-[#00AAFF] flex-shrink-0" />
                  <span>Flat-copier sequential extraction preserves timeline parameters.</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-400 font-semibold">
                  <Check className="w-4 h-4 text-[#00AAFF] flex-shrink-0" />
                  <span>Continuous background checks prevent costly credit overwrites.</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-400 font-semibold">
                  <Check className="w-4 h-4 text-[#00AAFF] flex-shrink-0" />
                  <span>Automatic blending layers fit directly beneath ink outlines.</span>
                </div>
              </div>
            </div>
            
            <div className="pt-6">
              <button 
                onClick={() => {
                  if (!isAuthenticated) {
                    onNavigate?.('signin');
                  } else {
                    localStorage.setItem('triggerNewProjectModal', 'true');
                    onNavigate?.('projects');
                  }
                }}
                className="w-full sm:w-auto px-10 py-4.5 bg-[#00AAFF] text-neutral-950 rounded-2xl font-black text-sm tracking-wider uppercase hover:bg-white transition-all shadow-lg shadow-[#00AAFF]/20 hover:shadow-white/5 flex items-center justify-center gap-2 group/btn"
              >
                Try Colorization 
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Under-Development Product: In-Betweening (5 of 12 Cols) */}
          <div className="lg:col-span-5 p-8 rounded-[40px] bg-white/[0.01] border border-white/5 flex flex-col justify-between h-full relative overflow-hidden">
            <div className="absolute top-8 right-8 px-4 py-1.5 bg-neutral-900 border border-white/10 text-neutral-500 text-[10px] font-black uppercase tracking-wider rounded-full">
              In Development
            </div>

            <div className="space-y-6 flex-grow">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400">
                <Layers className="w-7 h-7" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Primary Motion</h3>
                <p className="text-neutral-500 text-sm leading-relaxed font-semibold">
                  Math-driven in-betweening vectors. Maintain strict, deterministic control over your animation paths using your <strong className="text-[#00AAFF] font-bold">manual strokes</strong> to calculate clean frames, eliminating generative AI hallucinations.
                </p>
              </div>
            </div>
            
            <div className="pt-10">
              <button disabled className="w-full py-4.5 bg-neutral-900/40 text-neutral-600 rounded-xl font-bold text-xs uppercase tracking-wider cursor-not-allowed border border-white/5">
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* ─── PLUGINS & WORKFLOWS SECTION ─── */}
        <div className="p-10 md:p-14 rounded-[40px] border border-[#00AAFF]/20 bg-gradient-to-br from-[#00AAFF]/10 via-neutral-900 to-neutral-950 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-[#00AAFF]/5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00AAFF]/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-2xl relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Puzzle className="w-6 h-6 text-[#00AAFF]" />
              <h3 className="text-2xl font-black text-white tracking-tight">Adopt and Integrate</h3>
            </div>
            <p className="text-neutral-400 leading-relaxed text-sm font-semibold">
              Seamlessly integrate Ixnel's AI engines directly into your native industry software workspaces. We support production-ready pipelines designed currently for <strong className="text-[#00AAFF] font-bold">After Effects</strong>.
            </p>
          </div>

          <button 
            onClick={() => onNavigate?.('docs')}
            className="relative z-10 flex-shrink-0 flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-bold hover:bg-white hover:text-neutral-950 transition-all shadow-lg text-xs uppercase tracking-wider"
          >
            <FileText className="w-4 h-4" /> Read Integration Docs
          </button>
        </div>

      </div>
    </div>
  );
}