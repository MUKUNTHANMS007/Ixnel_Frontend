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
const fallbackArticles: NewsArticle[] =[
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
  const[activeCategory, setActiveCategory] = useState("All");
  const [articles, setArticles] = useState<NewsArticle[]>(fallbackArticles);
  const [isLoading, setIsLoading] = useState(false);
  const[newsletterEmail, setNewsletterEmail] = useState('');
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
    <div className="w-full relative overflow-hidden bg-neutral-950 text-white min-h-screen">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-[#00AAFF]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#00AAFF]/5 blur-[120px] rounded-full pointer-events-none" />

      <section className="relative pt-12 pb-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00AAFF]/30 bg-[#00AAFF]/5 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00AAFF] animate-pulse" />
                <span className="text-xs font-semibold tracking-widest uppercase text-[#00AAFF]">Newsroom</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 text-white">
                Updates & <span className="text-[#00AAFF]">Insights</span>
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <p className="text-lg text-neutral-400 leading-relaxed">
                  The latest news, engineering breakthroughs, and community highlights from the Ixnel team.
                </p>
                {isAdmin && (
                  <button 
                    onClick={() => window.location.href = '/admin'}
                    className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-[#00AAFF] text-neutral-950 rounded-xl text-sm font-bold shadow-lg shadow-[#00AAFF]/25 hover:bg-white transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" /> Publish New
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-black/40 p-1.5 rounded-full border border-white/10 focus-within:border-[#00AAFF]/50 focus-within:ring-1 focus-within:ring-[#00AAFF]/50 transition-all">
              <div className="flex items-center gap-2 pl-4 text-neutral-500">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Search articles..."
                className="bg-transparent border-none outline-none text-sm text-white placeholder:text-neutral-500 py-2 pr-4 w-48 md:w-64"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-3 mb-12">
            {categories.map((cat, i) => (
              <button 
                key={i}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
                  cat === activeCategory 
                    ? "bg-[#00AAFF]/10 text-[#00AAFF] border border-[#00AAFF]/30 shadow-[0_0_15px_rgba(0,170,255,0.15)]" 
                    : "bg-black/40 text-neutral-400 border border-white/10 hover:border-white/30 hover:text-white hover:bg-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#00AAFF]" />
            </div>
          )}

          {!isLoading && (
            <>
              {/* Featured Post */}
              {featured && (
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="mb-16 overflow-hidden bg-white/[0.02] border border-white/5 rounded-[32px] group cursor-pointer hover:border-[#00AAFF]/30 hover:bg-white/[0.04] transition-all duration-500 shadow-2xl shadow-black/50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 h-full relative">
                    {/* Admin Tools Menu */}
                    {isAdmin && (
                      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                         <button onClick={(e) => { e.stopPropagation(); alert('Edit mode activated.'); }} className="p-2.5 bg-neutral-900/80 backdrop-blur-md rounded-full shadow-lg border border-white/10 text-neutral-400 hover:text-[#00AAFF] hover:border-[#00AAFF]/30 transition-all">
                           <Edit2 className="w-4 h-4" />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); alert('Delete confirmed.'); }} className="p-2.5 bg-neutral-900/80 backdrop-blur-md rounded-full shadow-lg border border-white/10 text-neutral-400 hover:text-red-500 hover:border-red-500/30 transition-all">
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
                    <div className="p-8 lg:col-span-2 flex flex-col justify-center relative">
                      {/* Subtle Glow on text side */}
                      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent to-[#00AAFF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                          <span className="px-3 py-1 bg-[#00AAFF]/10 text-[#00AAFF] border border-[#00AAFF]/20 text-xs font-bold uppercase tracking-wider rounded-full">
                            {featured.category}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 uppercase tracking-widest">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(featured.date)}
                          </span>
                        </div>
                        <h2 className="text-3xl font-black mb-4 text-white group-hover:text-[#00AAFF] transition-colors duration-300 leading-tight">
                          {featured.title}
                        </h2>
                        <p className="text-neutral-400 mb-8 line-clamp-3 leading-relaxed">
                          {featured.excerpt}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-neutral-800 overflow-hidden border border-white/10">
                              <div className="w-full h-full bg-gradient-to-tr from-[#00AAFF]/20 to-[#00AAFF]/5" />
                            </div>
                            <span className="text-sm font-bold text-neutral-300">{featured.author}</span>
                          </div>
                          <button className="flex items-center gap-2 text-sm font-bold text-[#00AAFF] group/btn">
                            Read More
                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                          </button>
                        </div>
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
                    className="flex flex-col h-full bg-white/[0.02] border border-white/5 rounded-3xl group cursor-pointer overflow-hidden relative hover:bg-white/[0.04] hover:border-[#00AAFF]/30 transition-all duration-300 shadow-xl shadow-black/40"
                  >
                    {/* Admin Tools Menu */}
                    {isAdmin && (
                      <div className="absolute top-4 right-4 z-20 flex gap-2">
                         <button onClick={(e) => { e.stopPropagation(); alert('Edit mode activated.'); }} className="p-2 bg-neutral-900/80 backdrop-blur-md rounded-full shadow-lg border border-white/10 text-neutral-400 hover:text-[#00AAFF] hover:border-[#00AAFF]/30 hover:scale-110 transition-all">
                           <Edit2 className="w-3.5 h-3.5" />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); alert('Delete confirmed.'); }} className="p-2 bg-neutral-900/80 backdrop-blur-md rounded-full shadow-lg border border-white/10 text-neutral-400 hover:text-red-500 hover:border-red-500/30 hover:scale-110 transition-all">
                           <Trash2 className="w-3.5 h-3.5" />
                         </button>
                      </div>
                    )}
                    <div className="h-52 overflow-hidden relative border-b border-white/5">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-[#00AAFF] text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-7 flex flex-col flex-grow">
                      <div className="flex items-center gap-4 text-[10px] text-neutral-500 mb-4 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="w-3 h-3" />
                          {item.author}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00AAFF] transition-colors duration-300 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-neutral-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                        {item.excerpt}
                      </p>
                      <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-300 group-hover:text-white transition-colors flex items-center gap-1 tracking-widest">
                          READ ARTICLE
                          <ArrowUpRight className="w-3 h-3 text-[#00AAFF]" />
                        </span>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#00AAFF]/10 group-hover:border-[#00AAFF]/30 group-hover:text-[#00AAFF] transition-colors"
                        >
                          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#00AAFF]" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Newsletter */}
          <div className="mt-28 p-12 rounded-[32px] border border-[#00AAFF]/20 bg-gradient-to-br from-[#00AAFF]/10 via-neutral-900 to-neutral-950 relative overflow-hidden shadow-2xl shadow-[#00AAFF]/5">
            {/* Glow Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#00AAFF]/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00AAFF]/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/50 to-transparent" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-md text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">Stay ahead of the curve</h2>
                <p className="text-neutral-400 leading-relaxed">
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
                    className="bg-black/40 border border-white/10 rounded-xl px-6 py-4 flex-grow outline-none focus:border-[#00AAFF] focus:ring-1 focus:ring-[#00AAFF] text-white placeholder:text-neutral-500 transition-all font-medium"
                  />
                  <button 
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className="bg-[#00AAFF] text-neutral-950 px-8 py-4 rounded-xl font-bold text-sm tracking-wide hover:bg-white shadow-lg shadow-[#00AAFF]/25 hover:shadow-white/10 transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {subscribing ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </div>
                {newsletterMsg && (
                  <p className="text-sm font-medium text-[#00AAFF] text-center sm:text-left mt-2">{newsletterMsg}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}