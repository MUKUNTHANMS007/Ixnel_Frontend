// src/components/JobProgress.tsx

interface JobProgressProps {
  state: 'idle' | 'uploading' | 'queued' | 'planning' | 'running' | 'complete' | 'failed';
  currentStep?: string;
  progress?: number;
  framesDone?: number;
  totalFrames?: number;
  error?: string | null;
}

export function JobProgress({ state, currentStep, progress = 0, framesDone = 0, totalFrames = 0, error }: JobProgressProps) {
  if (state === 'idle') return null;

  // STRICT RULE: Use Amber/Emerald color palette (Amber-500 for bisection alerts, Emerald-600 for clean segments) as per the design system
  const isBisection = currentStep?.toLowerCase().includes('bisection');
  const barColor = isBisection ? 'bg-amber-500' : 'bg-emerald-600';
  const textColor = isBisection ? 'text-amber-500' : 'text-emerald-600';

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow border border-neutral-200">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800 tracking-tight">Job Status: <span className="capitalize">{state}</span></h3>
          {currentStep && (
            <p className={`text-sm font-medium mt-1 transition-colors duration-300 ${textColor}`}>
              {currentStep}
            </p>
          )}
          {state === 'failed' && error && (
            <p className="text-sm font-medium mt-1 text-red-500">Error: {error}</p>
          )}
        </div>
        {state === 'running' && (
          <div className="text-right">
            <div className="text-2xl font-bold tracking-tighter text-neutral-800">{Math.round(progress)}%</div>
            {totalFrames > 0 && <div className="text-xs text-neutral-500 uppercase tracking-wider">{framesDone} / {totalFrames} Frames</div>}
          </div>
        )}
      </div>

      {(state === 'queued' || state === 'planning' || state === 'running' || state === 'uploading') && (
        <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden relative">
          <div 
            className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${state === 'uploading' || state === 'queued' || state === 'planning' ? 'bg-neutral-800 w-1/3 animate-pulse' : barColor}`}
            style={{ width: state === 'running' ? `${progress}%` : undefined }}
          />
        </div>
      )}
    </div>
  );
}
