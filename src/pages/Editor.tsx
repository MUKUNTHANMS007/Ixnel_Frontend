// src/pages/Editor.tsx

import React, { useRef, useEffect, useState } from 'react';
import { 
  Plus, 
  Sparkles, 
  ChevronLeft, 
  ArrowRight,
  FileImage,
  Layers,
  Wand2,
  Settings2,
  Trash2,
  CheckCircle,
  Palette,
  X
} from 'lucide-react';

import { projectAPI } from '../lib/project_api';
import type { Project, ProjectAsset } from '../lib/project_api.ts';
import type { User, UserProfile } from '../lib/api';

interface EditorProps {
  onNavigate: (page: string) => void;
  isAuthenticated: boolean;
  user: User | null;
  profile: UserProfile | null;
  onAuthSuccess: () => void;
}

interface LocalAsset {
  id: string;
  name: string;
  url: string;
  file: File;
}

// ─────────────────────────────────────────────────────────────────────────────
// INDEXEDDB LOCAL PERSISTENCE HELPERS (Bypasses session reset losses) [1.1.2, 1.2.4]
// ─────────────────────────────────────────────────────────────────────────────
const DB_NAME = 'IxnelLocalWorkspace';
const STORE_NAME = 'project_assets';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = (e: any) => resolve(e.target.result);
    request.onerror = (e: any) => reject(e.target.error);
  });
}

async function saveLocalFileToDB(id: string, projectId: string, file: File, type: 'reference' | 'line_art'): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id, projectId, file, type });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getLocalFilesFromDB(projectId: string, type: 'reference' | 'line_art'): Promise<LocalAsset[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const allRecords = request.result;
      const filtered = allRecords.filter(r => r.projectId === projectId && r.type === type);
      const mapped = filtered.map(r => ({
        id: r.id,
        name: r.file.name,
        url: URL.createObjectURL(r.file), // Regenerates active Object URL [1.1.2]
        file: r.file
      }));
      resolve(mapped);
    };
    request.onerror = () => reject(request.error);
  });
}

