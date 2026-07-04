// components/Footer.tsx

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-900 bg-zinc-950 py-16 mt-24 relative overflow-hidden">
      {/* Subtle bottom corner glow */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#00AAFF]/5 rounded-full blur-3xl pointer-events-none translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#00AAFF] flex items-center justify-center shadow-lg shadow-[#00AAFF]/20">
               <div className="w-3 h-3 bg-zinc-950 rounded-sm" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">Ixnel</span>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
            We build advanced AI product pipelines for digital animators, studios, and the gaming industry.
          </p>
          <p className="text-zinc-500 text-xs font-semibold">
            © {new Date().getFullYear()} Ixnel Inc. All rights reserved.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-xs">Product</h4>
          <ul className="flex flex-col gap-4">
            <li><a href="#" className="flex items-center gap-1 text-sm text-zinc-400 hover:text-[#00AAFF] transition-colors font-medium">Workspace</a></li>
            <li><a href="#" className="text-sm text-zinc-400 hover:text-[#00AAFF] transition-colors font-medium">Plugins</a></li>
            <li><a href="#" className="text-sm text-zinc-400 hover:text-[#00AAFF] transition-colors font-medium">Beta</a></li>
            <li><a href="#" className="text-sm text-zinc-400 hover:text-[#00AAFF] transition-colors font-medium">API</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-xs">Company</h4>
          <ul className="flex flex-col gap-4">
            <li><a href="#" className="text-sm text-zinc-400 hover:text-[#00AAFF] transition-colors font-medium">About Us</a></li>
            <li><a href="#" className="text-sm text-zinc-400 hover:text-[#00AAFF] transition-colors font-medium">Careers</a></li>
            <li><a href="#" className="text-sm text-zinc-400 hover:text-[#00AAFF] transition-colors font-medium">News</a></li>
            <li><a href="#" className="text-sm text-zinc-400 hover:text-[#00AAFF] transition-colors font-medium">Docs</a></li>
            <div className="w-8 border-t border-zinc-800/80 my-1"></div>
            <li><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors font-medium">Privacy</a></li>
            <li><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors font-medium">Terms</a></li>
          </ul>
        </div>

        {/* ─── ⚠️ SYSTEM-WIDE AI DISCLAIMER LEDGER (Unified at bottom span) ─── */}
        <div className="col-span-1 md:col-span-4 border-t border-zinc-900 pt-8 mt-4">
          <p className="text-[10px] text-zinc-500 leading-relaxed max-w-4xl font-semibold">
            <strong className="text-[#00AAFF] font-bold">Disclaimer</strong>: Ixnel develops advanced artificial intelligence utilities to accelerate and assist digital production workflows. Due to the computational, generative, and algorithmic nature of AI processing, output assets may exhibit rendering variations, processing delays, or VRAM-related queue thresholds. All produced deliverables are provided on an <strong className="text-zinc-400 font-bold">"as-is"</strong> basis, and final validation of output quality remains the absolute responsibility of the user.
          </p>
        </div>
      </div>
    </footer>
  );
}