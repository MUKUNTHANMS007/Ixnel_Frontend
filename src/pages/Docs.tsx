import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Search,
  Menu,
  X,
  BookOpen
} from 'lucide-react';

const ImagePlaceholder = ({ src, alt, caption }: { src: string; alt: string; caption?: string }) => (
  <figure className="my-10">
    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/20 shadow-sm aspect-video flex items-center justify-center group transition-all duration-300 hover:shadow-lg hover:shadow-[#00AAFF]/10 hover:border-[#00AAFF]/50">
      {/* Pattern Background */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <img 
        src={src} 
        alt={alt} 
        className="absolute inset-0 w-full h-full object-cover object-center z-10 transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        onError={(e) => {
          // If image fails to load, hide it and show placeholder
          e.currentTarget.style.display = 'none';
        }}
      />
      
      {/* Placeholder content underneath the image */}
      <div className="text-center z-0 p-6 relative">
        <div className="w-14 h-14 rounded-full bg-[#00AAFF]/10 text-[#00AAFF] flex items-center justify-center mx-auto mb-4 border border-[#00AAFF]/20 group-hover:bg-[#00AAFF]/20 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-white font-semibold mb-1">Image Required</h3>
        <p className="text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
          Please take a screenshot of the editor and save it as <br/>
          <code className="bg-neutral-900 px-2 py-1 rounded-md border border-white/10 mt-2 inline-block font-mono text-xs text-[#00AAFF] shadow-sm">
            public{src}
          </code>
        </p>
      </div>
    </div>
    {caption && (
      <figcaption className="text-center text-sm text-neutral-500 mt-4 font-medium flex items-center justify-center gap-2">
        <span className="w-4 h-px bg-white/20"></span>
        {caption}
        <span className="w-4 h-px bg-white/20"></span>
      </figcaption>
    )}
  </figure>
);

