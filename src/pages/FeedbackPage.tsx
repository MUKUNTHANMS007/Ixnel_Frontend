import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Star, ThumbsUp, Heart, AlertCircle } from 'lucide-react';

export default function Feedback() {
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 rounded-[48px] bg-white border border-neutral-100 shadow-2xl max-w-lg"
        >
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Heart className="w-10 h-10 fill-current" />
          </div>
          <h2 className="text-3xl font-black text-neutral-900 mb-4">Thank you for the love!</h2>
          <p className="text-neutral-500 font-medium mb-8 text-lg">
            Your feedback helps us make Ixnel better for everyone. We've received your thoughts and will review them shortly.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="px-8 py-4 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-neutral-800 transition-all"
          >
            Send More Feedback
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest mb-6">
            <MessageSquare className="w-4 h-4" />
            Feedback Hub
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-neutral-900 mb-6 tracking-tight">
            Help us shape <span className="text-indigo-600">Ixnel</span>
          </h1>
          <p className="text-xl text-neutral-500 font-medium max-w-2xl mx-auto leading-relaxed">
            We're building the future of hybrid animation, and your voice is our most important tool. Share your thoughts, bugs, or feature ideas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form Side */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-10 rounded-[40px] border border-neutral-100 shadow-xl shadow-neutral-200/40">
              <div className="space-y-4 text-center pb-8 border-b border-neutral-50">
                <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">How would you rate your experience?</p>
                <div className="flex justify-center gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(null)}
                      onClick={() => setRating(star)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        (hoveredRating || rating || 0) >= star 
                        ? 'bg-amber-100 text-amber-500 scale-110' 
                        : 'bg-neutral-50 text-neutral-300 hover:bg-neutral-100'
                      }`}
                    >
                      <Star className={`w-6 h-6 ${(hoveredRating || rating || 0) >= star ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-600 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="John Doe" 
                    className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-600 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="john@example.com" 
                    className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-600 ml-1">Feedback Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['Feature', 'Bug', 'Design', 'Other'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      className="py-3 px-4 rounded-xl border border-neutral-100 bg-neutral-50 text-neutral-500 text-sm font-bold hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-600 ml-1">Your Message</label>
                <textarea 
                  required
                  rows={4} 
                  placeholder="Tell us what's on your mind..." 
                  className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium resize-none" 
                />
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Send Feedback
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Info Side */}
          <div className="space-y-8">
            <div className="p-8 rounded-[32px] bg-neutral-900 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-indigo-500/30 transition-all" />
              <div className="relative z-10">
                <ThumbsUp className="w-8 h-8 text-indigo-400 mb-6" />
                <h3 className="text-xl font-bold mb-3">Community First</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  We review every bit of feedback. The features you see today were requested by users like you.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-[32px] border border-neutral-100 bg-white">
              <AlertCircle className="w-8 h-8 text-amber-500 mb-6" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Found a Bug?</h3>
              <p className="text-neutral-500 text-sm leading-relaxed mb-6">
                Please try to be as descriptive as possible. Screenshots of the console or error messages are extremely helpful!
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
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
