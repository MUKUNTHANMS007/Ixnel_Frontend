// src/lib/pipelineApi.ts
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface JobStatus {
  status: 'queued' | 'planning' | 'running' | 'complete' | 'failed';
  progress: number;
  frames_done: number;
  current_step: string;
  pipeline_log?: string;
  error?: string;
}

export const pipelineApi = {
  createJob: async (
    startFrame: File,
    endFrame: File,
    options?: { n_frames?: number; width?: number; height?: number; fps?: number }
  ) => {
    const formData = new FormData();
    formData.append('start_frame', startFrame);
    formData.append('end_frame', endFrame);
    
    if (options?.n_frames) formData.append('n_frames', options.n_frames.toString());
    if (options?.width) formData.append('width', options.width.toString());
    if (options?.height) formData.append('height', options.height.toString());
    if (options?.fps) formData.append('fps', options.fps.toString());

    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      throw new Error('Failed to create pipeline job');
    }
    return res.json(); // { job_id: string }
  },

  getJobStatus: async (jobId: string): Promise<JobStatus> => {
    const res = await fetch(`${API_BASE}/jobs/${jobId}`);
    if (!res.ok) {
      throw new Error('Failed to fetch job status');
    }
    return res.json();
  },

  getVideoUrl: (jobId: string) => `${API_BASE}/jobs/${jobId}/video`,
  getZipUrl: (jobId: string) => `${API_BASE}/jobs/${jobId}/frames.zip`,
};
