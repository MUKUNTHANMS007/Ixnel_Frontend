import { useState, useRef, useEffect, useCallback } from 'react';
import { pipelineApi } from './pipelineApi';
import type { JobStatus } from './pipelineApi';

export type PipelineState = 'idle' | 'uploading' | 'queued' | 'planning' | 'running' | 'complete' | 'failed';

export function usePipeline() {
  const [state, setState] = useState<PipelineState>('idle');
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<number | null>(null);

  const startJob = async (referenceImage: File, lineartFrames: File[], options?: any) => {
    try {
      setState('uploading');
      setError(null);
      const res = await pipelineApi.createJob(referenceImage, lineartFrames, options);
      if (res.job_id) {
        setJobId(res.job_id);
        setState('queued');
      } else {
        throw new Error('No job ID returned from server');
      }
    } catch (err: any) {
      setState('failed');
      setError(err.message || 'Failed to start job');
    }
  };

  const clearPolling = () => {
    if (pollIntervalRef.current !== null) {
      window.clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const pollStatus = useCallback(async () => {
    if (!jobId) return;

    try {
      const data = await pipelineApi.getJobStatus(jobId);
      setStatus(data);

      if (data.status === 'complete') {
        setState('complete');
        clearPolling();
      } else if (data.status === 'failed') {
        setState('failed');
        setError(data.error || 'Job failed');
        clearPolling();
      } else {
        // can be 'queued', 'planning', 'running'
        setState(data.status);
      }
    } catch (err: any) {
      console.error('Polling error:', err);
      // Wait for the next poll, but if it fails repeatedly, maybe set error. For now just continue polling.
    }
  }, [jobId]);

  useEffect(() => {
    if (['idle', 'uploading', 'complete', 'failed'].includes(state) || !jobId) {
      clearPolling();
      return;
    }

    pollIntervalRef.current = window.setInterval(pollStatus, 2000);
    pollStatus(); // initial poll

    return clearPolling;
  }, [jobId, state, pollStatus]);

  const reset = () => {
    clearPolling();
    setState('idle');
    setJobId(null);
    setStatus(null);
    setError(null);
  };

  return { state, jobId, status, error, startJob, reset };
}
