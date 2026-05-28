// App.tsx

import { useState, useEffect } from 'react';
import { NavBar } from './components/ui/tubelight-navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Docs from './pages/Docs';
import News from './pages/News';
import Projects from './pages/Projects';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ResultPage from './pages/ResultPage';
import PricingPage from './pages/PricingPage';
import ProductsPage from './pages/Products';
import FeedbackPage from './pages/FeedbackPage';
import Editor from './pages/Editor';
import ProfilePage from './pages/Profile';
import OAuthCallback from './components/OAuthCallback';

import { Loader2 } from 'lucide-react';

// Import authAPI and Types directly from api.ts
import { authAPI } from '../src/lib/api';
import type { User, UserProfile } from '../src/lib/api';
import {
  Home as HomeIcon,
  FileText,
  Newspaper,
  LogIn,
  LogOut,
  FolderOpen,
  Sparkles,
  Video,
  MessageSquare,
  User as UserIcon,
} from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('home');

  // ─ Central Authentication State (Bypassing authStore) ───────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // ─ Restore Active Session from localStorage on mount ────────────────────
  const restoreSession = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token || token === 'undefined' || token === 'null') {
      setIsAuthenticated(false);
      setUser(null);
      setProfile(null);
      setIsAuthLoading(false);
      return;
    }

    try {
      const response = await authAPI.me(token);
      if (response.success && response.data) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        setProfile(response.data.profile);
      } else {
        // Token expired/invalid, clear local memory
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('[App] Failed to restore session:', err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    // If OAuth code and state exist, render the callback page inside the popup
    if (code && state) {
      setActivePage('oauth-callback');
      setIsAuthLoading(false);
      return;
    }

    restoreSession();
  }, []);

  // ─ Logout handler (Direct API call + clear localStorage) ─────────────────
  const handleLogout = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await authAPI.logout(token);
      } catch (err) {
        console.error('[App] Logout API failed:', err);
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUser(null);
    setProfile(null);
    setActivePage('home');
  };

  const handleNavigation = (page: string) => {
    if (page === 'logout') {
      handleLogout();
      return;
    }
    setActivePage(page);
  };

  // ─ Dynamic Navigation bar Items ──────────────────────────────────────────
  const navItems = [
    { name: 'Home', id: 'home', icon: HomeIcon },
    { name: 'Products', id: 'products', icon: Video },
    { name: 'Pricing', id: 'pricing', icon: Sparkles },
    { name: 'Docs', id: 'docs', icon: FileText },
    { name: 'Projects', id: 'projects', icon: FolderOpen },
    { name: 'News', id: 'news', icon: Newspaper },
    { name: 'Feedback', id: 'feedback', icon: MessageSquare },
    
    // Toggle Profile/Login based on central state
    ...(isAuthenticated
      ? [
          { name: 'Profile', id: 'profile', icon: UserIcon },
          { name: 'Logout', id: 'logout', icon: LogOut },
        ]
      : [{ name: 'Login', id: 'signin', icon: LogIn }]),
  ];

  // ─ Render page contents with props ───────────────────────────────────────
  const renderContent = () => {
    switch (activePage) {
      case 'home':           return <Home onNavigate={setActivePage} />;
      case 'docs':           return <Docs />;
      case 'news':           return <News />;
      case 'products':       return <ProductsPage onNavigate={setActivePage} />;
      case 'projects':       return <Projects onNavigate={setActivePage} />;
      case 'pricing':        return <PricingPage />;
      case 'editor':         return <Editor onNavigate={setActivePage} />;
      case 'feedback':       return <FeedbackPage />;
      case 'signin':         
        return <SignIn onNavigate={setActivePage} onAuthSuccess={restoreSession} />;
      case 'signup':         
        return <SignUp onNavigate={setActivePage} onAuthSuccess={restoreSession} />;
      case 'result':         return <ResultPage onNavigate={setActivePage} />;
      case 'profile':        
        return <ProfilePage onNavigate={setActivePage} user={user} profile={profile} onLogout={handleLogout} />;
      case 'oauth-callback': return <OAuthCallback onNavigate={setActivePage} />;
      default:               return <Home onNavigate={setActivePage} />;
    }
  };

  const showNavbar = activePage !== 'oauth-callback';

  // Compute available credits locally for the floating header
  const availableCredits = profile ? profile.credits - profile.reserved_credits : 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-[#00AAFF]/30 selection:text-white">
      {showNavbar && (
        <NavBar items={navItems} onNavigate={handleNavigation} activePage={activePage} />
      )}

      {/* Floating Auth Indicators */}
      {isAuthenticated && profile && activePage !== 'editor' && activePage !== 'oauth-callback' && (
        <div className="fixed top-4 right-6 z-50 flex items-center gap-3 px-4 py-2 bg-neutral-900/80 backdrop-blur-md border border-white/10 rounded-full shadow-lg shadow-black/30">
          <div className="w-2 h-2 rounded-full bg-[#00AAFF] shadow-[0_0_6px_#00AAFF]" />
          <span className="text-xs font-semibold text-neutral-300">{profile.username}</span>
          <div className="pl-3 border-l border-white/10">
            <span className="text-xs font-bold text-[#00AAFF]">
              {availableCredits} credits
            </span>
          </div>
        </div>
      )}

      <main className={showNavbar ? "pt-20 min-h-screen" : "min-h-screen"}>
        {isAuthLoading ? (
          <div className="w-full min-h-screen flex items-center justify-center bg-neutral-950">
            <Loader2 className="w-12 h-12 animate-spin text-[#00AAFF]" />
          </div>
        ) : (
          renderContent()
        )}
      </main>

      {activePage !== 'editor' && activePage !== 'oauth-callback' && <Footer />}
    </div>
  );
}