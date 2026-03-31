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
    { label: 'About Us', id: 'about' }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass py-4' : 'bg-transparent py-6'}`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer z-50"
          onClick={() => onNavigate('home')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
             <div className="w-4 h-4 bg-white rounded-sm" />
          </div>
          <span className="font-bold text-xl tracking-tight text-neutral-900">Ixnel</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 bg-white/50 px-6 py-2 rounded-full border border-neutral-200/50 backdrop-blur-md shadow-sm">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-neutral-600 hover:text-red-600 transition-colors px-4 py-2 flex items-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </button>
              <button 
                onClick={() => onNavigate('projects')}
                className="text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 px-5 py-2.5 rounded-full transition-colors shadow-sm flex items-center gap-2"
              >
                <User size={16} />
                My Dashboard
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => onNavigate('signin')}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-4 py-2"
              >
                Sign In
              </button>
              <button 
                onClick={() => onNavigate('signup')}
                className="text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 px-5 py-2.5 rounded-full transition-colors shadow-sm"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-neutral-900 z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-neutral-200 p-6 flex flex-col gap-6 shadow-xl"
        >
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setIsMobileMenuOpen(false);
              }}
              className="text-lg font-medium text-neutral-600 hover:text-neutral-900 text-left transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="w-full h-px bg-neutral-200 my-2" />
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 px-2 py-1">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  onNavigate('projects');
                  setIsMobileMenuOpen(false);
                }}
                className="text-lg font-medium text-neutral-900 text-left"
              >
                My Projects
              </button>
              <button 
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="text-lg font-medium text-red-600 text-left flex items-center gap-2"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => {
                  onNavigate('signin');
                  setIsMobileMenuOpen(false);
                }}
                className="text-lg font-medium text-neutral-900 text-left"
              >
                Sign In
              </button>
              <button 
                onClick={() => {
                  onNavigate('signup');
                  setIsMobileMenuOpen(false);
                }}
                className="text-lg font-medium bg-neutral-900 text-white text-center py-3 rounded-xl shadow-md"
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