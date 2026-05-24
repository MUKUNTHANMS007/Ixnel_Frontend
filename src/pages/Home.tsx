import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { 
  Wand2, 
  Layers, 
  Settings, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Sparkles,
  Palette,
  Wind
} from 'lucide-react';

const Home = ({ onNavigate }: { onNavigate?: (page: string) => void }) => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="w-full bg-neutral-950 text-white min-h-screen font-sans selection:bg-[#00AAFF]/30">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glow Effects */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00AAFF]/10 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex flex-col items-center"
        >
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00AAFF]/30 bg-[#00AAFF]/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#00AAFF] animate-pulse" />
            <span className="text-xs font-semibold tracking-widest uppercase text-neutral-300">
              Beta Available Now • Limited Spots
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
            Semi-Autonomous Animation <br />
            Beyond <span className="text-[#00AAFF]">✦</span> Limits.
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Bridging AI with absolute animator control. Stop drawing in-betweens by hand. 
            Get studio-accurate, editable, layered frames—not baked videos.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => onNavigate?.(isAuthenticated ? 'projects' : 'signin')}
              className="px-8 py-4 bg-transparent border border-[#00AAFF] text-[#00AAFF] rounded-xl font-bold text-sm tracking-wide hover:bg-[#00AAFF] hover:text-neutral-950 transition-all duration-300 shadow-[0_0_20px_rgba(0,170,255,0.15)] hover:shadow-[0_0_30px_rgba(0,170,255,0.4)] hover:scale-105 active:scale-95"
            >
              Start Creating
            </button>
            <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-sm tracking-wide hover:bg-white/10 transition-all duration-300 flex items-center gap-2">
              Book a Demo <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-12 text-sm font-medium text-neutral-500 uppercase tracking-widest">
            Seamlessly integrates with your native software
          </p>
          <div className="flex items-center gap-8 mt-6 opacity-60 grayscale">
            {/* Replace with actual software logos/icons */}
            <span className="text-lg font-bold">After Effects</span>
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
            <span className="text-lg font-bold">Toon Boom</span>
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
            <span className="text-lg font-bold">Blender</span>
          </div>
        </motion.div>
      </section>

      {/* 2. WHY US (BENEFITS) */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 relative">
        <div className="text-center mb-16">
          <span className="text-[#00AAFF] text-xs font-bold uppercase tracking-widest mb-2 block">Why Ixnel</span>
          <h2 className="text-3xl md:text-4xl font-black text-white">Experience The Benefits <br/> Of Absolute Control</h2>
          <p className="text-neutral-400 mt-4 max-w-xl mx-auto">Control beats creativity. Our pipeline executes your exact vision without black-box hallucinations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Settings className="w-6 h-6 text-[#00AAFF]" />,
              title: "Animator Dictated",
              desc: "You provide the intent, motion strokes, and constraints. The engine strictly follows orders. No unpredictable generations."
            },
            {
              icon: <Palette className="w-6 h-6 text-[#00AAFF]" />,
              title: "Zero-Bleed Coloring",
              desc: "Studio-accurate semantic coloring ensures your character's palette never melts, flickers, or spills across fast camera pans."
            },
            {
              icon: <Layers className="w-6 h-6 text-[#00AAFF]" />,
              title: "Editable Deliverables",
              desc: "We output transparent PNG sequences with separated line-art and base color layers. Easily composite and edit downstream."
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-[#00AAFF]/30 hover:bg-[#00AAFF]/[0.02] transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#00AAFF]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-neutral-400 leading-relaxed text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. SHOWCASE (RECENT WORKS / IMPACT) */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#00AAFF] text-xs font-bold uppercase tracking-widest mb-2 block">What Studios Actually Get</span>
          <h2 className="text-3xl md:text-4xl font-black text-white">Production-Ready Outputs</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="pl-6 border-l-2 border-[#00AAFF]">
              <h3 className="text-2xl font-bold text-white mb-2">Say Goodbye to Baked MP4s</h3>
              <p className="text-neutral-400 leading-relaxed">
                Traditional AI outputs flat, uneditable video files. Our pipeline preserves your workflow by delivering exactly what compositors need.
              </p>
            </div>
            
            <ul className="space-y-4">
              {[
                "Transparent backgrounds (Alpha-channel)",
                "Separated layers: Line-art (top) + Base Color (below)",
                "Clean line structure with minimal distortion",
                "Studio-accurate color fidelity from reference sheets"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-neutral-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#00AAFF]" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-[32px] border border-white/10 bg-neutral-900 p-2 overflow-hidden aspect-video shadow-2xl shadow-[#00AAFF]/10 group">
            {/* Placeholder for Editor/Output Image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00AAFF]/20 to-transparent opacity-50" />
            <div className="w-full h-full rounded-[24px] bg-black/50 border border-white/5 flex items-center justify-center relative z-10 backdrop-blur-sm">
               <div className="text-center">
                 <Layers className="w-12 h-12 text-[#00AAFF] mx-auto mb-4 opacity-80" />
                 <p className="text-sm font-bold tracking-widest uppercase text-neutral-400">Interactive Output Viewer</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STATS SECTION */}
      <section className="py-16 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Cost Reduction", value: "60%" },
              { label: "Time Saved", value: "3 Weeks" },
              { label: "Manual Frames Cut", value: "4,000+" },
              { label: "Color Bleed", value: "0%" },
            ].map((stat, idx) => (
              <div key={idx}>
                <p className="text-4xl md:text-5xl font-black mb-2 text-white">{stat.value}</p>
                <p className="text-xs font-bold text-[#00AAFF] uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. EXPERTISE (THE PIPELINE) */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#00AAFF] text-xs font-bold uppercase tracking-widest mb-2 block">Our Pipeline</span>
          <h2 className="text-3xl md:text-4xl font-black text-white">Technology That Drives Quality</h2>
          <p className="text-neutral-400 mt-4 max-w-xl mx-auto">A multi-engine architecture designed to tackle the hardest bottlenecks in 2D animation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03]" />
            <div className="relative z-10">
              <Wand2 className="w-8 h-8 text-[#00AAFF] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Math-Driven Interpolation</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Forget generative guesswork. We use deterministic motion tracking guided by your manual strokes to calculate flawless in-betweens while preserving line structure.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03]" />
            <div className="relative z-10">
              <Wind className="w-8 h-8 text-[#00AAFF] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Automated Physics</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Wavy hair, cloth deformations, and fluid dynamics are no longer drawn frame-by-frame. We apply rigid mathematical physics to automate secondary motions perfectly.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)][background-size:16px_16px] opacity-[0.03]" />
            <div className="relative z-10">
              <Sparkles className="w-8 h-8 text-[#00AAFF] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Semantic Rendering</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Our rendering engine possesses global timeline awareness. It maps exact textures and colors from your reference sheets to semantic regions without temporal flickering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto relative"
        >
          <div className="relative p-12 md:p-16 rounded-[40px] border border-[#00AAFF]/20 bg-gradient-to-br from-[#00AAFF]/10 via-neutral-900 to-neutral-950 overflow-hidden text-center shadow-2xl shadow-[#00AAFF]/5">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#00AAFF]/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/60 to-transparent" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                Ready to redefine your workflow?
              </h2>
              <p className="text-neutral-400 mb-10 text-lg max-w-xl mx-auto leading-relaxed">
                Join top studios already using Ixnel to cut production time by 70% while maintaining absolute artistic control.
              </p>

              <button
                onClick={() => onNavigate?.(isAuthenticated ? 'projects' : 'signin')}
                className="inline-flex items-center gap-2.5 px-10 py-5 bg-[#00AAFF] text-neutral-950 rounded-2xl font-black tracking-wide hover:bg-white transition-all duration-300 shadow-xl shadow-[#00AAFF]/25 hover:shadow-white/10 hover:scale-105 active:scale-95"
              >
                Start Creating for Free
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