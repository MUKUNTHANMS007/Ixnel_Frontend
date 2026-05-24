import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Star, ThumbsUp, Heart, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

export default function Feedback() {
  const [rating, setRating] = useState<number | null>(null);
  const[hoveredRating, setHoveredRating] = useState<number | null>(null);
  const[submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('Feature');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const res = await api('/feedback', {
      method: 'POST',
      body: { rating, name, email, type, message },
    });

    setIsSubmitting(false);

    if (res.success) {
      setSubmitted(true);
      // Reset form
      setRating(null);
      setName('');
      setEmail('');
      setType('Feature');
      setMessage('');
    } else {
      setErrorMsg(res.error || 'Failed to submit feedback. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6 bg-neutral-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative text-center p-12 rounded-[48px] bg-gradient-to-br from-[#00AAFF]/10 via-neutral-900 to-neutral-950 border border-white/10 shadow-2xl shadow-[#00AAFF]/5 max-w-lg overflow-hidden"
        >
          {/* Subtle Glow Orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#00AAFF]/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />

          <div className="relative z-10">
            <div className="w-20 h-20 bg-[#00AAFF]/10 border border-[#00AAFF]/20 text-[#00AAFF] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#00AAFF]/20">
              <Heart className="w-10 h-10 fill-current" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">Thank you for the love!</h2>
            <p className="text-neutral-400 font-medium mb-8 text-lg leading-relaxed">
              Your feedback helps us make Ixnel better for everyone. We've received your thoughts and will review them shortly.
            </p>
            <button 
              onClick={() => setSubmitted(false)}
              className="px-8 py-4 bg-[#00AAFF] text-neutral-950 rounded-2xl font-bold hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#00AAFF]/25"
            >
              Send More Feedback
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-6 bg-neutral-950 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00AAFF]/30 bg-[#00AAFF]/5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00AAFF] animate-pulse" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#00AAFF] flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              Feedback Hub
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Help us shape <span className="text-[#00AAFF]">Ixnel</span>
          </h1>
          <p className="text-xl text-neutral-400 font-medium max-w-2xl mx-auto leading-relaxed">
            We're building the future of hybrid animation, and your voice is our most important tool. Share your thoughts, bugs, or feature ideas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form Side */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="relative space-y-8 bg-black/20 p-10 rounded-[40px] border border-white/5 shadow-2xl shadow-[#00AAFF]/5 overflow-hidden">
              
              {/* Subtle top edge glow */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/30 to-transparent" />

              {errorMsg && (
                <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl text-sm font-medium border border-red-500/20">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-4 text-center pb-8 border-b border-white/5">
                <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">How would you rate your experience?</p>
                <div className="flex justify-center gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(null)}
                      onClick={() => setRating(star)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        (hoveredRating || rating || 0) >= star 
                        ? 'bg-[#00AAFF]/20 text-[#00AAFF] border border-[#00AAFF]/30 scale-110 shadow-lg shadow-[#00AAFF]/20' 
                        : 'bg-white/5 text-neutral-600 hover:bg-white/10 hover:text-neutral-400 border border-transparent'
                      }`}
                    >
                      <Star className={`w-6 h-6 ${(hoveredRating || rating || 0) >= star ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe" 
                    className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder:text-neutral-600 focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all outline-none font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com" 
                    className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder:text-neutral-600 focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all outline-none font-medium" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Feedback Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['Feature', 'Bug', 'Design', 'Other'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all duration-300 ${
                        type === t 
                          ? 'bg-[#00AAFF]/10 border-[#00AAFF]/50 text-[#00AAFF] shadow-[0_0_15px_rgba(0,170,255,0.15)]'
                          : 'bg-black/40 border-white/10 text-neutral-500 hover:bg-white/5 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Your Message</label>
                <textarea 
                  required
                  rows={4} 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..." 
                  className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder:text-neutral-600 focus:ring-1 focus:ring-[#00AAFF]/50 focus:border-[#00AAFF] transition-all outline-none font-medium resize-none" 
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-[#00AAFF] text-neutral-950 rounded-2xl font-black text-lg shadow-lg shadow-[#00AAFF]/25 hover:shadow-white/10 hover:bg-white hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Send Feedback
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info Side */}
          <div className="space-y-8">
            <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:bg-[#00AAFF]/[0.02] transition-colors duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00AAFF]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-[#00AAFF]/20 transition-all duration-500" />
              <div className="relative z-10">
                <ThumbsUp className="w-8 h-8 text-[#00AAFF] mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">Community First</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  We review every bit of feedback. The features you see today were requested by users like you.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-[32px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300">
              <AlertCircle className="w-8 h-8 text-[#00AAFF] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Found a Bug?</h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Please try to be as descriptive as possible. Screenshots of the console or error messages are extremely helpful!
              </p>
              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 text-xs font-bold text-neutral-500 uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-[#00AAFF] animate-pulse shadow-[0_0_8px_rgba(0,170,255,0.8)]" />
                  Support Status: Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}