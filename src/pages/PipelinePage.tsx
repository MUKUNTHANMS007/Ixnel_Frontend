import { useState, useRef } from 'react';
import { usePipeline } from '../lib/usePipeline';
import { pipelineApi } from '../lib/pipelineApi';
import { JobProgress } from '../components/JobProgress';
import { VideoPlayer } from '../components/VideoPlayer';
import { Upload, X, Image as ImageIcon, Settings, Save, Loader2, Check } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';

export default function PipelinePage() {
  const { state, jobId, status, error, startJob, reset } = usePipeline();
  const { createProject, setActiveResult } = useProjectStore();
  const { isAuthenticated } = useAuthStore();
  
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [lineartFrames, setLineartFrames] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Optional settings
  const [fps, setFps] = useState<number>(24);
  const [nFrames, setNFrames] = useState<number>(0);

  const refInputRef = useRef<HTMLInputElement>(null);
  const lineartInputRef = useRef<HTMLInputElement>(null);

  const handleRefUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReferenceImage(e.target.files[0]);
    }
  };

  const handleLineartUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setLineartFrames(files);
      setNFrames(files.length);
    }
  };

  const handleGenerate = () => {
    if (referenceImage && lineartFrames.length > 0) {
      setSaved(false);
      startJob(referenceImage, lineartFrames, { fps, n_frames: nFrames });
    }
  };

  const handleReset = () => {
    setReferenceImage(null);
    setLineartFrames([]);
    setSaved(false);
    reset();
  };

  const handleSaveToProjects = async () => {
    if (!jobId || !isAuthenticated) return;
    
    setIsSaving(true);
    const projectName = `Pipeline Result ${new Date().toLocaleDateString()}`;
    
    // We create a ghost project with the result data
    // The projectStore needs to be able to handle this
    // For now, we'll try to create it normally and then set the active result
    const success = await createProject(projectName);
    
    if (success) {
      setActiveResult({
        id: jobId,
        videoUrl: pipelineApi.getVideoUrl(jobId),
        psdUrl: pipelineApi.getZipUrl(jobId),
        title: projectName,
        type: 'transition',
        status: 'completed'
      });
      setSaved(true);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-white">Ixnel V3 Pipeline</h1>
          <p className="text-lg text-[#00AAFF]">Dual-Seed Adaptive Generation Flow</p>
        </div>

        {state === 'idle' || state === 'uploading' ? (
          <div className="bg-white/[0.02] rounded-3xl shadow-2xl shadow-[#00AAFF]/5 border border-white/5 p-8 space-y-8 relative overflow-hidden">
            {/* Subtle Top Glow matching Home page */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/30 to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              {/* Reference Image Uploader */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-neutral-300 uppercase tracking-wider">Reference Image</label>
                <div 
                   onClick={() => refInputRef.current?.click()}
                   className={`relative cursor-pointer group flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-300 ${referenceImage ? 'border-[#00AAFF] bg-[#00AAFF]/5' : 'border-white/10 hover:border-[#00AAFF]/50 hover:bg-[#00AAFF]/[0.02] h-64 bg-black/20'}`}
                >
                  <input type="file" ref={refInputRef} onChange={handleRefUpload} accept="image/*" className="hidden" />
                  {referenceImage ? (
                    <div className="relative w-full h-full flex flex-col items-center">
                      <img src={URL.createObjectURL(referenceImage)} alt="Reference" className="max-h-48 object-contain rounded-lg shadow-md shadow-black/50" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); setReferenceImage(null); }}
                        className="absolute -top-3 -right-3 p-1.5 bg-neutral-900 border border-white/10 shadow-lg rounded-full text-neutral-400 hover:text-red-500 hover:border-red-500/30 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-neutral-500 group-hover:text-[#00AAFF] transition-colors">
                      <ImageIcon className="w-10 h-10 mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                      <span className="font-medium text-sm text-center">Click to upload reference style image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lineart Sequence Uploader */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-neutral-300 uppercase tracking-wider">Lineart Sequence</label>
                <div 
                  onClick={() => lineartInputRef.current?.click()}
                  className={`relative cursor-pointer group flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-300 ${lineartFrames.length > 0 ? 'border-[#00AAFF] bg-[#00AAFF]/5' : 'border-white/10 hover:border-[#00AAFF]/50 hover:bg-[#00AAFF]/[0.02] h-64 bg-black/20'}`}
                >
                  <input type="file" ref={lineartInputRef} onChange={handleLineartUpload} accept="image/*" multiple className="hidden" />
                  {lineartFrames.length > 0 ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <div className="text-center p-4">
                        <ImageIcon className="w-12 h-12 mb-3 mx-auto text-[#00AAFF]" />
                        <span className="text-lg font-bold text-white">{lineartFrames.length} Frames Selected</span>
                        <p className="text-sm text-[#00AAFF] mt-1 opacity-80">Ready for colorization</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setLineartFrames([]); }}
                        className="absolute -top-3 -right-3 p-1.5 bg-neutral-900 border border-white/10 shadow-lg rounded-full text-neutral-400 hover:text-red-500 hover:border-red-500/30 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-neutral-500 group-hover:text-[#00AAFF] transition-colors">
                      <Upload className="w-10 h-10 mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                      <span className="font-medium text-sm text-center">Click to upload lineart sequence<br/>(multiple files)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-6 text-sm text-neutral-400">
                 <Settings className="w-5 h-5 text-[#00AAFF]" />
                 <label className="flex items-center gap-3">
                   <span className="uppercase text-xs font-semibold tracking-wider">Frames:</span>
                   <input type="number" value={nFrames} onChange={(e) => setNFrames(Number(e.target.value))} className="w-20 px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white focus:border-[#00AAFF] focus:ring-1 focus:ring-[#00AAFF] outline-none transition-all" />
                 </label>
                 <label className="flex items-center gap-3">
                   <span className="uppercase text-xs font-semibold tracking-wider">FPS:</span>
                   <input type="number" value={fps} onChange={(e) => setFps(Number(e.target.value))} className="w-20 px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white focus:border-[#00AAFF] focus:ring-1 focus:ring-[#00AAFF] outline-none transition-all" />
                 </label>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!referenceImage || lineartFrames.length === 0 || state === 'uploading'}
                className="flex items-center gap-2.5 px-8 py-3.5 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold text-sm tracking-wide hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[#00AAFF]/25 hover:shadow-white/10 hover:scale-[1.02] active:scale-[0.99]"
              >
                {state === 'uploading' ? 'Uploading...' : 'Generate Colorized Video'}
                <Upload className="w-4 h-4" />
              </button>
            </div>
            
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Note: Ensure JobProgress and VideoPlayer components internally support dark mode styling 
                or pass styling props if applicable. */}
            <JobProgress 
              state={state} 
              currentStep={status?.current_step} 
              progress={status?.progress} 
              framesDone={status?.frames_done}
              totalFrames={nFrames}
              error={error}
            />

            {state === 'complete' && jobId && (
              <div className="space-y-6">
                <VideoPlayer 
                  videoUrl={pipelineApi.getVideoUrl(jobId)} 
                  zipUrl={pipelineApi.getZipUrl(jobId)} 
                />
                
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button 
                    onClick={handleReset}
                    className="px-6 py-3.5 bg-transparent border border-[#00AAFF]/20 text-white font-semibold hover:bg-[#00AAFF]/10 rounded-xl transition-all shadow-sm"
                  >
                    Start New Generation
                  </button>

                  {isAuthenticated && (
                    <button 
                      onClick={handleSaveToProjects}
                      disabled={isSaving || saved}
                      className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] ${
                        saved 
                          ? 'bg-[#00AAFF]/10 text-[#00AAFF] border border-[#00AAFF]/30 cursor-default hover:scale-100' 
                          : 'bg-[#00AAFF] text-neutral-950 hover:bg-white shadow-lg shadow-[#00AAFF]/25 hover:shadow-white/10 disabled:opacity-50'
                      }`}
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      {isSaving ? 'Saving...' : saved ? 'Saved to Projects' : 'Save to Ixnel Projects'}
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {state === 'failed' && (
               <div className="flex justify-center">
                  <button 
                    onClick={handleReset}
                    className="px-8 py-3 bg-neutral-900 border border-white/10 text-white font-medium hover:bg-neutral-800 hover:border-white/20 rounded-xl transition-all shadow-sm"
                  >
                    Try Again
                  </button>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}