const Docs = () => {
  const [activeSection, setActiveSection] = useState('Introduction');
  const[isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Scroll to top when section changes on mobile
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSection]);

  // Simplified Navigation - Easy to add more sections here later
  const navigation =[
    {
      title: 'Getting Started',
      items: ['Introduction', 'Quick Start Guide']
    },
    {
      title: 'Core Mechanics',
      items: ['Workspace Overview', 'Animation Pipeline']
    }
  ];

  // Helper to get previous and next sections for pagination
  const allItems = navigation.flatMap(group => group.items);
  const currentIndex = allItems.indexOf(activeSection);
  const prevSection = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextSection = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  const renderContent = () => {
    switch (activeSection) {
      case 'Introduction':
        return (
          <div className="space-y-6">
            <p className="text-lg text-neutral-400 leading-relaxed">
              Welcome to <strong className="text-white">Ixnel (The Hybrid 2D/3D Animation Pipeline)</strong>. This platform allows you to create fully realized scenes directly in your browser without any prior installation or heavy software.
            </p>
            <p className="text-lg text-neutral-400 leading-relaxed">
              More documentation on core features and workflows will be added here shortly.
            </p>
            <ImagePlaceholder 
              src="/docs/editor-overview.png" 
              alt="Overview of the Ixnel interface" 
              caption="The main editor interface featuring the canvas, sidebars, and top navigation"
            />
          </div>
        );
      default:
        // A generic fallback view for sections you haven't filled out yet
        return (
          <div className="bg-black/20 rounded-3xl border border-white/5 p-12 text-center border-dashed my-8">
            <BookOpen className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Coming Soon</h3>
            <p className="text-neutral-400 font-medium">This section ({activeSection}) is currently being written and will be published soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full bg-neutral-950 text-white min-h-screen">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-14 h-14 rounded-full bg-[#00AAFF] text-neutral-950 flex items-center justify-center shadow-lg shadow-[#00AAFF]/25 hover:bg-white hover:scale-105 active:scale-95 transition-all"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <div className="max-w-8xl mx-auto px-6 flex relative">
        {/* Sidebar */}
        <aside className={`
          fixed md:sticky top-20 h-[calc(100vh-5rem)] w-72 overflow-y-auto pl-2 pr-8 py-10 border-r border-white/5 bg-neutral-950
          transition-transform duration-300 ease-in-out z-40
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          left-0 md:left-auto
        `}>
          <div className="relative mb-10 pl-4">
            <div className="absolute inset-y-0 left-7 flex items-center pointer-events-none">
              <Search size={14} className="text-neutral-500" />
            </div>
            <input 
              type="text" 
              placeholder="Search documentation..."
              className="w-full bg-black/40 hover:bg-black/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#00AAFF]/20 focus:border-[#00AAFF] text-white outline-none transition-all placeholder:text-neutral-500"
            />
          </div>

          <nav className="space-y-10 pl-4">
            {navigation.map((group) => (
              <div key={group.title}>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
                  {group.title}
                </h4>
                <ul className="space-y-1.5 border-l-2 border-white/5 ml-1">
                  {group.items.map((item) => (
                    <li key={item}>
                      <button
                        onClick={() => {
                          setActiveSection(item);
                          setIsSidebarOpen(false);
                        }}
                        className={`
                          group flex items-center gap-3 w-full text-sm font-medium transition-all px-4 py-2 -ml-[2px] border-l-2
                          ${activeSection === item 
                            ? 'text-[#00AAFF] border-[#00AAFF] bg-[#00AAFF]/10 rounded-r-lg' 
                            : 'text-neutral-400 border-transparent hover:text-white hover:border-white/30'
                          }
                        `}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 py-10 md:py-16 md:px-12 lg:px-20">
          <div className="max-w-3xl mx-auto xl:mx-0">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-400 mb-8 bg-[#00AAFF]/5 w-fit px-4 py-1.5 rounded-full border border-[#00AAFF]/20">
              <span className="text-neutral-500">Documentation</span>
              <ChevronRight size={14} className="text-neutral-500" />
              <span>{navigation.find(g => g.items.includes(activeSection))?.title}</span>
              <ChevronRight size={14} className="text-neutral-500" />
              <span className="text-[#00AAFF] font-semibold">{activeSection}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="mb-10">
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
                    {activeSection}
                  </h1>
                  <div className="h-1.5 w-20 bg-[#00AAFF] rounded-full shadow-[0_0_15px_rgba(0,170,255,0.5)]" />
                </div>

                <article className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-p:text-neutral-400 prose-img:rounded-2xl prose-img:border prose-img:border-white/10 prose-a:text-[#00AAFF]">
                  {renderContent()}
                </article>

                {/* Pagination / Related Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-20 pt-10 border-t border-white/5">
                  {prevSection ? (
                    <button 
                      onClick={() => setActiveSection(prevSection)}
                      className="flex items-center gap-4 p-6 rounded-2xl border border-white/10 hover:border-[#00AAFF]/40 hover:bg-[#00AAFF]/5 transition-all duration-300 text-left group"
                    >
                      <div className="p-3 rounded-xl bg-neutral-900 border border-white/10 shadow-sm group-hover:scale-110 group-hover:text-[#00AAFF] group-hover:border-[#00AAFF]/40 transition-all">
                        <ChevronRight size={20} className="rotate-180" />
                      </div>
                      <div>
                        <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider block mb-1">Previous</span>
                        <h4 className="font-bold text-white group-hover:text-[#00AAFF] transition-colors">{prevSection}</h4>
                      </div>
                    </button>
                  ) : <div />}
                  
                  {nextSection ? (
                    <button 
                      onClick={() => setActiveSection(nextSection)}
                      className="flex items-center flex-row-reverse gap-4 p-6 rounded-2xl border border-white/10 hover:border-[#00AAFF]/40 hover:bg-[#00AAFF]/5 transition-all duration-300 text-right group"
                    >
                      <div className="p-3 rounded-xl bg-neutral-900 border border-white/10 shadow-sm group-hover:scale-110 group-hover:text-[#00AAFF] group-hover:border-[#00AAFF]/40 transition-all">
                        <ChevronRight size={20} />
                      </div>
                      <div>
                        <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider block mb-1">Next</span>
                        <h4 className="font-bold text-white group-hover:text-[#00AAFF] transition-colors">{nextSection}</h4>
                      </div>
                    </button>
                  ) : <div />}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Docs;