// pages/Home.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import BounceCards from '../components/BounceCards';
import { 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Palette,
  Layers3,
  Zap,
  Film
} from 'lucide-react';

interface HomeProps {
  onNavigate?: (page: string) => void;
  isAuthenticated: boolean;
}

const Home = ({ onNavigate, isAuthenticated }: HomeProps) => {

  const lineartShowcase = [
    "/assets/showcase/lineart-1.png",
    "/assets/showcase/lineart-2.png",
    "/assets/showcase/lineart-3.png",
    "/assets/showcase/lineart-4.png",
    "/assets/showcase/lineart-5.png"
  ];

  const colorShowcase = [
    "/assets/showcase/color-1.png",
    "/assets/showcase/color-2.png",
    "/assets/showcase/color-3.png",
    "/assets/showcase/color-4.png",
    "/assets/showcase/color-5.png"
  ];

  // Animation sequences for the first card (when hovered)
  const animationSequences = [
    // First card has a 6-frame sequence (0 to 5)
    [
      "/assets/sequences/card-1/frame_00000.png",
      "/assets/sequences/card-1/frame_00001.png",
      "/assets/sequences/card-1/frame_00002.png",
      "/assets/sequences/card-1/frame_00003.png",
      "/assets/sequences/card-1/frame_00004.png",
      "/assets/sequences/card-1/frame_00005.png"
    ],
    // Second card has a sequence (0 to 24)
    [
      "/assets/sequences/card-2/frame_00000.png",
      "/assets/sequences/card-2/frame_00001.png",
      "/assets/sequences/card-2/frame_00002.png",
      "/assets/sequences/card-2/frame_00003.png",
      "/assets/sequences/card-2/frame_00004.png",
      "/assets/sequences/card-2/frame_00005.png",
      "/assets/sequences/card-2/frame_00006.png",
      "/assets/sequences/card-2/frame_00007.png",
      "/assets/sequences/card-2/frame_00008.png",
      "/assets/sequences/card-2/frame_00009.png",
      "/assets/sequences/card-2/frame_00010.png",
      "/assets/sequences/card-2/frame_00011.png",
      "/assets/sequences/card-2/frame_00012.png",
      "/assets/sequences/card-2/frame_00013.png",
      "/assets/sequences/card-2/frame_00014.png",
      "/assets/sequences/card-2/frame_00015.png",
      "/assets/sequences/card-2/frame_00016.png",
      "/assets/sequences/card-2/frame_00017.png",
      "/assets/sequences/card-2/frame_00018.png",
      "/assets/sequences/card-2/frame_00019.png",
      "/assets/sequences/card-2/frame_00020.png",
      "/assets/sequences/card-2/frame_00021.png",
      "/assets/sequences/card-2/frame_00022.png",
      "/assets/sequences/card-2/frame_00023.png",
      "/assets/sequences/card-2/frame_00024.png"
    ],
    // Third card has a sequence (25 to 48)
    [ ],
    // Fourth card (0 to 24)
    [
      "/assets/sequences/card-4/frame_00000.png",
      "/assets/sequences/card-4/frame_00001.png",
      "/assets/sequences/card-4/frame_00002.png",
      "/assets/sequences/card-4/frame_00003.png",
      "/assets/sequences/card-4/frame_00004.png",
      "/assets/sequences/card-4/frame_00005.png",
      "/assets/sequences/card-4/frame_00006.png",
      "/assets/sequences/card-4/frame_00007.png",
      "/assets/sequences/card-4/frame_00008.png",
      "/assets/sequences/card-4/frame_00009.png",
      "/assets/sequences/card-4/frame_00010.png",
      "/assets/sequences/card-4/frame_00011.png",
      "/assets/sequences/card-4/frame_00012.png",
      "/assets/sequences/card-4/frame_00013.png",
      "/assets/sequences/card-4/frame_00014.png",
      "/assets/sequences/card-4/frame_00015.png",
      "/assets/sequences/card-4/frame_00016.png",
      "/assets/sequences/card-4/frame_00017.png",
      "/assets/sequences/card-4/frame_00018.png",
      "/assets/sequences/card-4/frame_00019.png",
      "/assets/sequences/card-4/frame_00020.png",
      "/assets/sequences/card-4/frame_00021.png",
      "/assets/sequences/card-4/frame_00022.png",
      "/assets/sequences/card-4/frame_00023.png",
      "/assets/sequences/card-4/frame_00024.png"
    ],
    // Fifth card (0 to 24)
    [
      "/assets/sequences/card-5/frame_00000.png",
      "/assets/sequences/card-5/frame_00001.png",
      "/assets/sequences/card-5/frame_00002.png",
      "/assets/sequences/card-5/frame_00003.png",
      "/assets/sequences/card-5/frame_00004.png",
      "/assets/sequences/card-5/frame_00005.png",
      "/assets/sequences/card-5/frame_00006.png",
      "/assets/sequences/card-5/frame_00007.png",
      "/assets/sequences/card-5/frame_00008.png",
      "/assets/sequences/card-5/frame_00009.png",
      "/assets/sequences/card-5/frame_00010.png",
      "/assets/sequences/card-5/frame_00011.png",
      "/assets/sequences/card-5/frame_00012.png",
      "/assets/sequences/card-5/frame_00013.png",
      "/assets/sequences/card-5/frame_00014.png",
      "/assets/sequences/card-5/frame_00015.png",
      "/assets/sequences/card-5/frame_00016.png",
      "/assets/sequences/card-5/frame_00017.png",
      "/assets/sequences/card-5/frame_00018.png",
      "/assets/sequences/card-5/frame_00019.png",
      "/assets/sequences/card-5/frame_00020.png",
      "/assets/sequences/card-5/frame_00021.png",
      "/assets/sequences/card-5/frame_00022.png",
      "/assets/sequences/card-5/frame_00023.png",
      "/assets/sequences/card-5/frame_00024.png"
    ]
  ];

  const transformStyles = [
    'rotate(10deg) translate(-170px)',
    'rotate(5deg) translate(-85px)',
    'rotate(-3deg)',
    'rotate(-10deg) translate(85px)',
    'rotate(2deg) translate(170px)'
  ];

  return (
    <div className="w-full bg-zinc-950 text-zinc-100 min-h-screen font-sans selection:bg-[#00AAFF]/30 selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00AAFF]/5 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-zinc-600/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex flex-col items-center"
        >
          <span className="px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/40 text-xs font-bold text-zinc-400 tracking-wider mb-6 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00AAFF]" />
            Creative AI Engines for Animators & Games
          </span>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
            Unifying Creative Intent <br />
            With Absolute <span className="text-[#00AAFF]">Artistic Control</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-10">
            Ixnel builds production-grade AI tools designed to eliminate the most expensive bottlenecks in 2D animation and game design—while giving artists complete pixel-level oversight.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => onNavigate?.(isAuthenticated ? 'projects' : 'signin')}
              className="px-8 py-4 bg-[#00AAFF] hover:bg-[#0099EE] text-zinc-950 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 shadow-lg shadow-[#00AAFF]/20 hover:shadow-[#00AAFF]/30 hover:scale-105 active:scale-95"
            >
              Start Creating
            </button>
            <button className="px-8 py-4 bg-zinc-900/60 border border-zinc-800 text-zinc-300 rounded-xl font-bold text-sm tracking-wide hover:bg-zinc-800/80 hover:border-zinc-700 transition-all duration-300 flex items-center gap-2">
              Book a Studio Demo <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-16 text-xs font-black text-zinc-500 uppercase tracking-widest">
            Natively integrated into your pipeline
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 mt-6 opacity-40">
            <span className="text-sm font-black uppercase tracking-wider text-zinc-600">Adobe After Effects</span>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            <span className="text-sm font-black uppercase tracking-wider text-zinc-600">Toon Boom Harmony</span>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            <span className="text-sm font-black uppercase tracking-wider text-zinc-600">Blender 3D</span>
          </div>
        </motion.div>
      </section>

      {/* 2. DYNAMIC BOUNCE CARDS SHOWCASE */}
      <section className="py-24 border-t border-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[#00AAFF] text-xs font-black uppercase tracking-widest block">Core Technologies</span>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              A Unified Engine <br />
              For Studio Pipelines
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed font-medium">
              Traditional AI models generate flat, unpredictable, uneditable videos. Ixnel is built differently. We deliver structured, layered assets that match your reference sheets—not baked MP4s.
            </p>
            
            <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 flex items-center gap-3 text-sm text-zinc-400">
              <Layers3 className="w-5 h-5 text-[#00AAFF] flex-shrink-0" />
              <span>Hover over the first card to see animation sequence play automatically</span>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <BounceCards 
              linearts={lineartShowcase} 
              colors={colorShowcase}
              sequences={animationSequences}
              containerWidth={480}
              containerHeight={320}
              transformStyles={transformStyles}
              enableHover={true}
              cardWidth={170}
              cardAspectRatio="4/5"
              animationDelay={0.5}
              animationStagger={0.08}
              easeType="elastic.out(1, 0.8)"
            />
          </div>

        </div>
      </section>

      {/* 3. PRODUCTION-READY OUTPUTS */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-zinc-900">
        <div className="text-center mb-12">
          <span className="text-[#00AAFF] text-xs font-bold uppercase tracking-widest mb-2 block">Output Standard</span>
          <h2 className="text-3xl md:text-4xl font-black text-white">Production-Ready Outputs</h2>
        </div>

        {/* ─── MODIFICATION: Removed unuseful interactive layer inspector and unified to spacious, clean metrics ─── */}
        <div className="max-w-3xl mx-auto space-y-8 bg-zinc-900/20 border border-zinc-900/60 p-8 rounded-[32px] shadow-2xl">
          <div className="pl-6 border-l-2 border-[#00AAFF]">
            <h3 className="text-2xl font-bold text-white mb-2">Preserving Compositor Workflows</h3>
            <p className="text-zinc-400 leading-relaxed font-medium">
              The rendering pipeline possesses global timeline awareness, ensuring that your final colors match your design assets frame-by-frame with exactness.
            </p>
          </div>
          
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "High quality PNG sequences with Multiply blend",
              "Separated layers: Line-art (top) + Base Color (below)",
              "Studio-accurate color fidelity matching character reference sheets",
              "Clean timeline-aligned outputs", 
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3 text-zinc-300 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 text-[#00AAFF] flex-shrink-0 mt-0.5" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. STATS SECTION */}
      <section className="py-16 border-y border-zinc-900 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Cost Reduction", value: "60%" },
              { label: "Production Save", value: "3 Weeks" },
              { label: "Manual Frames Cut", value: "4,000+" },
              { label: "Color Bleed", value: "0%" },
            ].map((stat, idx) => (
              <div key={idx}>
                <p className="text-4xl md:text-5xl font-black mb-2 text-[#00AAFF]">{stat.value}</p>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TECHNOLOGY PIPELINE */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#00AAFF] text-xs font-bold uppercase tracking-widest mb-2 block">Our Pipeline</span>
          <h2 className="text-3xl md:text-4xl font-black text-white">Technology Tailored For Artists</h2>
          <p className="text-zinc-400 mt-4 max-w-xl mx-auto">A specialized architecture designed to tackle the hardest bottlenecks in game development and 2D animation.</p>
        </div>

        {/* ─── MODIFICATION: Kept ONLY the accomplished Semantic Coloring/Colorizer tool, rendering as a single premium spotlight card ─── */}
        <div className="max-w-2xl mx-auto p-8 rounded-[32px] bg-zinc-900/20 border border-zinc-800/80 relative overflow-hidden group hover:border-[#00AAFF]/30 hover:bg-[#00AAFF]/[0.02] transition-all duration-300">
          <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03]" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#00AAFF]/10 border border-[#00AAFF]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Palette className="w-8 h-8 text-[#00AAFF]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Semantic Coloring (Ixnel Colorizer)</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-semibold max-w-md mx-auto">
                Our rendering engine possesses global timeline awareness. It maps exact textures and colors from your reference sheets to semantic regions without timeline coloring gaps, preventing temporal flickering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-24 px-6 border-t border-zinc-900">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto relative"
        >
          <div className="relative p-12 md:p-16 rounded-[40px] border border-zinc-800 bg-zinc-900/30 overflow-hidden text-center shadow-2xl shadow-black/50">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#00AAFF]/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/30 to-transparent" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                Redefine Your Animation Workflow
              </h2>
              <p className="text-zinc-400 mb-10 text-lg max-w-xl mx-auto leading-relaxed font-semibold">
                Join modern studios cutting production costs by 60% while maintaining absolute pixel-level artistic control.
              </p>

              <button
                onClick={() => onNavigate?.(isAuthenticated ? 'projects' : 'signin')}
                className="inline-flex items-center gap-2.5 px-10 py-5 bg-[#00AAFF] hover:bg-[#0099EE] text-zinc-950 rounded-2xl font-black tracking-wide transition-all duration-300 shadow-xl shadow-[#00AAFF]/20 hover:shadow-[#00AAFF]/30 hover:scale-105 active:scale-95"
              >
                Start Creating For Free
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;