import { useRef } from 'react';
import { Download, PlayCircle } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  zipUrl: string;
}

export function VideoPlayer({ videoUrl, zipUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Safari-compatible <video> tag handles requires playsInline and controls
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 p-4">
      <div className="rounded-xl overflow-hidden shadow-2xl border border-neutral-200 bg-neutral-900 w-full relative aspect-video flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls
          playsInline
          autoPlay
          loop
          muted
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {!videoUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 gap-4">
             <PlayCircle className="w-16 h-16 opacity-50" />
             <p>No video source available</p>
          </div>
        )}
      </div>
      
      <a 
        href={zipUrl}
        download
        className="flex items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-medium transition-colors shadow-sm"
      >
        <Download className="w-5 h-5" />
        Download Frames (ZIP)
      </a>
    </div>
  );
}
