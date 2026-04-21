export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-neutral-950 py-16 mt-24">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 rounded-md bg-[#00AAFF] flex items-center justify-center shadow-lg shadow-[#00AAFF]/20">
               <div className="w-3 h-3 bg-neutral-950 rounded-sm" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">Ixnel</span>
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-sm mb-6">
            We're building the temporal web. Founded in 2023 by a team of computer vision researchers from MIT and Stanford. We believe the future of video isn't captured — it's generated.
          </p>
          <p className="text-neutral-500 text-xs">
            © {new Date().getFullYear()} Ixnel Inc. All rights reserved.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-xs">Product</h4>
          <ul className="flex flex-col gap-4">
            <li><a href="#" className="flex items-center gap-1 text-sm text-neutral-400 hover:text-[#00AAFF] transition-colors">Workspace</a></li>
            <li><a href="#" className="text-sm text-neutral-400 hover:text-[#00AAFF] transition-colors">Plugins</a></li>
            <li><a href="#" className="text-sm text-neutral-400 hover:text-[#00AAFF] transition-colors">Beta</a></li>
            <li><a href="#" className="text-sm text-neutral-400 hover:text-[#00AAFF] transition-colors">API</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-6 uppercase tracking-wider text-xs">Company</h4>
          <ul className="flex flex-col gap-4">
            <li><a href="#" className="text-sm text-neutral-400 hover:text-[#00AAFF] transition-colors">About Us</a></li>
            <li><a href="#" className="text-sm text-neutral-400 hover:text-[#00AAFF] transition-colors">Careers</a></li>
            <li><a href="#" className="text-sm text-neutral-400 hover:text-[#00AAFF] transition-colors">News</a></li>
            <li><a href="#" className="text-sm text-neutral-400 hover:text-[#00AAFF] transition-colors">Docs</a></li>
            <div className="w-8 border-t border-white/10 my-1"></div>
            <li><a href="#" className="text-sm text-neutral-500 hover:text-white transition-colors">Privacy</a></li>
            <li><a href="#" className="text-sm text-neutral-500 hover:text-white transition-colors">Terms</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}