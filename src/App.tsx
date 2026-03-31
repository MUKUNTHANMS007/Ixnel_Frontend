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
import PipelinePage from './pages/PipelinePage';
import FeedbackPage from './pages/FeedbackPage';
import Editor from './pages/Editor';
import Admin from './pages/Admin';
import { useAuthStore } from './store/authStore';
import { Home as HomeIcon, FileText, Newspaper, LogIn, LogOut, FolderOpen, Sparkles, Video, MessageSquare, Box, Settings } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const { isAuthenticated, fetchMe, logout, user } = useAuthStore();

  // Restore session on mount
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const handleLogout = () => {
    logout();
    setActivePage('home');
  };

  const handleNavigation = (page: string) => {
    if (page === 'logout') {
      handleLogout();
      return;
    }
    setActivePage(page);
  };

  const navItems = [
    { name: 'Home', id: 'home', icon: HomeIcon },
    { name: 'Pipeline', id: 'pipeline', icon: Video },
    { name: 'Pricing', id: 'pricing', icon: Sparkles },
    { name: 'Docs', id: 'docs', icon: FileText },
    { name: 'Projects', id: 'projects', icon: FolderOpen },
    { name: 'Editor', id: 'editor', icon: Box },
    { name: 'News', id: 'news', icon: Newspaper },
    { name: 'Feedback', id: 'feedback', icon: MessageSquare },
    ...(isAuthenticated && user?.role === 'admin'
      ? [{ name: 'Admin', id: 'admin', icon: Settings }]
      : []),
    ...(isAuthenticated
      ? [{ name: 'Logout', id: 'logout', icon: LogOut }]
      : [{ name: 'Login', id: 'signin', icon: LogIn }]),
  ];

  const renderContent = () => {
    switch (activePage) {
      case 'home': return <Home onNavigate={setActivePage} />;
      case 'docs': return <Docs />;
      case 'news': return <News />;
      case 'pipeline': return <PipelinePage />;
      case 'projects': return <Projects onNavigate={setActivePage} />;
      case 'pricing': return <PricingPage />;
      case 'editor': return <Editor onNavigate={setActivePage} />;
      case 'feedback': return <FeedbackPage />;
      case 'signin': return <SignIn onNavigate={setActivePage} />;
      case 'signup': return <SignUp onNavigate={setActivePage} />;
      case 'result': return <ResultPage onNavigate={setActivePage} />;
      case 'admin': return <Admin onNavigate={setActivePage} />;
      default: return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-indigo-500/30">
      <NavBar items={navItems} onNavigate={handleNavigation} activePage={activePage} />

      {/* Auth indicator */}
      {isAuthenticated && user && activePage !== 'editor' && (
        <div className="fixed top-4 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-neutral-200 rounded-full shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-medium text-neutral-600">{user.name}</span>
        </div>
      )}

      <main className="pt-20 min-h-screen">
        {renderContent()}
      </main>
      {activePage !== 'editor' && <Footer />}
    </div>
  );
}