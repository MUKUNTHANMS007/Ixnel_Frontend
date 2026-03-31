import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Calendar, User, ArrowUpRight, Loader2, Edit2, Trash2, PlusCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

interface NewsArticle {
  _id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  author: string;
  image: string;
  featured?: boolean;
  slug: string;
}

// Fallback data when API has no articles yet
const fallbackArticles: NewsArticle[] = [
  {
    _id: '1',
    title: "Introducing Temporal Engine v2.0",
    excerpt: "Our most significant update yet brings 4K temporal upscaling and real-time motion synthesis to the workspace.",
    date: "2026-10-12",
    category: "Product",
    author: "Engineering Team",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    featured: true,
    slug: "temporal-engine-v2"
  },
  {
    _id: '2',
    title: "The Future of AI Video Generation",
    excerpt: "How we're solving the consistency problem in long-form AI video generation through temporal coherence.",
    date: "2026-10-10",
    category: "Engineering",
    author: "Dr. Sarah Chen",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400",
    slug: "future-ai-video"
  },
  {
    _id: '3',
    title: "Creator Spotlight: Digital Dreams",
    excerpt: "A deep dive into how top studios are using Ixnel to revolutionize their post-production workflow.",
    date: "2026-10-08",
    category: "Community",
    author: "Content Team",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=400",
    slug: "creator-spotlight-digital-dreams"
  },
  {
    _id: '4',
    title: "Ixnel Raises $40M Series B",
    excerpt: "We're expanding our team and infrastructure to accelerate the development of next-gen creative tools.",
    date: "2026-10-05",
    category: "Announcements",
    author: "Alex Rivera",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400",
    slug: "series-b-funding"
  }
];

export default function News() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const categories = ["All", "Product", "Engineering", "Community", "Announcements"];
  const [activeCategory, setActiveCategory] = useState("All");
  const [articles, setArticles] = useState<NewsArticle[]>(fallbackArticles);
  const [isLoading, setIsLoading] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const params = activeCategory !== 'All' ? `?category=${activeCategory}` : '';
        const res = await api<NewsArticle[]>(`/news${params}`);
        if (res.success && res.data && res.data.length > 0) {
          setArticles(res.data);
        } else {
          // Use fallback data, filtered by category
          const filtered = activeCategory === 'All' 
            ? fallbackArticles 
            : fallbackArticles.filter(a => a.category === activeCategory);
          setArticles(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch news, using fallbacks:", err);
        const filtered = activeCategory === 'All' 
          ? fallbackArticles 
          : fallbackArticles.filter(a => a.category === activeCategory);
        setArticles(filtered);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, [activeCategory]);

  const handleSubscribe = async () => {
    if (!newsletterEmail) return;
    setSubscribing(true);
    const res = await api('/newsletter/subscribe', {
      method: 'POST',
      body: { email: newsletterEmail },
    });
    if (res.success) {
      setNewsletterMsg(res.message || 'Successfully subscribed!');
      setNewsletterEmail('');
    } else {
      setNewsletterMsg(res.error || 'Subscription failed');
    }
    setSubscribing(false);
    setTimeout(() => setNewsletterMsg(''), 4000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  const featured = articles.find(item => item.featured);
  const others = articles.filter(item => !item.featured);

  return (
    <div className="w-full relative overflow-hidden bg-white text-neutral-900 min-h-screen">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      <section className="relative pt-12 pb-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Updates & <span className="gradient-text">Insights</span>
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <p className="text-lg text-neutral-600">
                  The latest news, engineering breakthroughs, and community highlights from the Ixnel team.
                </p>
                {isAdmin && (
                  <button 
                    onClick={() => window.location.href = '/admin'}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-full text-sm font-bold shadow-lg shadow-neutral-200/50 hover:bg-indigo-600 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" /> Publish New
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-neutral-50 p-1 rounded-full border border-neutral-200">
              <div className="flex items-center gap-2 pl-4 text-neutral-400">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Search articles..."
                className="bg-transparent border-none outline-none text-sm py-2 pr-4 w-48 md:w-64"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map((cat, i) => (
              <button 
                key={i}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  cat === activeCategory 
                    ? "bg-neutral-900 text-white shadow-md shadow-neutral-200" 
                    : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            </div>
          )}

          {!isLoading && (
            <>
              {/* Featured Post */}
              {featured && (
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="glass-card mb-16 overflow-hidden bg-white group cursor-pointer"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 h-full relative">
                    {/* Admin Tools Menu */}
                    {isAdmin && (
                      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                         <button onClick={(e) => { e.stopPropagation(); alert('Edit mode activated.'); }} className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow border border-neutral-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition">
                           <Edit2 className="w-4 h-4" />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); alert('Delete confirmed.'); }} className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow border border-neutral-100 text-red-500 hover:bg-red-500 hover:text-white transition">
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    )}
                    <div className="lg:col-span-3 h-64 md:h-auto overflow-hidden">
                      <img 
                        src={featured.image} 
                        alt={featured.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-8 lg:col-span-2 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider rounded-full">
                          {featured.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-neutral-400">
                          <Calendar className="w-3 h-3" />
                          {formatDate(featured.date)}
                        </span>
                      </div>
                      <h2 className="text-3xl font-bold mb-4 group-hover:text-indigo-600 transition-colors">
                        {featured.title}
                      </h2>
                      <p className="text-neutral-600 mb-8 line-clamp-3">
                        {featured.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-tr from-neutral-300 to-neutral-400" />
                          </div>
                          <span className="text-sm font-medium">{featured.author}</span>
                        </div>
                        <button className="flex items-center gap-1 text-sm font-bold text-neutral-900 group/btn">
                          Read More
                          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* News Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {others.map((item, index) => (
                  <motion.div 
                    key={item._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="glass-card flex flex-col h-full bg-white group cursor-pointer overflow-hidden relative"
                  >
                    {/* Admin Tools Menu */}
                    {isAdmin && (
                      <div className="absolute top-4 right-4 z-20 flex gap-2">
                         <button onClick={(e) => { e.stopPropagation(); alert('Edit mode activated.'); }} className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm text-indigo-600 hover:scale-110 transition">
                           <Edit2 className="w-4 h-4" />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); alert('Delete confirmed.'); }} className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm text-red-500 hover:scale-110 transition">
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    )}
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-neutral-900 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-4 text-[10px] text-neutral-400 mb-4 font-medium uppercase tracking-widest">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {item.author}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-neutral-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                        {item.excerpt}
                      </p>
                      <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900 flex items-center gap-1">
                          READ FULL ARTICLE
                          <ArrowUpRight className="w-3 h-3" />
                        </span>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100"
                        >
                          <ArrowRight className="w-4 h-4 text-neutral-400" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Newsletter */}
          <div className="mt-24 p-12 rounded-3xl bg-neutral-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-md">
                <h2 className="text-3xl font-bold mb-4">Stay ahead of the curve</h2>
                <p className="text-neutral-400">
                  Join 10,000+ creators and engineers receiving our weekly digest on AI video synthesis and temporal coherence.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full max-w-md">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-white/10 border border-white/20 rounded-full px-6 py-3 flex-grow outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button 
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className="bg-white text-neutral-900 px-8 py-3 rounded-full font-bold hover:bg-neutral-100 transition-colors whitespace-nowrap disabled:opacity-60"
                  >
                    {subscribing ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </div>
                {newsletterMsg && (
                  <p className="text-sm text-indigo-300 text-center">{newsletterMsg}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
