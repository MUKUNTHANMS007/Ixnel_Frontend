import React, { useRef, useState } from 'react';
import { Upload, FileImage, Layers, Loader2, X, Sparkles, CheckCircle } from 'lucide-react';
import { readPsd } from 'ag-psd';
import { useProjectStore } from '../../store/projectStore';
import { useAuthStore } from '../../store/authStore';

export function ReferenceUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [layers, setLayers] = useState<{name: string, visible: boolean}[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTrained, setIsTrained] = useState(false);
  const [isTraining, setIsTraining] = useState(false);

  const { activeProjectId, trainModel, trainingProgress } = useProjectStore();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setError(null);
    setLayers([]);
    setIsTrained(false);

    try {
      if (file.name.toLowerCase().endsWith('.psd') || file.name.toLowerCase().endsWith('.clip')) {
        // 1. Parse Metadata for UI
        if (file.name.toLowerCase().endsWith('.psd')) {
          const buffer = await file.arrayBuffer();
          const psd = readPsd(buffer);
          const extractedLayers = psd.children?.map(layer => ({
            name: layer.name || 'Unnamed Layer',
            visible: layer.hidden !== true,
          })) || [];
          setLayers(extractedLayers);
        }

        // 2. Upload to Backend
        const { token } = useAuthStore.getState();
        
        if (!activeProjectId) throw new Error('No active project found');

        const formData = new FormData();
        formData.append('reference', file);

        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const uploadRes = await fetch(`${apiBase}/projects/${activeProjectId}/reference`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await uploadRes.json();
        if (data.success) {
          useProjectStore.setState({ referenceSheetUrl: data.data.referenceSheetUrl });
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      } else {
        setError('Unsupported file format. Please upload .psd or .clip');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process file.');
      console.error(err);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTrain = async () => {
    setIsTraining(true);
    await trainModel();
    setIsTraining(false);
    setIsTrained(true);
  };

  const clearUpload = () => {
    setFileName(null);
    setLayers([]);
    setError(null);
    setIsTrained(false);
  };

  return (
    <div className="bg-white/70 backdrop-blur-2xl border border-neutral-200/50 rounded-xl p-4 shadow-sm w-full max-w-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-800 flex items-center gap-2">
          <FileImage className="w-4 h-4 text-indigo-600" />
          Character Reference
        </h3>
        {fileName && !isProcessing && !isTraining && (
          <button onClick={clearUpload} className="p-1 hover:bg-neutral-200 rounded-md text-neutral-500 hover:text-neutral-700 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {!fileName && (
        <div 
          onClick={handleUploadClick}
          className="border-2 border-dashed border-neutral-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group"
        >
          <Upload className="w-6 h-6 text-neutral-400 group-hover:text-indigo-500" />
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-600">Upload Reference</p>
            <p className="text-xs text-neutral-400 mt-1">.PSD and .CLIP</p>
          </div>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".psd,.clip"
            className="hidden"
          />
        </div>
      )}

      {(isProcessing || isTraining) && (
        <div className="flex flex-col gap-3 py-4">
          <div className="flex items-center justify-center text-indigo-600 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium animate-pulse">
              {isTraining ? `Personalizing AI Model (${trainingProgress}%)` : 'Processing reference...'}
            </span>
          </div>
          {isTraining && (
            <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-300 easing-out" 
                style={{ width: `${trainingProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {!isProcessing && !isTraining && fileName && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-2 bg-indigo-50/50 border border-indigo-100 rounded-lg">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileImage className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span className="text-xs font-medium text-neutral-700 truncate">{fileName}</span>
            </div>
            {isTrained && <CheckCircle className="w-4 h-4 text-emerald-500" />}
          </div>

          {!isTrained ? (
            <button
              onClick={handleTrain}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Personalize AI Model
            </button>
          ) : (
            <div className="text-[10px] text-center text-emerald-600 font-bold bg-emerald-50 py-1 rounded border border-emerald-100 uppercase tracking-wider">
              AI Optimized for {fileName.split('.')[0]}
            </div>
          )}

          {layers.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 pb-1 border-b border-neutral-100">
                <Layers className="w-3.5 h-3.5" />
                Detected Layers ({layers.length})
              </div>
              <div className="max-h-24 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                {layers.map((layer, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px] p-1.5 bg-neutral-50/80 rounded border border-neutral-100">
                    <span className="font-medium text-neutral-600 truncate mr-2">{layer.name}</span>
                    <span className={`px-1 rounded-[3px] font-bold ${layer.visible ? 'text-green-600' : 'text-neutral-400'}`}>
                      {layer.visible ? 'VISIBLE' : 'HIDDEN'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
