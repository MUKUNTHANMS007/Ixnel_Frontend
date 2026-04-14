import React from 'react';
import { motion } from 'framer-motion';
import { Download, Layers, ArrowLeft, Share2, Sparkles, CheckCircle2, Play, ExternalLink } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';

interface ResultPageProps {
  onNavigate: (page: string) => void;
}

export default function ResultPage({ onNavigate }: ResultPageProps) {
  const { activeResult, activeProjectName } = useProjectStore();
  const[videoError, setVideoError] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(activeResult?.status === 'processing' || activeResult?.status === 'pending');
  const[progress, setProgress] = React.useState(0);
  const [localResult, setLocalResult] = React.useState(activeResult);

  // Polling logic
  React.useEffect(() => {
    if (!isProcessing || !activeResult?.id || activeResult.type !== 'generation') return;

    let interval: NodeJS.Timeout;
    const poll = async () => {
      try {
        const response = await fetch(`/api/generations/${activeResult.id}`);
        const result = await response.json();
        
        if (result.success && result.data.status === 'completed') {
          setIsProcessing(false);
          setLocalResult({
            ...activeResult,
            status: 'completed',
            videoUrl: result.data.resultUrl || activeResult.videoUrl,
            psdUrl: result.data.psdUrl || activeResult.psdUrl,
            fidelity: result.data.fidelity || activeResult.fidelity
          });
          clearInterval(interval);
        } else if (result.success && result.data.status === 'failed') {
          setIsProcessing(false);
          setVideoError(true);
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Polling failed:', err);
      }
    };

    interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [isProcessing, activeResult]);

  // Simulated progress bar while rendering
  React.useEffect(() => {
    if (!isProcessing) {
      setProgress(100);
      return;
    }
    const timer = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + Math.random() * 5 : prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [isProcessing]);

  if (!activeResult || !localResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center bg-neutral-950 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00AAFF]/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8 shadow-2xl">
          <Sparkles className="w-10 h-10 text-neutral-600" />
        </div>
        <h2 className="relative z-10 text-3xl font-black text-white mb-4">No Result Selected</h2>
        <p className="relative z-10 text-neutral-400 mb-10 max-w-md text-lg">
          You haven't generated any results yet or the current session has expired. Return to the editor to create something amazing!
        </p>
        <button 
          onClick={() => onNavigate('editor')}
          className="relative z-10 px-8 py-4 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold text-sm tracking-wide hover:bg-white transition-all duration-200 shadow-lg shadow-[#00AAFF]/25 hover:shadow-white/10 flex items-center gap-2 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Go to Editor
        </button>
      </div>
    );
  }

  const { videoUrl, psdUrl, type, fidelity } = localResult;

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <button 
              onClick={() => onNavigate(type === 'generation' ? 'editor' : 'products')}
              className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-widest hover:text-[#00AAFF] transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
              Back to {type === 'generation' ? 'Workspace' : 'Transition Tester'}
            </button>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              AI <span className="text-[#00AAFF]">Generation</span> Result
            </h1>
            <p className="text-lg text-neutral-400 mt-3 font-medium flex flex-wrap items-center gap-3">
              {type === 'generation' ? `Project: ${activeProjectName}` : 'Transition AI Synthesis'}
              {fidelity === 'high' && (
                <span className="px-2.5 py-1 bg-[#00AAFF] text-neutral-950 text-[10px] font-black rounded-full flex items-center gap-1 shadow-[0_0_15px_rgba(0,170,255,0.4)] animate-pulse tracking-wider">
                  <Sparkles className="w-3 h-3 fill-current" />
                  HIGH FIDELITY
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className={`px-5 py-2.5 border rounded-full flex items-center gap-2.5 text-xs font-bold tracking-wide shadow-sm transition-all duration-500 ${isProcessing ? 'bg-[#00AAFF]/10 border-[#00AAFF]/30 text-[#00AAFF] animate-pulse' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
              {isProcessing ? <Sparkles className="w-4 h-4 animate-spin-slow" /> : <CheckCircle2 className="w-4 h-4" />}
              {isProcessing ? 'RENDERING IN PROGRESS' : 'READY FOR DOWNLOAD'}
            </div>
            <button className="p-3 bg-white/[0.02] border border-white/10 rounded-full text-neutral-400 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Preview */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-[#00AAFF]/5 bg-black aspect-video group"
            >
              {isProcessing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-30 p-12 overflow-hidden">
                  <div className="relative w-full max-w-md">
                    {/* Animated Background Pulse */}
                    <div className="absolute inset-0 bg-[#00AAFF]/20 blur-3xl rounded-full animate-pulse pointer-events-none" />
                    
                    <div className="relative flex flex-col items-center">
                      <div className="w-20 h-20 rounded-3xl bg-[#00AAFF] text-neutral-950 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(0,170,255,0.5)] rotate-12 animate-bounce">
                        <Sparkles className="w-10 h-10 fill-current" />
                      </div>
                      
                      <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Rendering Animation...</h3>
                      <p className="text-[#00AAFF] text-sm mb-12 font-medium">ToonCrafter is synthesising 16 ultra-smooth frames</p>
                      
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-[#00AAFF] shadow-[0_0_10px_rgba(0,170,255,0.8)]"
                        />
                      </div>
                      
                      <div className="flex justify-between w-full text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">
                        <span>Pose Synthesis</span>
                        <span>{Math.round(progress)}% Complete</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : videoError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-neutral-900 z-20">
                  <div className="w-16 h-16 rounded-full bg-black/40 border border-white/10 flex items-center justify-center mb-4 text-neutral-500">
                    <Play className="w-8 h-8 opacity-50" />
                  </div>
                  <h3 className="text-white font-bold mb-2">Playback Unavailable</h3>
                  <p className="text-neutral-500 text-sm max-w-xs">
                    Your browser cannot play this video format directly. Please download the file to view it locally.
                  </p>
                </div>
              ) : null}
              
              {!isProcessing && (
                videoUrl.endsWith('.mp4') || videoUrl.includes('mock') ? (
                  <video 
                    src={videoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    onError={() => setVideoError(true)}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img 
                    src={videoUrl} 
                    className="w-full h-full object-contain" 
                    alt="AI Result"
                  />
                )
              )}
              
              {/* Subtle inner shadow overlay */}
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl pointer-events-none" />
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Resolution", val: "512 x 512", highlight: false },
                { label: "Format", val: "H.264 MP4", highlight: false },
                { label: "Duration", val: "16 Frames", highlight: false },
                { label: "Engine", val: "ToonCrafter v1.0", highlight: true },
              ].map((stat, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1.5">{stat.label}</span>
                  <span className={`text-sm font-black ${stat.highlight ? 'text-[#00AAFF]' : 'text-white'}`}>{stat.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="space-y-6">
            <div className="p-8 rounded-[32px] bg-gradient-to-br from-[#00AAFF]/10 via-neutral-900 to-neutral-950 border border-[#00AAFF]/20 text-white shadow-2xl shadow-[#00AAFF]/5 relative overflow-hidden group">
              {/* Glow accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00AAFF]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                <Sparkles className="w-24 h-24 text-[#00AAFF]" />
              </div>
              
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/50 to-transparent" />

              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-3">Premium Rendering</h3>
                <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
                  Your animation was processed using the <span className="text-[#00AAFF] font-semibold">{fidelity === 'high' ? 'Personalized' : 'Standard'} ToonCrafter</span> model.
                </p>

                <div className="space-y-4">
                  <a 
                    href={isProcessing ? '#' : videoUrl}
                    download={isProcessing ? undefined : `ixnel-animation-${Date.now()}.mp4`}
                    target={isProcessing ? undefined : "_blank"}
                    rel={isProcessing ? undefined : "noopener noreferrer"}
                    onClick={(e) => isProcessing && e.preventDefault()}
                    className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 ${
                      isProcessing 
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed shadow-none' 
                        : 'bg-[#00AAFF] text-neutral-950 hover:bg-white shadow-lg shadow-[#00AAFF]/25 hover:shadow-white/10 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    <Download className="w-5 h-5" />
                    Download MP4 Video
                  </a>
                  
                  {psdUrl && (
                    <a 
                      href={isProcessing ? '#' : psdUrl}
                      target={isProcessing ? undefined : "_blank"}
                      rel={isProcessing ? undefined : "noopener noreferrer"}
                      onClick={(e) => isProcessing && e.preventDefault()}
                      className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 border ${
                        isProcessing 
                          ? 'bg-neutral-900 border-white/5 text-neutral-600 cursor-not-allowed' 
                          : 'bg-black/40 border-white/10 text-white hover:border-[#00AAFF]/50 hover:text-[#00AAFF] hover:bg-black/60 hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      <Layers className={`w-5 h-5 ${isProcessing ? 'text-neutral-600' : 'text-[#00AAFF]'}`} />
                      Download Layered PSD
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[32px] border border-white/5 bg-white/[0.02]">
              <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Post-Processing Tips</h4>
              <ul className="space-y-5">
                <li className="flex gap-4">
                  <div className="p-2 rounded-xl bg-[#00AAFF]/10 border border-[#00AAFF]/20 text-[#00AAFF] h-fit">
                    <Play className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed pt-1">
                    ToonCrafter ensures high temporal coherence, making these results ideal for high-end character work.
                  </p>
                </li>
                <li className="flex gap-4">
                  <div className="p-2 rounded-xl bg-[#00AAFF]/10 border border-[#00AAFF]/20 text-[#00AAFF] h-fit">
                    <Layers className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed pt-1">
                    Open the PSD in Photoshop to adjust individual interpolated frames manually if needed.
                  </p>
                </li>
              </ul>
              
              <button 
                onClick={() => onNavigate('docs')}
                className="mt-8 w-full py-3.5 rounded-xl border border-white/10 bg-black/40 text-neutral-400 text-xs font-bold hover:bg-black/60 hover:border-[#00AAFF]/50 hover:text-[#00AAFF] transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                View Documentation <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}