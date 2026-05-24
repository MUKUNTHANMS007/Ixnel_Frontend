import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface NavbarProps {
  onNavigate: (page: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Products', id: 'products' },
    { label: 'Docs', id: 'docs' },
    { label: 'News', id: 'news' },
    { label: 'About Us', id: 'about' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-neutral-950/80 backdrop-blur-xl border-b border-white/5 py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer z-50 group"
          onClick={() => onNavigate('home')}
        >
          <div className="w-8 h-8 rounded-lg bg-[#00AAFF]/10 border border-[#00AAFF]/30 flex items-center justify-center shadow-[0_0_12px_#00AAFF22] group-hover:shadow-[0_0_18px_#00AAFF44] transition-all">
            <div className="w-3.5 h-3.5 bg-[#00AAFF] rounded-sm" />
          </div>
          <span className="font-black text-xl tracking-tight text-white">Ixnel</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 bg-white/[0.04] px-6 py-2.5 rounded-full border border-white/10 backdrop-blur-md shadow-sm">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className="text-sm font-semibold text-neutral-400 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-neutral-400 hover:text-red-400 transition-colors px-4 py-2 flex items-center gap-2"
              >
                <LogOut size={15} />
                Sign Out
              </button>
              <button
                onClick={() => onNavigate('projects')}
                className="text-sm font-bold bg-[#00AAFF] text-neutral-950 hover:bg-white px-5 py-2.5 rounded-full transition-all duration-200 shadow-lg shadow-[#00AAFF]/20 flex items-center gap-2"
              >
                <User size={15} />
                My Dashboard
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('signin')}
                className="text-sm font-semibold text-neutral-400 hover:text-white transition-colors px-4 py-2"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="text-sm font-bold bg-[#00AAFF] text-neutral-950 hover:bg-white px-5 py-2.5 rounded-full transition-all duration-200 shadow-lg shadow-[#00AAFF]/20"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden absolute top-full left-0 right-0 bg-neutral-950/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-5 shadow-2xl"
        >
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setIsMobileMenuOpen(false);
              }}
              className="text-base font-semibold text-neutral-300 hover:text-white text-left transition-colors"
            >
              {link.label}
            </button>
          ))}

          <div className="w-full h-px bg-white/10 my-1" />

          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 px-1 py-1">
                <div className="w-9 h-9 rounded-full bg-[#00AAFF]/10 border border-[#00AAFF]/30 flex items-center justify-center text-[#00AAFF]">
                  <User size={17} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{user?.name || 'User'}</p>
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => { onNavigate('projects'); setIsMobileMenuOpen(false); }}
                className="text-base font-semibold text-white text-left"
              >
                My Projects
              </button>
              <button
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="text-base font-semibold text-red-400 text-left flex items-center gap-2"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { onNavigate('signin'); setIsMobileMenuOpen(false); }}
                className="text-base font-semibold text-neutral-300 hover:text-white text-left transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => { onNavigate('signup'); setIsMobileMenuOpen(false); }}
                className="text-base font-bold bg-[#00AAFF] text-neutral-950 text-center py-3 rounded-xl shadow-lg shadow-[#00AAFF]/20"
              >
                Get Started
              </button>
            </>
          )}
        </motion.div>
      )}
    </header>
  );
}
