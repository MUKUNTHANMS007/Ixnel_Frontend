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
  
  const [startFrame, setStartFrame] = useState<File | null>(null);
  const [endFrame, setEndFrame] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Optional settings
  const [fps, setFps] = useState<number>(24);
  const [nFrames, setNFrames] = useState<number>(200);

  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  const handleStartUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setStartFrame(e.target.files[0]);
    }
  };

  const handleEndUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEndFrame(e.target.files[0]);
    }
  };

  const handleGenerate = () => {
    if (startFrame && endFrame) {
      setSaved(false);
      startJob(startFrame, endFrame, { fps, n_frames: nFrames });
    }
  };

  const handleReset = () => {
    setStartFrame(null);
    setEndFrame(null);
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
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">Ixnel V3 Pipeline</h1>
          <p className="text-lg text-neutral-600">Dual-Seed Adaptive Generation Flow</p>
        </div>

        {state === 'idle' || state === 'uploading' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Start Frame Uploader */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-neutral-700">Start Frame</label>
                <div 
                  onClick={() => startInputRef.current?.click()}
                  className={`relative cursor-pointer group flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors ${startFrame ? 'border-indigo-500 bg-indigo-50' : 'border-neutral-300 hover:border-indigo-400 hover:bg-neutral-50 h-64'}`}
                >
                  <input type="file" ref={startInputRef} onChange={handleStartUpload} accept="image/*" className="hidden" />
                  {startFrame ? (
                    <div className="relative w-full h-full flex flex-col items-center">
                      <img src={URL.createObjectURL(startFrame)} alt="Start Frame" className="max-h-48 object-contain rounded-lg shadow-sm" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); setStartFrame(null); }}
                        className="absolute -top-3 -right-3 p-1 bg-white shadow-md rounded-full text-neutral-500 hover:text-red-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-neutral-500 group-hover:text-indigo-500">
                      <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
                      <span className="font-medium">Click to upload first image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* End Frame Uploader */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-neutral-700">End Frame</label>
                <div 
                  onClick={() => endInputRef.current?.click()}
                  className={`relative cursor-pointer group flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors ${endFrame ? 'border-indigo-500 bg-indigo-50' : 'border-neutral-300 hover:border-indigo-400 hover:bg-neutral-50 h-64'}`}
                >
                  <input type="file" ref={endInputRef} onChange={handleEndUpload} accept="image/*" className="hidden" />
                  {endFrame ? (
                    <div className="relative w-full h-full flex flex-col items-center">
                      <img src={URL.createObjectURL(endFrame)} alt="End Frame" className="max-h-48 object-contain rounded-lg shadow-sm" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEndFrame(null); }}
                        className="absolute -top-3 -right-3 p-1 bg-white shadow-md rounded-full text-neutral-500 hover:text-red-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-neutral-500 group-hover:text-indigo-500">
                      <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
                      <span className="font-medium">Click to upload target image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                 <Settings className="w-5 h-5 text-neutral-400" />
                 <label className="flex items-center gap-2">
                   Frames:
                   <input type="number" value={nFrames} onChange={(e) => setNFrames(Number(e.target.value))} className="w-20 px-2 py-1 border rounded" />
                 </label>
                 <label className="flex items-center gap-2">
                   FPS:
                   <input type="number" value={fps} onChange={(e) => setFps(Number(e.target.value))} className="w-16 px-2 py-1 border rounded" />
                 </label>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!startFrame || !endFrame || state === 'uploading'}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {state === 'uploading' ? 'Uploading...' : 'Generate Video'}
                <Upload className="w-5 h-5" />
              </button>
            </div>
            
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
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
                    className="px-6 py-3 bg-white border border-neutral-200 text-neutral-600 font-semibold hover:bg-neutral-50 rounded-xl transition-all shadow-sm"
                  >
                    Start New Generation
                  </button>

                  {isAuthenticated && (
                    <button 
                      onClick={handleSaveToProjects}
                      disabled={isSaving || saved}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-md transition-all active:scale-95 ${
                        saved 
                          ? 'bg-green-50 text-green-600 border border-green-200' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'
                      }`}
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
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
                    className="px-6 py-2 bg-neutral-900 text-white font-medium hover:bg-neutral-800 rounded-lg transition-colors shadow-sm"
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