async function deleteLocalFileFromDB(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Editor({ onNavigate, isAuthenticated, user, profile, onAuthSuccess }: EditorProps) {
  // ─ Workspace Load State ──────────────────────────────────────────────────
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─ 2D Asset Shelf State (Local vs. Cloud representation) ──────────────────
  const [cloudAssets, setCloudAssets] = useState<ProjectAsset[]>([]);
  const [localReferences, setLocalReferences] = useState<LocalAsset[]>([]);
  const [localLinearts, setLocalLinearts] = useState<LocalAsset[]>([]);

  // ─ Selected Canvas & Onboarding Parameters ────────────────────────────────
  const [activeFrameIdx, setActiveFrameIdx] = useState<number>(0);
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(null);

  // ─ Sequence Player States (2D Animation Preview) [1.2.4] ──────────────────
  const [isPlaying, setIsPlaying] = useState(false);

  // ─ Drag-to-Select Marquee State (File Explorer Replication) [1.2.4] ───────
  const [isDragSelecting, setIsDragSelecting] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragBox, setDragBox] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [selectedFrameIdsForDeletion, setSelectedFrameIdsForDeletion] = useState<string[]>([]);

  // ─ AI Studio Configurations ──────────────────────────────────────────────
  const [activeTool, setActiveTool] = useState<'colorization' | 'lineart'>('colorization');
  const [frameDensity, setFrameDensity] = useState(24);
  const [promptStrength, setPromptStrength] = useState(7.5);

  // ─ Overlay States ────────────────────────────────────────────────────────
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSuccessModalShown, setIsSuccessModalShown] = useState(false);

  // Add state to track real-time AI processing phase
  const [aiJobStatus, setAiJobStatus] = useState<
    'queued' | 'initiated' | 'processing' | 'completed' | 'failed' | null
  >(null);

  // Track if a finished job is available for download on startup
  const [lastCompletedBatch, setLastCompletedBatch] = useState<any[]>([]);

  // File Input References & Container Refs
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const lineartInputRef = useRef<HTMLInputElement>(null);
  const lineartGridContainerRef = useRef<HTMLDivElement>(null); // For drag box boundaries [1.2.4]
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Total frames currently loaded [1.2.4]
  const totalFrames = activeProject?.storage_mode === 'local'
    ? localLinearts.length
    : cloudAssets.filter(a => a.asset_type === 'line_art').length;

  // ─ Load Project Timeline Assets ──────────────────────────────────────────
  const loadWorkspaceDetails = async () => {
    const projectId = localStorage.getItem('activeProjectId');
    if (!projectId) {
      onNavigate('projects');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await projectAPI.getProjectById(projectId);
      setIsLoading(false);

      if (response.success && response.data) {
        const { project } = response.data;
        setActiveProject(project);

        if (project.storage_mode === 'local') {
          // Restore local session assets directly from browser's IndexedDB [1.1.2, 1.2.4]
          const refs = await getLocalFilesFromDB(project.id, 'reference');
          const lines = await getLocalFilesFromDB(project.id, 'line_art');
          setLocalReferences(refs);
          setLocalLinearts(lines);

          if (refs.length > 0) setSelectedReferenceId(refs[0].id);

          // ⚠️ WORKSPACE RECOVERY: Check for running background jobs on startup [1.2.4]
          try {
            const jobsResponse = await projectAPI.getMyJobs();
            if (jobsResponse.success && jobsResponse.data && jobsResponse.data.jobs) {
              const jobsList = jobsResponse.data.jobs;
              
              // 1. Search for any actively processing job first
              const activeJob = jobsList.find(
                (job) => ['queued', 'initiated', 'processing'].includes(job.status)
              );

              if (activeJob) {
                console.log(`[Editor] Recovery found active job running: ${activeJob.id}. Resuming tracker.`);
                setIsProcessingAI(true);
                setAiJobStatus(activeJob.status as any);
                
                // If the job belongs to a batch, collect all other batch siblings
                const batchJobIds = activeJob.batchJobIds || [activeJob.id];
                startStatusPolling(batchJobIds); // Re-establish background polling loop!
              } else {
                // 2. If no active job, check if the most recent job completed successfully
                const latestJob = jobsList[0]; // most recent sorted by created_at DESC
                if (latestJob && latestJob.status === 'completed' && latestJob.output_path) {
                  
                  // Group all completed sibling segments created in the same batch cycle (within 10 seconds of each other)
                  const siblingJobs = jobsList.filter(
                    (job) => 
                      job.status === 'completed' && 
                      job.output_path &&
                      Math.abs(new Date(job.created_at).getTime() - new Date(latestJob.created_at).getTime()) < 10000
                  );
                  
                  setLastCompletedBatch(siblingJobs); // Save complete batch for download cards
                }
              }
            }
          } catch (recoveryErr) {
            console.warn('[Editor] Recovery job check skipped/failed:', recoveryErr);
          }

        } else if (project.assets) {
          setCloudAssets(project.assets);
        }
      } else {
        setError(response.error || 'Failed to load project workspace.');
      }
    } catch (err) {
      setIsLoading(false);
      console.error('[Editor] Error loading workspace:', err);
      setError('A connection error occurred while loading your project.');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('signin');
      return;
    }
    loadWorkspaceDetails();
  }, [isAuthenticated]);

  // ─ SEQUENCE PLAYER RUNNER (Loops based on active FPS) [1.2.4] ────────────
  useEffect(() => {
    let intervalId: any;
    
    if (isPlaying && totalFrames > 0) {
      const frameDelay = 1000 / frameDensity; // ms per frame based on slider [1.2.4]
      
      intervalId = setInterval(() => {
        setActiveFrameIdx((prevIdx) => (prevIdx + 1) % totalFrames); // Loops back to Frame #1 [1.2.4]
      }, frameDelay);
    } else {
      setIsPlaying(false);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, frameDensity, totalFrames]);

  // Inside Editor.tsx lifecycle section:
  useEffect(() => {
    return () => {
      // Clean up and kill any active polling timers when unmounting the Editor page
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Helper to trigger the download of completed zip packages manually [1.2.4]
  const triggerZipDownload = (outputPath: string, suffix: string = '') => {
    const apiBaseUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';

    const link = document.createElement('a');
    link.href = `${apiBaseUrl}${outputPath}`;
    
    // Append segment identifier if downloading a batch
    const fileName = suffix 
      ? `${activeProject?.name || 'project'}_colorized_segment_${suffix}.zip`
      : `${activeProject?.name || 'project'}_colorized.zip`;

    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Staggers multiple downloads with an 800ms offset to bypass browser popup blockers [1.2.4]
  const triggerBatchDownload = () => {
    lastCompletedBatch.forEach((job, index) => {
      if (job.output_path) {
        setTimeout(() => {
          triggerZipDownload(job.output_path, `${index + 1}`);
        }, index * 800);
      }
    });
  };

  // 3. Status Polling Loop Helper (Shared by Submission & Recovery mounts) [1.2.4]
  const startStatusPolling = (jobIds: string[]) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        // Poll status of all batch jobs in parallel
        const responses = await Promise.all(jobIds.map(id => projectAPI.getJobStatus(id)));
        
        const statusList = responses.map(res => (res.data?.status as 'queued' | 'processing' | 'completed' | 'failed' | 'blocked' | 'cancelled' | 'initiated') || 'queued');
        const errorsList = responses.map(res => res.data?.error_message).filter(Boolean);
        const outputsList = responses
          .map(res => res.data?.output_path)
          .filter((path): path is string => path != null);

        // Map collective AI status
        if (statusList.some(s => s === 'processing')) {
          setAiJobStatus('processing');
        } else if (statusList.some(s => s === 'initiated')) {
          setAiJobStatus('initiated');
        } else {
          setAiJobStatus('queued');
        }

        // Check if ALL jobs are completed
        const allCompleted = statusList.every(s => s === 'completed');
        const anyFailed = statusList.some(s => s === 'failed');

        if (allCompleted) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsProcessingAI(false);
          setAiJobStatus(null);
          setIsSuccessModalShown(true);
          onAuthSuccess(); // Refresh credits indicators

          // Trigger download of ALL successfully compiled archives in the batch
          outputsList.forEach((output_path) => {
            triggerZipDownload(output_path);
          });

        } else if (anyFailed) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsProcessingAI(false);
          setAiJobStatus(null);
          setError(errorsList[0] || 'One or more split rendering segments failed.');
          onAuthSuccess(); 
        }
      } catch (pollError) {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setIsProcessingAI(false);
        setAiJobStatus(null);
        setError('Connection lost while monitoring batch status.');
      }
    }, 7000); // Polling interval set to 7 seconds to avoid rate limiting
  };

  // ⚠️ Prevent accidental tab closure, page reloads, or navigation during active AI execution [1.2.4]
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProcessingAI) {
        const msg = 'AI colorization is actively running in the background. Leaving now will interrupt your automatic download.';
        e.preventDefault();
        e.returnValue = msg;
        return msg;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isProcessingAI]);

  const handleResetPlayer = () => {
    setIsPlaying(false);
    setActiveFrameIdx(0); // Safely sets playhead back to Frame #1 [1.2.4]
  };

  // ─ File Upload Handler (Supports both Local RAM and S3 Cloud Tiers) ────────
  const handleUploadClick = (type: 'reference' | 'line_art') => {
    if (type === 'reference') referenceInputRef.current?.click();
    else lineartInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'reference' | 'line_art') => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeProject) return;

    if (activeProject.storage_mode === 'local') {
      // A. Local Privacy Mode: Save to IndexedDB and memory [1.1.2, 1.2.4]
      const newAssets: LocalAsset[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Safety constraint: Validate file size (Max 15MB)
        if (file.size > 15 * 1024 * 1024) {
          setError('File size exceeds the maximum limit of 15MB.');
          continue;
        }

        const id = `local-${type}-${Date.now()}-${i}`;
        
        // Write file buffer directly to browser storage [1.1.2, 1.2.4]
        await saveLocalFileToDB(id, activeProject.id, file, type);

        newAssets.push({
          id,
          name: file.name,
          url: URL.createObjectURL(file),
          file,
        });
      }

      if (type === 'reference') {
        setLocalReferences((prev) => [...prev, ...newAssets]);
        if (newAssets.length > 0) setSelectedReferenceId(newAssets[0].id);
      } else {
        setLocalLinearts((prev) => [...prev, ...newAssets]);
      }
    } else {
      // B. Cloud Sync Mode: Process upload queue directly to R2 [1.2.4]
      setIsLoading(true);
      setError(null);

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          const presignResponse = await projectAPI.getPresignedUrl(
            activeProject.id,
            file.name,
            file.type,
            file.size
          );

          if (presignResponse.success && presignResponse.data) {
            const { uploadUrl } = presignResponse.data;

            const uploadResult = await fetch(uploadUrl, {
              method: 'PUT',
              headers: { 'Content-Type': file.type },
              body: file,
            });

            if (!uploadResult.ok) {
              throw new Error('S3 direct upload failed.');
            }
          } else {
            throw new Error(presignResponse.error || 'Failed to allocate cloud storage.');
          }
        }

        // Force reload details to grab updated cloud assets [1.2.4]
        await loadWorkspaceDetails();
      } catch (err) {
        console.error('[Editor] Cloud upload failed:', err);
        setError('Failed to upload files to Cloud Storage.');
      } finally {
        setIsLoading(false);
      }
    }

    // Reset input
    e.target.value = '';
  };

  // ─ Delete Asset Handlers ──────────────────────────────────────────────────
  const handleDeleteAsset = async (id: string, type: 'reference' | 'line_art') => {
    if (activeProject?.storage_mode === 'local') {
      // Purge binary buffer from browser's database [1.1.2]
      await deleteLocalFileFromDB(id);

      if (type === 'reference') {
        setLocalReferences((prev) => prev.filter(a => a.id !== id));
        if (selectedReferenceId === id) setSelectedReferenceId(null);
      } else {
        setLocalLinearts((prev) => prev.filter(a => a.id !== id));
        if (activeFrameIdx >= localLinearts.length - 1) setActiveFrameIdx(0);
      }
    }
  };

  // ─ MARQUEE SELECTION MOUSE EVENT LISTENERS (File Explorer Replication) [1.2.4] ───
  const handleGridMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !lineartGridContainerRef.current) return; // Only trigger on left-click
    
    // If clicking a check circle, let standard click handlers handle it
    if ((e.target as HTMLElement).closest('.checkbox-element')) return;

    const rect = lineartGridContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragSelecting(true);
    setDragStart({ x, y });
    setDragBox({ top: y, left: x, width: 0, height: 0 });

    // Clear previous list unless holding Ctrl/Command key for cumulative actions [1.2.4]
    if (!e.ctrlKey && !e.metaKey) {
      setSelectedFrameIdsForDeletion([]);
    }
  };

  const handleGridMouseMove = (e: React.MouseEvent) => {
    if (!isDragSelecting || !dragStart || !lineartGridContainerRef.current) return;

    const rect = lineartGridContainerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const top = Math.min(dragStart.y, currentY);
    const left = Math.min(dragStart.x, currentX);
    const width = Math.abs(dragStart.x - currentX);
    const height = Math.abs(dragStart.y - currentY);

    setDragBox({ top, left, width, height });

    // Calculate boundary intersections on all thumbnails inside the container [1.2.4]
    const selectBoundary = {
      left: left + rect.left,
      top: top + rect.top,
      right: left + rect.left + width,
      bottom: top + rect.top + height
    };

    const thumbnails = lineartGridContainerRef.current.querySelectorAll('.lineart-item');
    const intersectedIds: string[] = [];

    thumbnails.forEach((thumb) => {
      const thumbRect = thumb.getBoundingClientRect();
      const id = thumb.getAttribute('data-id');

      if (id) {
        // Evaluate rectangular collision
        const isColliding = !(
          thumbRect.right < selectBoundary.left ||
          thumbRect.left > selectBoundary.right ||
          thumbRect.bottom < selectBoundary.top ||
          thumbRect.top > selectBoundary.bottom
        );

        if (isColliding) {
          intersectedIds.push(id);
        }
      }
    });

    setSelectedFrameIdsForDeletion((prev) => {
      if (e.ctrlKey || e.metaKey) {
        // Union/Merge lists if command is pressed [1.2.4]
        const unique = new Set([...prev, ...intersectedIds]);
        return Array.from(unique);
      }
      return intersectedIds;
    });
  };

  const handleGridMouseUp = () => {
    setIsDragSelecting(false);
    setDragStart(null);
    setDragBox(null);
  };

  // Toggles selected status inside the multi-deletion list
  const toggleFrameSelection = (id: string) => {
    setSelectedFrameIdsForDeletion((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Executes safe batch deletion across databases and memory arrays [1.1.2, 1.2.4]
  const handleBulkDeleteLinearts = async () => {
    if (selectedFrameIdsForDeletion.length === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedFrameIdsForDeletion.length} selected frames from your local workspace?`
    );
    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      for (const id of selectedFrameIdsForDeletion) {
        await deleteLocalFileFromDB(id);
      }

      setLocalLinearts((prev) => prev.filter((a) => !selectedFrameIdsForDeletion.includes(a.id)));
      setSelectedFrameIdsForDeletion([]);
      setActiveFrameIdx(0); // Safely reset playhead
    } catch (err) {
      console.error('[Editor] Failed to execute bulk deletion:', err);
      setError('An error occurred during bulk deletion.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─ Job Cost & Calculation (Synced to Backend Sliding-Window Partitioning) ────
  const getJobCost = () => {
    const N = totalFrames;
    if (N <= 24) return Math.max(N, 1);
    
    // Calculate chunks count K using the exact same backend algorithm [1.2.4]
    let chunksCount = 0;
    let start = 0;
    while (start + 24 <= N) {
      chunksCount++;
      start += 24;
    }
    if (start < N) {
      chunksCount++; // Final overlapping segment
    }
    return chunksCount * 24; // Each 24-frame job segment costs exactly 24 credits
  };

  // ─ Submit AI Job ─────────────────────────────────────────────────────────
  const handleAISubmit = () => {
    setError(null);
    
    const hasReference = activeProject?.storage_mode === 'local'
      ? selectedReferenceId !== null
      : cloudAssets.some(a => a.asset_type === 'reference');

    if (!hasReference) {
      setError('You must upload and select a colored reference sheet to run AI Colorization.');
      return;
    }

    // High FPS warning verification
    if (frameDensity > 24) {
      const confirmHighFps = window.confirm(
        `You have selected ${frameDensity} FPS. Semantic colorization works best at 24 FPS. Higher framerates may result in minor temporal stuttering. Do you wish to continue at ${frameDensity} FPS?`
      );
      if (!confirmHighFps) {
        setFrameDensity(24); // Optimize back to 24
        return;
      }
    }

    setShowConfirmModal(true); 
  };

  const availableCredits = profile ? profile.credits - profile.reserved_credits : 0;

  const executeAIJob = async () => {
    if (!activeProject) return;
    setShowConfirmModal(false);
    setIsProcessingAI(true);
    setError(null);

    const cost = getJobCost(); // Calculated using 24-frame chunks [1.2.4]

    try {
      // 1. Prepare FormData payload to handle binary files
      const formData = new FormData();
      formData.append('projectId', activeProject.id);
      formData.append('jobCost', '24'); // Cost per individual 24-frame chunk [1.2.4]
      formData.append('modelVersion', 'ixnel-colorizer-v2');

      if (activeProject.storage_mode === 'local') {
        // Retrieve the active reference File object
        const activeRefObj = localReferences.find(r => r.id === selectedReferenceId);
        if (activeRefObj) {
          formData.append('reference', activeRefObj.file);
        }

        // Retrieve and append all line_art File objects
        localLinearts.forEach((lineart) => {
          formData.append('frames', lineart.file);
        });
      } else {
        // Cloud mode: pass existing bucket identifier paths instead of uploading raw files
        formData.append('inputPath', 'Cloud Bucket Path');
      }

      // 2. Submit FormData payload to your backend
      const response = await projectAPI.submitJob(formData);

      if (response.success && response.data) {
        // Retrieve both the primary job ID and the full batch list
        const jobId = response.data.id;
        const batchJobIds = response.data.batchJobIds || [jobId];
        
        if (!jobId) {
          console.error('[Editor] Error: Queued job ID is undefined. Aborting status polling.');
          setIsProcessingAI(false);
          setError('Job successfully queued, but failed to retrieve tracking identifier.');
          return;
        }

        onAuthSuccess(); // Update credit indicators immediately
        setAiJobStatus('queued'); // Initial State

        // Trigger the shared batch polling tracker
        startStatusPolling(batchJobIds);

      } else {
        setIsProcessingAI(false);
        setError(response.error || 'Inference submission failed.');
      }
    } catch (err) {
      setIsProcessingAI(false);
      setError('A connection error occurred.');
    }
  };

  const activeReferenceImage = activeProject?.storage_mode === 'local'
    ? localReferences.find(r => r.id === selectedReferenceId)?.url
    : cloudAssets.find(a => a.asset_type === 'reference')?.file_url;

  // Calculates details of current batch layout for explicit user warning [1.2.4]
  const getBatchSplitCount = () => {
    const N = totalFrames;
    if (N <= 24) return 1;
    let count = 0;
    let start = 0;
    while (start + 24 <= N) {
      count++;
      start += 24;
    }
    if (start < N) count++;
    return count;
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-neutral-950 text-white overflow-hidden select-none flex flex-col pt-16 z-50 animate-in fade-in duration-300">
      
      {/* Dynamic CSS injection to style ugly white/grey scrollbars dark */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #171717; /* neutral-900 */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #404040; /* neutral-700 */
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #00AAFF; /* Ixnel Accent */
        }
      `}} />

      {/* ─── Top Header Workspace Panel ─── */}
      <div className="h-16 bg-neutral-900 border-b border-white/5 flex items-center justify-between px-6 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => !isProcessingAI && onNavigate('projects')}
            disabled={isProcessingAI}
            className={`p-2 rounded-xl text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 ${
              isProcessingAI 
                ? 'opacity-40 cursor-not-allowed pointer-events-none' 
                : 'hover:bg-white/5'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Workspace
          </button>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
              {activeProject?.name}
              <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border ${
                activeProject?.storage_mode === 'local'
                  ? 'bg-red-500/10 border-red-500/25 text-red-400'
                  : 'bg-green-500/10 border-green-500/25 text-green-400'
              }`}>
                {activeProject?.storage_mode}
              </span>
            </h1>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mt-0.5">Ixnel Animation Studio</p>
          </div>
        </div>

        {/* Dynamic balances */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs text-neutral-400 px-3 py-1.5 bg-neutral-950 border border-white/10 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-[#00AAFF]" />
            {availableCredits} Credits Available
          </span>
        </div>
      </div>

      {/* ─── Main Sidebar & Canvas Layout ─── */}
      <div className="flex-1 w-full h-full flex relative overflow-hidden">
        
        {/* LEFT PANEL: Asset Library (With shrink-0 safeguard and custom scrollbars) */}
        <div className="w-72 shrink-0 bg-neutral-900 border-r border-white/5 flex flex-col z-10 overflow-y-auto custom-scrollbar p-5 space-y-6">
          <div className="flex items-center gap-2 text-white font-bold border-b border-white/5 pb-3">
            <Layers className="w-4 h-4 text-[#00AAFF]" />
            Asset Library
          </div>

          {/* SECTION A: Reference Character Sheet */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">References</span>
              <button 
                onClick={() => handleUploadClick('reference')}
                className="p-1 hover:bg-white/5 rounded-md text-[#00AAFF] transition-colors"
                title="Upload Reference Sheet"
              >
                <Plus className="w-4 h-4" />
              </button>
              <input type="file" accept="image/*" className="hidden" ref={referenceInputRef} onChange={(e) => handleFileChange(e, 'reference')} />
            </div>

            {activeProject?.storage_mode === 'local' ? (
              localReferences.length === 0 ? (
                <div className="border border-dashed border-white/10 rounded-xl p-4 text-center text-xs text-neutral-500">
                  No reference sheets uploaded.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {localReferences.map((ref) => (
                    <div 
                      key={ref.id}
                      onClick={() => setSelectedReferenceId(ref.id)}
                      className={`group relative aspect-square border rounded-xl overflow-hidden cursor-pointer transition-all ${
                        selectedReferenceId === ref.id ? 'border-[#00AAFF] ring-1 ring-[#00AAFF]/40' : 'border-white/5'
                      }`}
                    >
                      <img src={ref.url} className="w-full h-full object-cover" alt="local reference" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteAsset(ref.id, 'reference'); }}
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-md text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all animate-in fade-in duration-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              cloudAssets.filter(a => a.asset_type === 'reference').length === 0 ? (
                <div className="border border-dashed border-white/10 rounded-xl p-4 text-center text-xs text-neutral-500">
                  No cloud reference sheets.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {cloudAssets.filter(a => a.asset_type === 'reference').map((ref) => (
                    <div 
                      key={ref.id}
                      className="relative aspect-square border border-white/5 rounded-xl overflow-hidden"
                    >
                      <img src={ref.file_url} className="w-full h-full object-cover" alt="cloud reference" />
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {/* SECTION B: Input Line-Art Frames (Allows Multiple Selections) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Line-Art Sequence</span>
              <div className="flex items-center gap-1">
                {/* Dynamically renders bulk deletion button if frames are selected [1.2.4] */}
                {selectedFrameIdsForDeletion.length > 0 && (
                  <button 
                    onClick={handleBulkDeleteLinearts}
                    className="p-1 hover:bg-red-500/10 rounded-md text-red-400 transition-colors animate-in fade-in zoom-in-95 duration-200"
                    title={`Delete Selected (${selectedFrameIdsForDeletion.length})`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => handleUploadClick('line_art')}
                  className="p-1 hover:bg-white/5 rounded-md text-[#00AAFF] transition-colors"
                  title="Upload Line-Art Frame"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {/* Enabled 'multiple' attribute for concurrent frame uploads */}
              <input type="file" accept="image/*" multiple className="hidden" ref={lineartInputRef} onChange={(e) => handleFileChange(e, 'line_art')} />
            </div>

            {/* Drag-to-Select Marquee Grid Container [1.2.4] */}
            <div 
              ref={lineartGridContainerRef}
              onMouseDown={handleGridMouseDown}
              onMouseMove={handleGridMouseMove}
              onMouseUp={handleGridMouseUp}
              onMouseLeave={handleGridMouseUp}
              className="relative select-none outline-none" // Required relative boundary positioning [1.2.4]
            >
              {/* Blue selection marquee box rendering [1.2.4] */}
              {dragBox && (
                <div 
                  className="absolute border border-[#00AAFF]/60 bg-[#00AAFF]/15 rounded pointer-events-none z-50"
                  style={{
                    top: dragBox.top,
                    left: dragBox.left,
                    width: dragBox.width,
                    height: dragBox.height
                  }}
                />
              )}

              {activeProject?.storage_mode === 'local' ? (
                localLinearts.length === 0 ? (
                  <div className="border border-dashed border-white/10 rounded-xl p-6 text-center text-xs text-neutral-500">
                    No line-art frames uploaded.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {localLinearts.map((frame, i) => {
                      const isSelected = selectedFrameIdsForDeletion.includes(frame.id);
                      return (
                        <div 
                          key={frame.id} 
                          data-id={frame.id} // Essential identifier for rectangular collision math [1.2.4]
                          onClick={() => setActiveFrameIdx(i)}
                          className={`lineart-item relative aspect-square border rounded-lg overflow-hidden bg-black/40 cursor-pointer transition-all ${
                            activeFrameIdx === i ? 'border-[#00AAFF] ring-1 ring-[#00AAFF]/30' : 'border-white/5'
                          }`}
                        >
                          <img src={frame.url} className="w-full h-full object-contain p-1" alt="local lineart" />
                          
                          {/* Circular Checkbox (Can be toggled manually or via marquee drag) [1.2.4] */}
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFrameSelection(frame.id);
                            }}
                            className={`checkbox-element absolute top-1 left-1 w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-black transition-all z-30 ${
                              isSelected 
                                ? 'bg-red-500 border-red-500 text-white' 
                                : 'bg-black/60 border-white/30 text-transparent hover:border-white/60 group-hover:text-neutral-500'
                            }`}
                          >
                            ✓
                          </div>

                          <span className="absolute bottom-1 right-1 bg-black/60 px-1 text-[8px] font-bold text-white rounded">
                            #{i + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                cloudAssets.filter(a => a.asset_type === 'line_art').length === 0 ? (
                  <div className="border border-dashed border-white/10 rounded-xl p-6 text-center text-xs text-neutral-500">
                    No cloud line-art frames.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {cloudAssets.filter(a => a.asset_type === 'line_art').map((frame, i) => (
                      <div 
                        key={frame.id} 
                        onClick={() => setActiveFrameIdx(i)}
                        className={`relative aspect-square border rounded-lg overflow-hidden bg-black/40 cursor-pointer transition-all ${
                          activeFrameIdx === i ? 'border-[#00AAFF] ring-1 ring-[#00AAFF]/30' : 'border-white/5'
                        }`}
                      >
                        <img src={frame.file_url} className="w-full h-full object-contain p-1" alt="cloud lineart" />
                        <span className="absolute bottom-1 right-1 bg-black/60 px-1 text-[8px] font-black text-white rounded">
                          #{frame.frame_number || i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* CENTER: Canvas & Timeline Area (With overflow-hidden guard) */}
        <div className="flex-1 h-full bg-neutral-950 flex flex-col relative overflow-hidden">
          
          {/* Working View Area (Canvas shifted left & Player controller added) [1.2.4] */}
          <div className="flex-1 w-full flex items-center justify-between p-6 gap-6 relative">
            
            {/* Shifted Canvas View Area */}
            <div className="flex-1 flex items-center justify-center relative">
              <div className="max-w-xl aspect-video w-full border border-white/5 bg-neutral-900 rounded-[28px] shadow-2xl flex items-center justify-center overflow-hidden relative">
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 border border-white/10 rounded-full text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                  Canvas Frame View
                </div>

                {activeProject?.storage_mode === 'local' && localLinearts.length > 0 ? (
                  <img src={localLinearts[activeFrameIdx]?.url} className="w-full h-full object-contain p-8 animate-in fade-in duration-200" alt="active frame" />
                ) : activeProject?.storage_mode === 'cloud' && cloudAssets.filter(a => a.asset_type === 'line_art').length > 0 ? (
                  <img src={cloudAssets.filter(a => a.asset_type === 'line_art')[activeFrameIdx]?.file_url} className="w-full h-full object-contain p-8 animate-in fade-in duration-200" alt="active frame" />
                ) : (
                  <div className="text-center space-y-3">
                    <FileImage className="w-12 h-12 text-neutral-600 mx-auto" />
                    <p className="text-sm text-neutral-500">No frames loaded in timeline.</p>
                  </div>
                )}
              </div>
            </div>

            {/* NEW RIGHT BOX: The Animation Sequencer Player [1.2.4] */}
            <div className="w-64 shrink-0 bg-neutral-900 border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-48 shadow-lg">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold border-b border-white/5 pb-2 text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#00AAFF]" />
                  Sequence Player
                </div>
                <div className="text-neutral-400 text-xs font-semibold pt-1">
                  Active Frame: <span className="text-[#00AAFF] font-black">{totalFrames > 0 ? activeFrameIdx + 1 : 0}</span> / {totalFrames}
                </div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                  Speed: {frameDensity} FPS
                </div>
              </div>

              {/* Player Controllers */}
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={totalFrames === 0}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md ${
                    isPlaying 
                      ? 'bg-yellow-500 text-neutral-950 hover:bg-white' 
                      : 'bg-[#00AAFF] text-neutral-950 hover:bg-white shadow-[#00AAFF]/15'
                  }`}
                >
                  {isPlaying ? 'PAUSE' : 'PLAY'}
                </button>
                <button
                  type="button"
                  onClick={handleResetPlayer}
                  disabled={totalFrames === 0}
                  className="px-4 py-2.5 bg-neutral-800 border border-white/5 hover:border-white/10 hover:bg-neutral-750 text-neutral-300 hover:text-white rounded-xl font-bold text-xs transition-all"
                >
                  RESET
                </button>
              </div>
            </div>

          </div>

          {/* 2D Timeline Filmstrip (Unified and aligned at bottom of canvas flex-column with custom scrollbars) */}
          <div className="h-32 bg-neutral-900 border-t border-white/5 p-4 flex items-center gap-3 overflow-x-auto custom-scrollbar w-full">
            {activeProject?.storage_mode === 'local' ? (
              localLinearts.length === 0 ? (
                <div className="text-xs text-neutral-500 font-medium mx-auto flex items-center gap-2">
                  <Layers className="w-4 h-4 text-neutral-600" />
                  Your 2D sequence timeline will display here.
                </div>
              ) : (
                <div className="flex gap-2.5 h-full">
                  {localLinearts.map((frame, i) => (
                    <div 
                      key={frame.id}
                      onClick={() => setActiveFrameIdx(i)}
                      className={`relative h-full aspect-video border rounded-lg overflow-hidden bg-black/40 cursor-pointer flex-shrink-0 transition-all ${
                        activeFrameIdx === i ? 'border-[#00AAFF] ring-2 ring-[#00AAFF]/20 scale-95' : 'border-white/5'
                      }`}
                    >
                      <img src={frame.url} className="w-full h-full object-contain p-1" alt="timeline thumbnail" />
                      <span className="absolute bottom-1 right-1 bg-black/60 px-1 text-[8px] font-black text-white rounded">
                        #{i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              cloudAssets.filter(a => a.asset_type === 'line_art').length === 0 ? (
                <div className="text-xs text-neutral-500 font-medium mx-auto flex items-center gap-2">
                  <Layers className="w-4 h-4 text-neutral-600" />
                  Your 2D sequence timeline will display here.
                </div>
              ) : (
                <div className="flex gap-2.5 h-full">
                  {cloudAssets.filter(a => a.asset_type === 'line_art').map((frame, i) => (
                    <div 
                      key={frame.id}
                      onClick={() => setActiveFrameIdx(i)}
                      className={`relative h-full aspect-video border rounded-lg overflow-hidden bg-black/40 cursor-pointer flex-shrink-0 transition-all ${
                        activeFrameIdx === i ? 'border-[#00AAFF] ring-2 ring-[#00AAFF]/20 scale-95' : 'border-white/5'
                      }`}
                    >
                      <img src={frame.file_url} className="w-full h-full object-contain p-1" alt="timeline thumbnail" />
                      <span className="absolute bottom-1 right-1 bg-black/60 px-1 text-[8px] font-black text-white rounded">
                        #{frame.frame_number || i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* RIGHT PANEL: AI Generation Sidebar (With shrink-0 safeguard and fixed button layout) */}
        <div className="w-72 shrink-0 bg-neutral-900 border-l border-white/5 flex flex-col z-10 p-5 h-full">
          
          {/* Scrollable Configuration Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-6 pb-4">
            <div className="flex items-center gap-2 text-white font-bold border-b border-white/5 pb-3">
              <Wand2 className="w-4 h-4 text-[#00AAFF]" />
              AI Processing Tools
            </div>

            {/* ⚠️ ADD THIS ERROR BANNER HERE TO SHOW COMPILER/BALANCES ERRORS */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-start justify-between gap-2 animate-in fade-in zoom-in-95 duration-200">
                <span className="font-semibold leading-relaxed">{error}</span>
                <button 
                  onClick={() => setError(null)} 
                  className="text-neutral-400 hover:text-white transition-colors text-xs font-bold pt-0.5"
                >
                  ✕
                </button>
              </div>
            )}

            {/* ⚠️ ADD THIS RECOVERY DOWNLOAD CARD FOR BACKGROUND COMPLETIONS */}
            {lastCompletedBatch.length > 0 && (
              <div className="bg-green-500/10 border border-green-500/25 text-green-400 p-4 rounded-2xl text-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Latest Render Complete! 🎉
                </div>
                <p className="text-neutral-400 leading-relaxed font-semibold">
                  Your sequence was successfully colorized in{' '}
                  <strong>{lastCompletedBatch.length} parallel segments</strong> while you were away.
                </p>
                <button
                  type="button"
                  onClick={triggerBatchDownload}
                  className="w-full py-2.5 bg-green-500 text-neutral-950 hover:bg-white hover:text-neutral-950 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-green-500/10"
                >
                  Download {lastCompletedBatch.length} Colorized ZIPs
                </button>
              </div>
            )}

            {/* TOOL SELECTOR */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Select AI Model</span>
              <div className="space-y-1.5">
                <button 
                  type="button"
                  onClick={() => setActiveTool('colorization')}
                  className={`w-full p-3 border rounded-xl flex items-center gap-3 text-left transition-all ${
                    activeTool === 'colorization' 
                      ? 'bg-[#00AAFF]/10 border-[#00AAFF]/30 text-white' 
                      : 'border-white/5 bg-black/20 text-neutral-400 hover:border-white/10'
                  }`}
                >
                  <Palette className="w-4 h-4 text-[#00AAFF]" />
                  <div>
                    <span className="text-xs font-bold block">Semantic Colorizer</span>
                    <span className="text-[9px] text-neutral-500 font-semibold">Coloring via reference</span>
                  </div>
                </button>

                <button 
                  disabled
                  type="button"
                  className="w-full p-3 border border-white/5 bg-black/10 text-neutral-500 rounded-xl flex items-center gap-3 text-left cursor-not-allowed relative"
                >
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-neutral-800 text-neutral-600 text-[8px] font-black tracking-widest uppercase rounded">Soon</span>
                  <Layers className="w-4 h-4" />
                  <div>
                    <span className="text-xs font-bold block">Line-Art Generator</span>
                    <span className="text-[9px] text-neutral-600 font-semibold">Roughs to clean vectors</span>
                  </div>
                </button>
              </div>
            </div>

            {/* REFERENCE COMPARISON AREA */}
            <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-3">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Reference Selected</span>
              {activeReferenceImage ? (
                <div className="aspect-video w-full rounded-lg border border-white/5 overflow-hidden animate-in fade-in duration-200">
                  <img src={activeReferenceImage} className="w-full h-full object-cover" alt="selected reference preview" />
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-neutral-600 font-semibold bg-black/20 border border-dashed border-white/10 rounded-xl">
                  No active reference mapped.
                </div>
              )}
            </div>

            {/* PARAMETERS PANEL */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">AI Parameters</span>
                <Settings2 className="w-4 h-4 text-neutral-500" />
              </div>

              {/* Slider 1 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-neutral-400">
                  <span>Target Framerate</span>
                  <span className="text-[#00AAFF]">{frameDensity} fps</span>
                </div>
                <input 
                  type="range" min="12" max="60" step="12" 
                  value={frameDensity} onChange={(e) => setFrameDensity(parseInt(e.target.value))} 
                  className="w-full accent-[#00AAFF]" 
                />
              </div>

              {/* Slider 2 */}
              {/* Slider 2 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-neutral-400">
                  <span>Prompt Strength</span>
                  <span className="text-[#00AAFF]">{promptStrength}</span>
                </div>
                <input 
                  type="range" min="1" max="20" step="0.5" 
                  value={promptStrength} onChange={(e) => setPromptStrength(parseFloat(e.target.value))} 
                  className="w-full accent-[#00AAFF]" 
                />
              </div>

              {/* Informational Captions */}
              <p className="text-[9px] text-neutral-500 leading-relaxed font-semibold pt-2 border-t border-white/5">
                ℹ️ Frames are temporarily scaled to 512x320 for efficient AI GPU processing and automatically restored back to their original size upon final compile.
              </p>
            </div>
          </div>

          {/* Fixed Footer Area containing Estimator and Dynamic Button */}
          <div className="pt-4 border-t border-white/5 bg-neutral-900 space-y-4 shrink-0">
            {/* DEDUCTION ESTIMATOR */}
            <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-center space-y-1">
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block">Estimated Cost</span>
              <span className="text-2xl font-black text-white">{getJobCost()} Credits</span>
              <span className="text-[10px] text-neutral-500 block">1 credit per frame sequence</span>
            </div>

            {/* DYNAMIC ACTION SUBMIT BUTTON (Colorize vs. Create) */}
            <button
              type="button"
              onClick={handleAISubmit}
              className="w-full py-4 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold text-sm tracking-wide hover:bg-white transition-all shadow-lg shadow-[#00AAFF]/25 hover:shadow-white/10 flex items-center justify-center gap-2 group/btn"
            >
              {activeTool === 'colorization' ? 'Colorize' : 'Create'}{' '}
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── OVERLAY: Job Cost Transaction Confirmation ─── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md p-8 bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl space-y-6 text-center overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00AAFF]/50 to-transparent" />
            
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-[#00AAFF]/15 border border-[#00AAFF]/30 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#00AAFF] animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white tracking-tight">Confirm AI Render</h3>
              
              {/* Custom Batch warning logic inside confirmation modal */}
              <p className="text-neutral-400 text-sm leading-relaxed">
                This operation will process your uploaded line-art sequence using our semantic colorization model. 
                {totalFrames > 24 ? (
                  <span className="block mt-2 text-yellow-500 font-semibold bg-yellow-500/10 border border-yellow-500/25 p-3 rounded-xl">
                    ⚠️ Your {totalFrames}-frame sequence will be automatically split into{' '}
                    <strong>{getBatchSplitCount()} overlapping segments</strong> to maintain color & temporal consistency. 
                    This will run as {getBatchSplitCount()} parallel jobs. This transaction is irreversible.
                  </span>
                ) : (
                  " This transaction is irreversible."
                )}
              </p>

              <div className="p-4 bg-black/40 border border-white/5 rounded-xl w-full">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Total Batch Cost</p>
                <p className="text-2xl font-black text-[#00AAFF]">{getJobCost()} Credits</p>
                {totalFrames > 24 && (
                  <p className="text-[9px] text-neutral-500 mt-1">
                    ({getBatchSplitCount()} segments × 24 credits per chunk)
                  </p>
                )}
              </div>
              <p className="text-neutral-300 text-sm font-semibold pt-2">Do you wish to continue?</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
              >
                No, Cancel
              </button>
              <button
                onClick={executeAIJob}
                className="flex-1 py-3 bg-[#00AAFF] text-neutral-950 rounded-xl font-bold text-sm hover:bg-white transition-all shadow-md shadow-[#00AAFF]/10"
              >
                Yes, Deduct & Run
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── OVERLAY: Render Progress & Success Message ─── */}
      {isProcessingAI && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-white/10 px-8 py-6 rounded-3xl shadow-2xl flex flex-col items-center gap-5 text-center max-w-sm">
            
            <div className="relative">
              {/* Native CSS Spinner */}
              <div className="w-12 h-12 rounded-full border-4 border-[#00AAFF]/20 border-t-[#00AAFF] animate-spin" />
              <Sparkles className="w-5 h-5 text-[#00AAFF] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">Ixnel AI Engine</h3>
              
              {/* Dynamic Status Translator */}
              {aiJobStatus === 'queued' && (
                <p className="text-sm text-neutral-400 font-medium animate-pulse">
                  Job queued... waiting for a free worker node.
                </p>
              )}
              {aiJobStatus === 'initiated' && (
                <p className="text-sm text-[#00AAFF] font-medium animate-pulse">
                  Worker assigned! Setting up workspace...
                </p>
              )}
              {aiJobStatus === 'processing' && (
                <p className="text-sm text-green-400 font-semibold animate-pulse">
                  Model executing... colorizing timeline frames.
                </p>
              )}
              {!aiJobStatus && (
                <p className="text-sm text-neutral-400 font-medium">
                  Preparing sequence pipelines...
                </p>
              )}
            </div>

            {/* Micro-visual indicator of progress status dots */}
            <div className="flex gap-1.5 justify-center">
              <span className={`w-2 h-2 rounded-full transition-all duration-300 ${aiJobStatus ? 'bg-[#00AAFF]' : 'bg-neutral-700'}`} />
              <span className={`w-2 h-2 rounded-full transition-all duration-300 ${['initiated', 'processing'].includes(aiJobStatus || '') ? 'bg-[#00AAFF] animate-pulse' : 'bg-neutral-700'}`} />
              <span className={`w-2 h-2 rounded-full transition-all duration-300 ${aiJobStatus === 'processing' ? 'bg-green-400 animate-bounce' : 'bg-neutral-700'}`} />
            </div>

          </div>
        </div>
      )}

      {/* ─── OVERLAY: Successful Render and Auto-download Warning ─── */}
      {isSuccessModalShown && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md p-8 bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl space-y-6 text-center overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
            
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white tracking-tight">Render Complete! 🎉</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Your frames have been successfully colorized [1.2.4]. Since you are in <strong className="text-red-400 uppercase">Local Privacy Mode</strong>, no files have been saved to Cloud Storage.
              </p>
              <p className="text-neutral-200 text-sm font-semibold pt-2">A ZIP containing your output frames has been compiled.</p>
            </div>

            <button
              onClick={() => {
                setIsSuccessModalShown(false);
                onNavigate('projects'); // Safely redirect back to projects
              }}
              className="w-full py-3.5 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-all shadow-lg shadow-green-500/10 flex items-center justify-center gap-2"
            >
              Back to Projects <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}