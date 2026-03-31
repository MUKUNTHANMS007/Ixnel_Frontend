import React, { useState } from 'react';
import { Upload, ArrowRight, Loader2, Sparkles, CheckCircle2, Download, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

import { useProjectStore } from '../store/projectStore';

interface TransitionTesterProps {
  onNavigate: (page: string) => void;
}

export function TransitionTester({ onNavigate }: TransitionTesterProps) {
  const [startImg, setStartImg] = useState<string | null>(null);
  const [endImg, setEndImg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'start' | 'end') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (side === 'start') setStartImg(url);
      else setEndImg(url);
      setResult(false);
    }
  };

  const runTest = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      // Instead of setting local result, redirect to ResultPage
      useProjectStore.getState().setActiveResult({
        videoUrl: 'http://127.0.0.1:8000/outputs/demo-generation.mp4',
        psdUrl: 'http://127.0.0.1:8000/outputs/demo-generation.psd',
        title: 'Transition Test',
        type: 'transition'
      });
      onNavigate('result');
    }, 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-20 p-8 rounded-3xl bg-white border border-neutral-200 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="w-32 h-32 text-indigo-500" />
      </div>

      <div className="text-center mb-10">
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">Temporal Transition Tester</h3>
        <p className="text-neutral-500">Upload two frames to simulate a Ixnel AI transition</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Start Frame */}
        <div className="flex flex-col gap-4">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Start Frame</label>
          <div
            className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all overflow-hidden relative group ${startImg ? 'border-indigo-500' : 'border-neutral-200 hover:border-indigo-400'}`}
          >
            {startImg ? (
              <img src={startImg} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-400">
                <Upload className="w-8 h-8" />
                <span className="text-sm font-medium">Upload PNG/JPG</span>
              </div>
            )}
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleUpload(e, 'start')}
              accept="image/*"
            />
          </div>
        </div>

        {/* Action / Arrow */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${startImg && endImg ? 'bg-indigo-600 shadow-lg shadow-indigo-200 text-white' : 'bg-neutral-100 text-neutral-300'}`}>
            {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
          </div>
          <button
            disabled={!startImg || !endImg || isProcessing}
            onClick={runTest}
            className="px-6 py-2 rounded-full bg-neutral-900 text-white text-sm font-bold disabled:opacity-30 hover:bg-neutral-800 transition-colors"
          >
            Run AI Engine
          </button>
        </div>

        {/* End Frame */}
        <div className="flex flex-col gap-4">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">End Frame</label>
          <div
            className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all overflow-hidden relative group ${endImg ? 'border-indigo-500' : 'border-neutral-200 hover:border-indigo-400'}`}
          >
            {endImg ? (
              <img src={endImg} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-400">
                <Upload className="w-8 h-8" />
                <span className="text-sm font-medium">Upload PNG/JPG</span>
              </div>
            )}
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleUpload(e, 'end')}
              accept="image/*"
            />
          </div>
        </div>
      </div>

      {/* Result Overlay */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-3 text-emerald-700 font-bold">
            <CheckCircle2 className="w-6 h-6" />
            AI Interpolation Successful
          </div>
          <p className="text-sm text-emerald-600 text-center max-w-md">
            The transitions between your frames have been processed by the Ixnel Engine. You can now download the results below.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <a
              href="https://example.com/mock-anidoc-result.mp4"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all"
            >
              <Download className="w-4 h-4" />
              Download MP4
            </a>
            <a
              href="http://127.0.0.1:8000/outputs/demo-generation.psd"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-2 bg-white text-neutral-700 border border-neutral-200 rounded-xl text-sm font-bold hover:bg-neutral-50 transition-all"
            >
              <Layers className="w-4 h-4 text-indigo-500" />
              Download Layered PSD
            </a>
          </div>
          <button onClick={() => setResult(false)} className="text-xs font-bold text-neutral-400 uppercase tracking-widest hover:text-neutral-600 mt-2">Dismiss</button>
        </motion.div>
      )}
    </div>
  );
}
