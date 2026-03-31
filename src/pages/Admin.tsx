import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { LayoutDashboard, Newspaper, Settings, Users, CheckCircle2, Lock, Edit3 } from 'lucide-react';

export default function Admin({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('content');
  
  // Settings Tab State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Content Manager State
  const [article, setArticle] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Announcements',
    author: user?.name || 'Admin',
    image: '',
    featured: false
  });
  const [articleMessage, setArticleMessage] = useState({ text: '', type: '' });
  const [isPublishing, setIsPublishing] = useState(false);

  // Security check - kick out non-admins immediately
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Lock className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-neutral-900">Access Denied</h2>
        <p className="text-neutral-500 mt-2">You do not have permission to view this page.</p>
        <button 
          onClick={() => onNavigate('home')}
          className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await api('/auth/password', {
        method: 'PUT',
        token,
        body: { currentPassword, newPassword }
      });

      if (res.success) {
        setMessage({ text: 'Password updated successfully!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setMessage({ text: res.error || 'Failed to update password.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An unexpected error occurred.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setArticleMessage({ text: '', type: '' });

    try {
      const res = await api('/news', {
        method: 'POST',
        token,
        body: {
          ...article,
          date: new Date().toISOString()
        }
      });

      if (res.success) {
        setArticleMessage({ text: 'Article published successfully!', type: 'success' });
        setArticle({
          title: '', slug: '', excerpt: '', content: '',
          category: 'Announcements', author: user.name, image: '', featured: false
        });
      } else {
        setArticleMessage({ text: res.error || 'Failed to publish article.', type: 'error' });
      }
    } catch (error) {
      setArticleMessage({ text: 'An unexpected error occurred.', type: 'error' });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-10 border-b border-neutral-200 pb-6">
        <LayoutDashboard className="w-8 h-8 text-indigo-600" />
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-500">
            Ixnel Control Center
          </h1>
          <p className="text-neutral-500 tracking-wide mt-1">Welcome back, {user.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('content')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'content' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-neutral-600 hover:bg-neutral-50'}`}
          >
            <Newspaper className="w-5 h-5" />
            Content Manager
          </button>
          
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-neutral-600 hover:bg-neutral-50'}`}
          >
            <Users className="w-5 h-5" />
            Active Users
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-neutral-600 hover:bg-neutral-50'}`}
          >
            <Settings className="w-5 h-5" />
            Admin Settings
          </button>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3">
          {activeTab === 'content' && (
            <div className="p-8 rounded-2xl bg-white border border-neutral-100 shadow-sm shadow-neutral-200/50">
              <div className="flex items-center gap-3 mb-6">
                <Edit3 className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold">Publish News Article</h2>
              </div>
              
              <form onSubmit={handlePublishArticle} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Title</label>
                    <input 
                      type="text" 
                      value={article.title}
                      onChange={(e) => setArticle({ ...article, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                      placeholder="Article Title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
                    <select 
                      value={article.category}
                      onChange={(e) => setArticle({ ...article, category: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="Announcements">Announcements</option>
                      <option value="Product">Product</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Community">Community</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Slug (URL)</label>
                    <input 
                      type="text" 
                      value={article.slug}
                      onChange={(e) => setArticle({ ...article, slug: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Hero Image URL</label>
                    <input 
                      type="url" 
                      value={article.image}
                      onChange={(e) => setArticle({ ...article, image: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Excerpt (Summary)</label>
                  <textarea 
                    value={article.excerpt}
                    onChange={(e) => setArticle({ ...article, excerpt: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
                    required
                    placeholder="Short summary for the news card..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Markdown Content</label>
                  <textarea 
                    value={article.content}
                    onChange={(e) => setArticle({ ...article, content: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm h-64"
                    required
                    placeholder="# Main Header&#10;&#10;Write your article here using Markdown..."
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="featured"
                    checked={article.featured}
                    onChange={(e) => setArticle({ ...article, featured: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-neutral-300"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-neutral-700">Feature this article at the top of the news page</label>
                </div>

                {articleMessage.text && (
                  <div className={`p-4 rounded-xl flex items-center gap-2 ${articleMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {articleMessage.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                    <p className="text-sm">{articleMessage.text}</p>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit" 
                    disabled={isPublishing}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm shadow-indigo-200"
                  >
                    {isPublishing ? 'Publishing...' : 'Publish Article'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-8 rounded-2xl bg-white border border-neutral-100 shadow-sm shadow-neutral-200/50">
              <h2 className="text-xl font-bold mb-6">Security Settings</h2>
              
              <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    placeholder="Minimal 6 characters"
                    required
                  />
                </div>

                {message.text && (
                  <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                    <p className="text-sm">{message.text}</p>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="p-12 text-center rounded-2xl bg-neutral-50/50 border border-neutral-100 border-dashed">
              <Users className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900">User Telemetry</h3>
              <p className="text-neutral-500 mt-2">View all registered AstraDB users and their generation limits.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
