// src/lib/project_api.ts

import { api } from './api';
import type { ApiResponse } from './api'; // Type-only import [1.1.9, 1.3.1]

export interface ProjectAsset {
  id: string;
  asset_type: 'reference' | 'line_art' | 'colorized_render';
  storage_key: string;
  file_url: string;
  frame_number: number | null;
  created_at: string;
}

export interface GetMyJobsResponse {
  jobs: JobRecord[];
}

export interface Project {
  id: string;
  profile_id: string;
  name: string;
  settings: any;
  storage_mode: 'cloud' | 'local';
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  assets?: ProjectAsset[];
}

export interface PresignAssetResponse {
  uploadUrl: string;
  storageKey: string;
}

export interface JobRecord {
  id: string;
  profile_id: string;
  project_id: string;
  input_path: string;
  output_path: string | null;
  status: 'queued' | 'blocked' | 'processing' | 'completed' | 'failed' | 'cancelled';
  job_cost: number;
  model_version: string;  
  priority: number;
  error_message?: string | null;       // Added to resolve compiler error
  processing_time_ms?: number | null;  // Added for analytical completeness
  batchJobIds?: string[]; 
  created_at: string;
}

// Named response payloads aligned to backend controllers [1.2.4]
export interface GetProjectsResponse {
  projects: Project[];
}

export interface GetProjectDetailsResponse {
  project: Project;
}

export const projectAPI = {
  createProject: async (
    name: string,
    storageMode: 'cloud' | 'local',
    settings: any = {}
  ): Promise<ApiResponse<Project>> => {
    const token = localStorage.getItem('accessToken');
    return api<Project>('/projects', {
      method: 'POST',
      body: { name, storage_mode: storageMode, settings },
      token,
    });
  },

  getProjects: async (): Promise<ApiResponse<GetProjectsResponse>> => {
    const token = localStorage.getItem('accessToken');
    return api<GetProjectsResponse>('/projects', {
      method: 'GET',
      token,
    });
  },

  getProjectById: async (id: string): Promise<ApiResponse<GetProjectDetailsResponse>> => {
    const token = localStorage.getItem('accessToken');
    return api<GetProjectDetailsResponse>(`/projects/${id}`, {
      method: 'GET',
      token,
    });
  },

  getPresignedUrl: async (
    projectId: string,
    fileName: string,
    contentType: string,
    fileSizeBytes: number
  ): Promise<ApiResponse<PresignAssetResponse>> => {
    const token = localStorage.getItem('accessToken');
    return api<PresignAssetResponse>(`/projects/${projectId}/assets/presign`, {
      method: 'POST',
      body: { fileName, contentType, fileSizeBytes },
      token,
    });
  },

  // Replace submitJob in src/lib/project_api.ts
  submitJob: async (
    formData: FormData
  ): Promise<ApiResponse<JobRecord>> => {
    const token = localStorage.getItem('accessToken');
    return api<JobRecord>('/jobs/submit', { // // Reverted back to /submit
      method: 'POST',
      body: formData, // standard fetch automatically parses FormData and generates boundary headers [1.1.2]
      token,
    });
  },

  getJobStatus: async (jobId: string): Promise<ApiResponse<Partial<JobRecord>>> => {
    const token = localStorage.getItem('accessToken');
    return api<Partial<JobRecord>>(`/jobs/${jobId}/status`, {
      method: 'GET',
      token,
    });
  },

  cancelJob: async (jobId: string): Promise<ApiResponse<{ message: string }>> => {
    const token = localStorage.getItem('accessToken');
    return api<{ message: string }>(`/jobs/${jobId}/cancel`, {
      method: 'PATCH', // Aligned to your exact PATCH route
      token,
    });
  },

  /**
   * Securely requests the backend to delete a project and cascade-wipe all its assets [1.2.4].
   */
  deleteProject: async (id: string): Promise<ApiResponse<void>> => {
    const token = localStorage.getItem('accessToken');
    return api<void>(`/projects/${id}`, {
      method: 'DELETE',
      token,
    });
  },

getMyJobs: async (): Promise<ApiResponse<GetMyJobsResponse>> => {
    const token = localStorage.getItem('accessToken');
    return api<GetMyJobsResponse>('/jobs', {
      method: 'GET',
      token,
    });
  },
};