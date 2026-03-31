import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from 'zustand';
import { Leva, useControls } from 'leva';
import { EditorCanvas } from '../components/editor/EditorCanvas';
import { KeyboardShortcuts } from '../components/editor/KeyboardShortcuts';
import { useEditorStore, type KeyframeData } from '../store/editorStore';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import { ReferenceUpload } from '../components/editor/ReferenceUpload';
import { Timeline } from '../components/editor/Timeline';
import {
  Layers, Move, Rotate3D, Scaling, Download, Box, Circle,
  Cylinder, ArrowUpRight, Eraser, Save, CheckCircle, Loader2, FolderOpen,
  Undo2, Redo2, Trash2, Home, Sparkles, Cone, Disc, Square, Copy, RefreshCw,
  Torus, ChevronDown, Wand2, Grid3X3, Palette, User, Car, Sun, Settings2, X
} from 'lucide-react';

interface EditorProps {
  onNavigate: (page: string) => void;
}

export default function Editor({ onNavigate }: EditorProps) {
  const transformMode = useEditorStore((state) => state.transformMode);
  const setTransformMode = useEditorStore((state) => state.setTransformMode);
  const keyframes = useEditorStore((state) => state.keyframes);
  const selectedId = useEditorStore((state) => state.selectedId);
  const addKeyframe = useEditorStore((state) => state.addKeyframe);
  const removeKeyframe = useEditorStore((state) => state.removeKeyframe);
  const duplicateKeyframe = useEditorStore((state) => state.duplicateKeyframe);
  const updateKeyframe = useEditorStore((state) => state.updateKeyframe);
  const clearKeyframes = useEditorStore((state) => state.clearKeyframes);
  const randomizeScene = useEditorStore((state) => state.randomizeScene);
  const showGrid = useEditorStore((state) => state.showGrid);
  const setShowGrid = useEditorStore((state) => state.setShowGrid);

  const [showShapesDropdown, setShowShapesDropdown] = React.useState(false);

  const { 
    saveProject, scheduleAutoSave, isSaving, lastSaved, activeProjectName, 
    setProjectName, sequence, setSequence, generateAnimation, 
    isGenerating, generationStatus, resultUrl, psdUrl 
  } = useProjectStore();
  const { isAuthenticated } = useAuthStore();

  const { undo, redo, pastStates, futureStates } = useStore(useEditorStore.temporal, (state: any) => state);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Schedule auto-save whenever keyframes change
  useEffect(() => {
    if (isAuthenticated) {
      scheduleAutoSave();
    }
  }, [keyframes, isAuthenticated, scheduleAutoSave]);

  // Handle generation completion -> redirect to results
  useEffect(() => {
    if (resultUrl && !isGenerating) {
      useProjectStore.getState().setActiveResult({
        videoUrl: resultUrl,
        psdUrl: psdUrl,
        title: activeProjectName,
        type: 'generation'
      });
      onNavigate('result');
      // Clear store result to avoid re-triggering redirect if user comes back
      useProjectStore.setState({ resultUrl: null, psdUrl: null, generationStatus: '' });
    }
  }, [resultUrl, isGenerating, psdUrl, activeProjectName, onNavigate]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    addKeyframe({
      id: `model-${Date.now()}`,
      type: 'model',
      url,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    });

    e.target.value = '';
  };

  // Leva controls
  useControls('AI Properties', {
    temporalSmoothness: { value: 0.8, min: 0, max: 1, step: 0.01 },
    frameDensity: { value: 24, min: 12, max: 60, step: 1 },
    promptStrength: { value: 7.5, min: 1, max: 20, step: 0.1 },
    interpolation: { options: ['linear', 'bezier', 'step'] }
  });

  const sunControls = useControls('Sun Settings', {
    sunPosition: { value: [5, 10, 5], step: 1 },
    sunIntensity: { value: 1.5, min: 0, max: 10, step: 0.1 },
    sunColor: { value: '#ffffff' },
  });

  const handleSpawnShape = (shapeType: KeyframeData['type']) => {
    if (!shapeType) return;
    addKeyframe({
      id: `${shapeType}-${Date.now()}`,
      type: shapeType,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#a5b4fc' // Default light indigo
    });
    setShowShapesDropdown(false);
  };

  const handleDuplicate = () => {
    if (selectedId) {
      duplicateKeyframe(selectedId);
    }
  };

  const handleResetTransform = () => {
    if (selectedId) {
      updateKeyframe(selectedId, {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      });
    }
  };

  const handleColorChange = (color: string) => {
    if (selectedId) {
      updateKeyframe(selectedId, { color });
    }
  };

  const colors = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Rose', value: '#fb7185' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Amber', value: '#fbbf24' },
    { name: 'Sky', value: '#38bdf8' },
    { name: 'Slate', value: '#475569' },
    { name: 'Violet', value: '#8b5cf6' },
  ];

  const handleExport = () => {
    window.dispatchEvent(new Event('export-scene'));
  };

  const [timeNow, setTimeNow] = React.useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setTimeNow(Date.now()), 15000);
    return () => clearInterval(interval);
  }, []);

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    const diff = Math.round((timeNow - lastSaved.getTime()) / 1000);
    if (diff < 60) return 'Saved just now';
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
    return `Saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const [isEarlyAccessRequested, setIsEarlyAccessRequested] = React.useState(false);

  const handleEarlyAccess = () => {
    setIsEarlyAccessRequested(true);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-neutral-50 text-neutral-900 overflow-hidden text-sm select-none font-sans flex flex-col pt-16 z-50">
      
      {/* Coming Soon Tip (Non-blocking) */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-[60]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Trial Mode: Exploring Ixnel Editor Preview
          </motion.div>
        </div>

      {/* Error Toast */}
      {useProjectStore.getState().error && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-[100]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 text-red-600 border border-red-100 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">Action Failed</span>
              <span className="text-xs opacity-80">{useProjectStore.getState().error}</span>
            </div>
            <button 
              onClick={() => useProjectStore.setState({ error: null })}
              className="ml-4 hover:bg-red-100 p-1 rounded-md transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        </div>
      )}
      
      {/* Top Header Panel */}
      <div className="absolute top-16 left-0 right-0 h-14 bg-white/70 backdrop-blur-xl border-b border-neutral-200/50 flex items-center justify-between px-6 z-[60] shadow-sm">
        <div className="flex items-center gap-4">
          
          {/* Import Button */}
          <div className="flex items-center">
            <input 
              type="file" 
              accept=".glb,.gltf" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange} 
            />
            <button 
              onClick={handleImportClick}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-colors font-medium text-neutral-700"
            >
              <Download className="w-4 h-4" />
              Import Model
            </button>
          </div>

          <div className="h-6 w-px bg-neutral-200" />

          {/* Shapes Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowShapesDropdown(!showShapesDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-colors font-medium text-neutral-700"
            >
              <Box className="w-4 h-4" />
              Add Shape
              <ChevronDown className={`w-3 h-3 transition-transform ${showShapesDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showShapesDropdown && (
              <div className="absolute top-full left-0 mt-2 p-2 bg-white border border-neutral-200 rounded-xl shadow-xl z-[70] grid grid-cols-4 gap-1 min-w-[180px]">
                <button onClick={() => handleSpawnShape('cube')} className="p-2 rounded-lg hover:bg-neutral-50 text-neutral-600 hover:text-indigo-600 transition-colors" title="Cube"><Box className="w-5 h-5" /></button>
                <button onClick={() => handleSpawnShape('sphere')} className="p-2 rounded-lg hover:bg-neutral-50 text-neutral-600 hover:text-indigo-600 transition-colors" title="Sphere"><Circle className="w-5 h-5" /></button>
                <button onClick={() => handleSpawnShape('cylinder')} className="p-2 rounded-lg hover:bg-neutral-50 text-neutral-600 hover:text-indigo-600 transition-colors" title="Cylinder"><Cylinder className="w-5 h-5" /></button>
                <button onClick={() => handleSpawnShape('cone')} className="p-2 rounded-lg hover:bg-neutral-50 text-neutral-600 hover:text-indigo-600 transition-colors" title="Cone"><Cone className="w-5 h-5" /></button>
                <button onClick={() => handleSpawnShape('torus')} className="p-2 rounded-lg hover:bg-neutral-50 text-neutral-600 hover:text-indigo-600 transition-colors" title="Torus"><Torus className="w-5 h-5" /></button>
                <button onClick={() => handleSpawnShape('plane')} className="p-2 rounded-lg hover:bg-neutral-50 text-neutral-600 hover:text-indigo-600 transition-colors" title="Plane"><Square className="w-5 h-5" /></button>
                <button onClick={() => handleSpawnShape('icosahedron')} className="p-2 rounded-lg hover:bg-neutral-50 text-neutral-600 hover:text-indigo-600 transition-colors" title="Icosahedron"><Disc className="w-5 h-5" /></button>
                <button onClick={() => handleSpawnShape('capsule')} className="p-2 rounded-lg hover:bg-neutral-50 text-neutral-600 hover:text-indigo-600 transition-colors" title="Capsule"><Cylinder className="w-5 h-5 rotate-90" /></button>
                <div className="col-span-4 h-px bg-neutral-100 my-1" />
                <button onClick={() => handleSpawnShape('human')} className="p-2 rounded-lg hover:bg-neutral-50 text-neutral-600 hover:text-indigo-600 transition-colors" title="Human"><User className="w-5 h-5" /></button>
                <button onClick={() => handleSpawnShape('car')} className="p-2 rounded-lg hover:bg-neutral-50 text-neutral-600 hover:text-indigo-600 transition-colors" title="Car"><Car className="w-5 h-5" /></button>
                <button onClick={() => handleSpawnShape('sun')} className="p-2 rounded-lg hover:bg-neutral-50 text-neutral-600 hover:text-indigo-600 transition-colors" title="Sun"><Sun className="w-5 h-5" /></button>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-neutral-200" />

          {/* Color Palette */}
          <div className="flex gap-1 bg-white p-1 rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-2 self-center border-r border-neutral-100 mr-1 hidden lg:block">
              <Palette className="w-3.5 h-3.5 text-neutral-400" />
            </div>
            {colors.map((c) => (
              <button
                key={c.value}
                onClick={() => handleColorChange(c.value)}
                disabled={!selectedId}
                className={`w-6 h-6 rounded-md hover:scale-110 transition-transform disabled:opacity-20 disabled:grayscale`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>

          <div className="h-6 w-px bg-neutral-200" />

          {/* Gizmo Tools */}
          <div className="flex gap-1 bg-neutral-100/80 p-1 rounded-lg border border-neutral-200/50">
            <button onClick={() => setTransformMode('translate')} className={`p-2 rounded-md transition-all ${transformMode === 'translate' ? 'bg-white shadow-sm text-indigo-600 border border-neutral-200/50' : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/5 border border-transparent'}`} title="Move (G)">
              <Move className="w-4 h-4" />
            </button>
            <button onClick={() => setTransformMode('rotate')} className={`p-2 rounded-md transition-all ${transformMode === 'rotate' ? 'bg-white shadow-sm text-indigo-600 border border-neutral-200/50' : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/5 border border-transparent'}`} title="Rotate (R)">
              <Rotate3D className="w-4 h-4" />
            </button>
            <button onClick={() => setTransformMode('scale')} className={`p-2 rounded-md transition-all ${transformMode === 'scale' ? 'bg-white shadow-sm text-indigo-600 border border-neutral-200/50' : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/5 border border-transparent'}`} title="Scale (S)">
              <Scaling className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-neutral-200/50 mx-1 self-center" />
            <button onClick={() => setTransformMode('sculpt')} className={`p-2 rounded-md transition-all ${transformMode === 'sculpt' ? 'bg-white shadow-sm text-indigo-600 border border-neutral-200/50' : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/5 border border-transparent'}`} title="Sculpt / Bulge">
              <Eraser className="w-4 h-4" />
            </button>
            <button onClick={() => setTransformMode('subTransform')} className={`p-2 rounded-md transition-all ${transformMode === 'subTransform' ? 'bg-white shadow-sm text-indigo-600 border border-neutral-200/50' : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/5 border border-transparent'}`} title="Sub-Object Edit">
              <Settings2 className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-neutral-200" />
          
          {/* History & Actions */}
          <div className="flex gap-1 bg-white p-1 rounded-lg border border-neutral-200 shadow-sm">
            <button 
              onClick={() => undo()} 
              disabled={pastStates.length === 0}
              className="px-2 py-1.5 rounded-md text-neutral-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center gap-1 font-medium" 
              title="Undo (Ctrl+Z)">
              <Undo2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => redo()} 
              disabled={futureStates.length === 0}
              className="px-2 py-1.5 rounded-md text-neutral-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center gap-1 font-medium" 
              title="Redo (Ctrl+Y)">
              <Redo2 className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-neutral-200/50 mx-1 self-center" />
            <button 
              onClick={handleDuplicate} 
              disabled={!selectedId}
              className="px-2 py-1.5 rounded-md text-neutral-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center gap-1 font-medium" 
              title="Duplicate (Ctrl+D)">
              <Copy className="w-4 h-4" />
            </button>
            <button 
              onClick={handleResetTransform} 
              disabled={!selectedId}
              className="px-2 py-1.5 rounded-md text-neutral-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center gap-1 font-medium" 
              title="Reset Transform">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                if (selectedId) {
                  removeKeyframe(selectedId);
                  setSequence(sequence.filter(id => id !== selectedId));
                }
              }} 
              disabled={!selectedId}
              className="px-2 py-1.5 rounded-md text-neutral-600 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-1 font-medium" 
              title="Delete (Del)">
              <Trash2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => window.dispatchEvent(new Event('reset-camera'))} 
              className="px-2 py-1.5 rounded-md text-neutral-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1 font-medium" 
              title="Reset Camera">
              <Home className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-neutral-200" />
          
          {/* Export & Generate Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-neutral-700 border border-neutral-200 rounded-lg shadow-sm hover:bg-neutral-50 transition-colors font-medium"
            >
              <ArrowUpRight className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={() => generateAnimation()}
              disabled={isGenerating || !isAuthenticated}
              title="Powered by ToonCrafter — AI Video Interpolation (16 frames)"
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white border border-indigo-700 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              Generate
            </button>
          </div>

          {/* Tester Tools */}
          <div className="flex gap-1 bg-white p-1 rounded-lg border border-neutral-200 shadow-sm mr-2">
            <button 
              onClick={() => randomizeScene()} 
              className="p-2 rounded-md text-neutral-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" 
              title="Randomize Scene (Tester Tool)">
              <Wand2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowGrid(!showGrid)} 
              className={`p-2 rounded-md transition-all ${showGrid ? 'text-indigo-600 bg-indigo-50' : 'text-neutral-500 hover:bg-neutral-50'}`} 
              title="Toggle Grid">
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                if(confirm('Clear entire scene?')) clearKeyframes();
              }} 
              className="p-2 rounded-md text-neutral-600 hover:text-red-600 hover:bg-red-50 transition-colors" 
              title="Clear Scene">
              <Eraser className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-neutral-200" />
        </div>

        {/* Right side: Project Name + Save */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Editable project name */}
              <input
                type="text"
                value={activeProjectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="px-3 py-1.5 text-sm font-medium bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-40 text-neutral-700"
              />

              {/* Last saved indicator */}
              {lastSaved && !isSaving && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {formatLastSaved()}
                </span>
              )}

              {/* Save Now button */}
              <button
                onClick={() => saveProject()}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-60 text-xs"
              >
                {isSaving ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-3.5 h-3.5" /> Save Now</>
                )}
              </button>
            </>
          ) : (
            <span className="flex items-center gap-2 text-xs text-neutral-400 px-3 py-1.5 bg-neutral-50 rounded-lg border border-neutral-200">
              <FolderOpen className="w-3.5 h-3.5" />
              Sign in to save projects
            </span>
          )}
        </div>
      </div>

      {/* Generation Status Overlay */}
      {(isGenerating || (generationStatus && resultUrl)) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl border border-indigo-100 flex flex-col items-center gap-4 text-center max-w-sm">
            <div className="relative">
              {isGenerating ? (
                <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                  <CheckCircle className="w-6 h-6" />
                </div>
              )}
              <Sparkles className="w-5 h-5 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 mb-1">Ixnel Engine</h3>
              <p className="text-sm text-neutral-600">{generationStatus || 'Processing...'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 relative w-full h-full mt-12">
        {/* Left Panels */}
        <div className="absolute top-4 left-4 flex flex-col gap-4 z-10 w-64">
          {/* Outliner */}
          <div className="bg-white/70 backdrop-blur-2xl border border-neutral-200/50 rounded-xl p-4 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-2 text-neutral-700 font-medium pb-2 border-b border-neutral-200/50">
              <Layers className="w-4 h-4" />
              Outliner
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar flex flex-col gap-1">
              {keyframes.map((kf, i) => (
                <div 
                  key={kf.id}
                  onClick={() => useEditorStore.getState().setSelectedId(kf.id)}
                  className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${selectedId === kf.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'hover:bg-neutral-100 text-neutral-600 border border-transparent'}`}
                >
                  {kf.type === 'model' ? 'Imported Model' : kf.type ? kf.type.charAt(0).toUpperCase() + kf.type.slice(1) : `Keyframe ${i + 1}`}
                </div>
              ))}
            </div>
          </div>
          
          <ReferenceUpload />
        </div>

        {/* 3D Canvas */}
        <div className="w-full h-full pb-36">
          <EditorCanvas 
            sunPosition={sunControls.sunPosition}
            sunIntensity={sunControls.sunIntensity}
            sunColor={sunControls.sunColor}
          />
        </div>
        
        <Timeline />

        {/* Right Panel - Leva */}
        <div className="absolute top-4 right-4 z-10 custom-leva-wrapper">
          <Leva 
            theme={{
              colors: {
                elevation1: 'rgba(255,255,255,0.7)',
                elevation2: 'rgba(0,0,0,0.05)',
                elevation3: 'rgba(0,0,0,0.1)',
                accent1: '#6366f1',
                accent2: '#4f46e5',
                accent3: '#818cf8',
                highlight1: '#171717',
                highlight2: '#525252',
                highlight3: '#737373',
                vivid1: '#ffcc00',
              },
              space: { sm: '6px', md: '10px', rowGap: '6px', colGap: '6px' },
              borderWidths: { folder: '1px', root: '1px' },
              radii: { xs: '4px', sm: '6px', lg: '12px' }
            }}
            hideCopyButton
            titleBar={{ title: 'Properties' }}
          />
        </div>
      </div>

      <KeyboardShortcuts />
    </div>
  );
}
