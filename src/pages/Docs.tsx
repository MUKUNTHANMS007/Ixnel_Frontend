// src/pages/Docs.tsx

import { useState, useEffect } from 'react';
import { 
  Terminal, 
  BookOpen, 
  Download, 
  Key, 
  HelpCircle, 
  Check, 
  ArrowRight, 
  AlertTriangle, 
  Layers, 
  Sliders,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import type { User } from '../lib/api'; // Safe type-only import [1.1.9, 1.3.1]

interface DocsPageProps {
  onNavigate: (page: string) => void;
  user: User | null;
}

interface DocSection {
  id: string;
  title: string;
  category: string;
}

const DOC_SECTIONS: DocSection[] = [
  { id: 'introduction', title: 'Welcome to Ixnel', category: 'General' },
  { id: 'getting-started', title: 'Installation Guide', category: 'Setup' },
  { id: 'auth', title: 'Developer Keys', category: 'Security' },
  { id: 'ae-guide', title: 'Workspace Configuration', category: 'Plugin' },
  { id: 'troubleshooting', title: 'Failsafes & Warnings', category: 'Support' },
];

export default function DocsPage({ onNavigate, user }: DocsPageProps) {
  const [activeSection, setActiveSection] = useState('introduction');
  const [activePlugin, setActivePlugin] = useState('after_effects');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Direct Download Pointer targeting your Google Drive file ID
  const GOOGLE_DRIVE_FILE_ID = import.meta.env.VITE_AE_INSTALLER_DRIVE_ID || '1_7Y6fGgX7XJv8R8fS9Hq9e6bT6_EXAMPLE';
  const installerDownloadUrl = `https://drive.google.com/uc?export=download&id=${GOOGLE_DRIVE_FILE_ID}`;

  // IntersectionObserver Scroll-Spy to dynamically track scrolled sections
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    DOC_SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => {
      DOC_SECTIONS.forEach((sec) => {
        const el = document.getElementById(sec.id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGoToKeys = () => {
    if (user) {
      onNavigate('profile');
    } else {
      onNavigate('signup');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* ─── LEFT SIDEBAR NAVIGATION (LG: COL-SPAN 3 - Positioned Near Far-Left Boundary) ─── */}
        <div className="lg:col-span-3 sticky top-24 space-y-6">
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <BookOpen className="w-6 h-6 text-[#00AAFF]" />
              <h2 className="text-xl font-bold text-white">Ixnel AI Docs</h2>
            </div>

            {/* Modular Plugin Dropdown Selector */}
            <div className="space-y-2 pb-4 border-b border-white/10">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">Active Plugin Extension</label>
              <div className="relative">
                {/* ⚠️ MODIFICATION: Custom styled trigger button */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between bg-neutral-900/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] font-bold transition-all hover:bg-neutral-800/40 text-left"
                >
                  <span>
                    {activePlugin === 'after_effects' ? 'Adobe After Effects (Plugin)' : 'Blender (Coming Soon)'}
                  </span>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#00AAFF]" />
                </button>

                {/* ⚠️ MODIFICATION: Floating custom dropdown options list matching your dark UI */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-2 bg-[#0c0c0d] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-white/5 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div
                      onClick={() => {
                        setActivePlugin('after_effects');
                        setIsDropdownOpen(false);
                      }}
                      className={`px-4 py-3 text-xs font-bold cursor-pointer transition-colors flex items-center justify-between ${
                        activePlugin === 'after_effects' 
                          ? 'bg-[#00AAFF]/10 text-[#00AAFF]' 
                          : 'text-neutral-300 hover:bg-white/5'
                      }`}
                    >
                      <span>Adobe After Effects (Plugin)</span>
                      {activePlugin === 'after_effects' && <Check className="w-3.5 h-3.5 text-[#00AAFF]" />}
                    </div>
                    
                    <div
                      className="px-4 py-3 text-xs font-bold text-neutral-600 bg-neutral-950/20 cursor-not-allowed flex items-center justify-between opacity-45 select-none"
                    >
                      <span>Blender (Coming Soon)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <nav className="space-y-1.5">
              {DOC_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between group transition-all ${
                    activeSection === sec.id 
                      ? 'bg-[#00AAFF]/10 text-[#00AAFF] border border-[#00AAFF]/20' 
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                  }`}
                >
                  <span className="flex flex-col">
                    <span className="text-[8px] text-neutral-500 uppercase font-black mb-0.5 tracking-wider">{sec.category}</span>
                    <span className="text-sm font-bold">{sec.title}</span>
                  </span>
                  <ChevronRight className={`w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity ${
                    activeSection === sec.id ? 'opacity-100 text-[#00AAFF]' : ''
                  }`} />
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* ─── RIGHT CONTENT AREA (LG: COL-SPAN 9) ─── */}
        <div className="lg:col-span-9 space-y-10 pb-24">
          
          {/* Section 1: Welcome / Introduction */}
          <section id="introduction" className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 scroll-mt-24">
            <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-7 bg-[#00AAFF] rounded-full" />
              Welcome to Ixnel AI
            </h2>
            <div className="space-y-6 text-base text-neutral-300 leading-relaxed font-medium">
              <p className="text-lg text-neutral-200 leading-relaxed">
                <strong className="text-[#00AAFF] font-extrabold text-xl">Ixnel AI</strong> is a multi-product creative workspace toolkit. One of the primary products we offer is <strong className="text-[#00AAFF] font-bold">Ixnel Colorizer</strong>.
              </p>
              
              <div className="p-6 bg-black/20 border border-white/5 rounded-2xl space-y-4">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">How the Colorizer Behaves:</p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mt-0.5 flex-shrink-0">
                      <div className="w-3 h-3" />
                    </div>
                    <p className="text-sm text-neutral-400 font-semibold leading-relaxed">
                      It does <strong className="text-white font-bold">NOT</strong> draw new lines, generate vector outlines, or modify your original ink drawings.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <p className="text-sm text-neutral-400 font-semibold leading-relaxed">
                      Instead, it automatically maps your flat color palette to your outlines, ensuring your final colors remain <strong className="text-[#00AAFF] font-bold">fully matched and coherent across your entire frame sequence</strong> without flickering.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Render After Effects Content if activePlugin is selected */}
          {activePlugin === 'after_effects' && (
            <div className="space-y-10">
              
              {/* Section 2: Getting Started & Installation */}
              <section id="getting-started" className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 scroll-mt-24">
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <span className="w-1.5 h-7 bg-[#00AAFF] rounded-full" />
                  Installation Guide (Adobe AE)
                </h2>
                
                <div className="space-y-6 text-base text-neutral-300 font-medium">
                  <p className="leading-relaxed">
                    We provide an automated, one-click Windows installer that registers the plugin folder and configures your system bypasses.
                  </p>

                  {/* Direct Download Action */}
                  <div className="p-6 bg-black/35 border border-white/5 rounded-2xl space-y-4 max-w-lg">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Download Setup Package</p>
                    <a
                      href={installerDownloadUrl}
                      className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#00AAFF] text-neutral-950 hover:bg-white transition-all font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#00AAFF]/10 group"
                    >
                      <Download className="w-4 h-4" />
                      Download Windows Installer
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </div>

                  <div className="space-y-4 pt-2">
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Execution Steps:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-5 bg-black/20 border border-white/5 rounded-2xl space-y-1.5">
                        <span className="text-[#00AAFF] font-black text-sm">Step 1</span>
                        <p className="text-xs text-neutral-400 leading-relaxed font-semibold">
                          Run the downloaded <code className="text-white">IxnelColorizer_Setup.exe</code> with Administrator privileges.
                        </p>
                      </div>
                      <div className="p-5 bg-black/20 border border-white/5 rounded-2xl space-y-1.5">
                        <span className="text-[#00AAFF] font-black text-sm">Step 2</span>
                        <p className="text-xs text-neutral-400 leading-relaxed font-semibold">
                          Click <strong className="text-white font-bold">Install</strong>. Files are placed in common Adobe CEP paths automatically.
                        </p>
                      </div>
                      <div className="p-5 bg-black/20 border border-white/5 rounded-2xl space-y-1.5">
                        <span className="text-[#00AAFF] font-black text-sm">Step 3</span>
                        <p className="text-xs text-neutral-400 leading-relaxed font-semibold">
                          Launch Adobe After Effects and navigate to the top menu.
                        </p>
                      </div>
                      <div className="p-5 bg-black/20 border border-white/5 rounded-2xl space-y-1.5">
                        <span className="text-[#00AAFF] font-black text-sm">Step 4</span>
                        <p className="text-xs text-neutral-400 leading-relaxed font-semibold">
                          Click <strong className="text-white font-bold">Window &gt; Extensions &gt; Ixnel Colorizer</strong> to open your panel.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3: Developer API Keys */}
              <section id="auth" className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 scroll-mt-24">
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <span className="w-1.5 h-7 bg-[#00AAFF] rounded-full" />
                  API Keys Authentication
                </h2>
                <div className="space-y-6 text-base text-neutral-300 leading-relaxed font-medium">
                  <p>
                    The After Effects extension communicates with our servers via your profile’s secret API key. This key authorizes usage and maps render costs to your credits balance.
                  </p>
                  
                  <div className="p-5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-2xl flex items-start gap-2.5 leading-relaxed">
                    <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                    <span>Generate your key below. Once closed, the raw key is encrypted and <strong className="text-yellow-300 font-bold">cannot be viewed again</strong> for security reasons.</span>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleGoToKeys}
                      className="inline-flex items-center gap-2 px-5 py-3 border border-white/10 hover:border-white/20 text-white rounded-xl font-bold text-xs hover:bg-white/[0.02] transition-all"
                    >
                      <Key className="w-4 h-4 text-[#00AAFF]" />
                      Go to Developer Keys Section
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                    </button>
                  </div>
                </div>
              </section>

              {/* Section 4: After Effects Workspace Guide */}
              <section id="ae-guide" className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 scroll-mt-24">
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <span className="w-1.5 h-7 bg-[#00AAFF] rounded-full" />
                  Workspace Configuration
                </h2>
                
                <div className="space-y-8 text-base text-neutral-300 font-medium">
                  <p className="leading-relaxed">
                    To achieve correct results, the extension applies frame-matching algorithms that compare your active line-art layer with your reference artwork on disk.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-black/20 border border-white/5 rounded-2xl space-y-2 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <Layers className="w-4 h-4 text-[#00AAFF]" />
                        <span>1. Target Layer</span>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed font-semibold">
                        Select <strong className="text-white font-bold">exactly one</strong> line-art layer in your timeline. This layer must be an <strong className="text-white font-bold">imported Image Sequence</strong> (PNG or JPG files). Raw shapes, vector paths, and pre-compositions are not supported.
                      </p>
                    </div>

                    <div className="p-6 bg-black/20 border border-white/5 rounded-2xl space-y-2 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <Sliders className="w-4 h-4 text-[#00AAFF]" />
                        <span>2. Partition Strategy</span>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed font-semibold">
                        For sequences longer than 24 frames, select <strong className="text-[#00AAFF] font-bold">Sliding Window</strong>. This automatically splices frames into overlapping chunks, which is crucial to keep colors fully coherent and prevent visual flickering.
                      </p>
                    </div>

                    <div className="p-6 bg-black/20 border border-white/5 rounded-2xl space-y-2 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-2 text-white font-bold">
                        <Check className="w-4 h-4 text-[#00AAFF]" />
                        <span>3. Auto-Blending</span>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed font-semibold">
                        Ensure <strong className="text-white font-bold">Auto-Layering</strong> is checked. On successful job completion, the plugin automatically imports the sequence, positions it directly beneath your lines, and applies a <strong className="text-[#00AAFF] font-bold">Multiply</strong> blend mode to your line-art—preserving your original ink details.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 5: Troubleshooting & Safety */}
              <section id="troubleshooting" className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 scroll-mt-24">
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <span className="w-1.5 h-7 bg-[#00AAFF] rounded-full" />
                  Failsafes & Warnings
                </h2>
                
                <div className="space-y-6 text-base text-neutral-300 font-medium">
                  <p className="leading-relaxed">
                    Review these custom, in-plugin failsafes designed to prevent accidental over-spending and keep your workflow synchronized:
                  </p>

                  <div className="divide-y divide-white/5 border border-white/5 rounded-2xl bg-black/20">
                    <div className="p-5 space-y-2">
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-[#00AAFF] flex-shrink-0" />
                        "Timeline Collision" Warn Card
                      </p>
                      <p className="text-xs text-neutral-500 leading-relaxed font-semibold pl-6">
                        The plugin continuously scans your active composition for already colorized frame ranges. If you select a range that is already covered, the <strong className="text-yellow-400 font-bold">Timeline Selected</strong> warning card will appear and lock the submission to protect your credits.
                      </p>
                    </div>

                    <div className="p-5 space-y-2">
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-[#00AAFF] flex-shrink-0" />
                        The Double-Confirmation Modal
                      </p>
                      <p className="text-xs text-neutral-500 leading-relaxed font-semibold pl-6">
                        If you choose to bypass the collision card by clicking <strong className="text-white font-bold">Allow Overwrite</strong>, the plugin triggers a second, explicit confirmation modal on submission. This confirms you are aware that re-colorizing these frames will deduct credits again.
                      </p>
                    </div>
                    
                    <div className="p-5 space-y-2">
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-[#00AAFF] flex-shrink-0" />
                        "Bridge Error" or Unresponsive Panel
                      </p>
                      <p className="text-xs text-neutral-500 leading-relaxed font-semibold pl-6">
                        This occurs if After Effects' background scripting thread stalls. Simply click the <strong className="text-white font-bold">Refresh (⟳)</strong> button in the plugin panel header, or save your project and restart After Effects.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}