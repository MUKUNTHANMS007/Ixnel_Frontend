import React from 'react';
import { motion } from 'framer-motion';
import { Download, Layers, ArrowLeft, Share2, Sparkles, CheckCircle2, Play, ExternalLink } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';

interface ResultPageProps {
  onNavigate: (page: string) => void;
}

export default function ResultPage({ onNavigate }: ResultPageProps) {
  const { activeResult, activeProjectName } = useProjectStore();
  const [videoError, setVideoError] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(activeResult?.status === 'processing' || activeResult?.status === 'pending');
  const [progress, setProgress] = React.useState(0);
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

  if (!activeResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-neutral-300" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">No Result Selected</h2>
        <p className="text-neutral-500 mb-8 max-w-md">
          You haven't generated any results yet or the current session has expired. Return to the editor to create something amazing!
        </p>
        <button 
          onClick={() => onNavigate('editor')}
          className="px-8 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Go to Editor
        </button>
      </div>
    );
  }

  if (!activeResult || !localResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-neutral-300" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">No Result Selected</h2>
        <p className="text-neutral-500 mb-8 max-w-md">
          You haven't generated any results yet or the current session has expired. Return to the editor to create something amazing!
        </p>
        <button 
          onClick={() => onNavigate('editor')}
          className="px-8 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Go to Editor
        </button>
      </div>
    );
  }

  const { videoUrl, psdUrl, type, fidelity } = localResult;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <button 
            onClick={() => onNavigate(type === 'generation' ? 'editor' : 'products')}
            className="flex items-center gap-2 text-sm font-bold text-neutral-400 uppercase tracking-widest hover:text-indigo-600 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Back to {type === 'generation' ? 'Workspace' : 'Transition Tester'}
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight">
            AI <span className="text-indigo-600">Generation</span> Result
          </h1>
          <p className="text-lg text-neutral-500 mt-2 font-medium flex items-center gap-2">
            {type === 'generation' ? `Project: ${activeProjectName}` : 'Transition AI Synthesis'}
            {fidelity === 'high' && (
              <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-full flex items-center gap-1 shadow-sm animate-pulse">
                <Sparkles className="w-2.5 h-2.5 fill-current" />
                HIGH FIDELITY
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 border rounded-full flex items-center gap-2 text-sm font-bold shadow-sm transition-all duration-500 ${isProcessing ? 'bg-indigo-50 border-indigo-100 text-indigo-700 animate-pulse' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
            {isProcessing ? <Sparkles className="w-4 h-4 animate-spin-slow" /> : <CheckCircle2 className="w-4 h-4" />}
            {isProcessing ? 'Rendering in Progress' : 'Ready for Download'}
          </div>
          <button className="p-2.5 bg-white border border-neutral-200 rounded-full text-neutral-500 hover:bg-neutral-50 transition-all">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Preview */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-3xl overflow-hidden border border-neutral-200 shadow-2xl bg-black aspect-video group"
          >
            {isProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 z-30 p-12 overflow-hidden">
                <div className="relative w-full max-w-md">
                   {/* Animated Background Pulse */}
                  <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
                  
                  <div className="relative flex flex-col items-center">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/40 rotate-12 animate-bounce">
                      <Sparkles className="w-10 h-10 text-white fill-current" />
                    </div>
                    
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Rendering Animation...</h3>
                    <p className="text-neutral-400 text-sm mb-12 font-medium">ToonCrafter is synthesising 16 ultra-smooth frames</p>
                    
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      />
                    </div>
                    
                    <div className="flex justify-between w-full text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">
                      <span>Pose Synthesis</span>
                      <span>{Math.round(progress)}% Complete</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : videoError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-neutral-900 z-20">
                <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4 text-neutral-400">
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
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Resolution</span>
              <span className="text-sm font-bold text-neutral-900">512 x 512</span>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Format</span>
              <span className="text-sm font-bold text-neutral-900">H.264 MP4</span>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Duration</span>
              <span className="text-sm font-bold text-neutral-900">16 Frames</span>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Engine</span>
              <span className="text-sm font-bold text-indigo-600">ToonCrafter v1.0</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-neutral-900 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
              <Sparkles className="w-20 h-20 text-indigo-400" />
            </div>
            
            <h3 className="text-xl font-bold mb-2">Premium Rendering</h3>
            <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
              Your animation was processed using the {fidelity === 'high' ? 'Personalized' : 'Standard'} ToonCrafter model.
            </p>

            <div className="space-y-3">
              <a 
                href={isProcessing ? '#' : videoUrl}
                download={isProcessing ? undefined : `ixnel-animation-${Date.now()}.mp4`}
                target={isProcessing ? undefined : "_blank"}
                rel={isProcessing ? undefined : "noopener noreferrer"}
                onClick={(e) => isProcessing && e.preventDefault()}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${isProcessing ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'}`}
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
                  className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all border active:scale-95 ${isProcessing ? 'bg-neutral-800/50 text-neutral-500 cursor-not-allowed border-neutral-700' : 'bg-white/10 hover:bg-white/15 text-white border-white/10'}`}
                >
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Download Layered PSD
                </a>
              )}
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-neutral-200 bg-white">
            <h4 className="text-sm font-bold text-neutral-900 mb-4">Post-Processing Tips</h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 h-fit">
                  <Play className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  ToonCrafter ensures high temporal coherence, making these results ideal for high-end character work.
                </p>
              </li>
              <li className="flex gap-3">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 h-fit">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Open the PSD in Photoshop to adjust individual interpolated frames manually if needed.
                </p>
              </li>
            </ul>
            
            <button 
              onClick={() => onNavigate('docs')}
              className="mt-6 w-full py-2.5 rounded-xl border border-neutral-100 bg-neutral-50 text-neutral-500 text-xs font-bold hover:bg-neutral-100 transition-all flex items-center justify-center gap-2"
            >
              View Documentation <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
