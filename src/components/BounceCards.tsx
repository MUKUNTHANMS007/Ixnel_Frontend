// components/BounceCards.tsx
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface BounceCardsProps {
  className?: string;
  linearts: string[];
  colors: string[];
  sequences?: string[][];
  containerWidth?: number;
  containerHeight?: number;
  animationDelay?: number;
  animationStagger?: number;
  easeType?: string;
  transformStyles?: string[];
  enableHover?: boolean;
  cardWidth?: number;
  cardAspectRatio?: string;
}

export default function BounceCards({
  className = '',
  linearts = [],
  colors = [],
  sequences = [],
  containerWidth = 460,
  containerHeight = 280,
  animationDelay = 0.5,
  animationStagger = 0.06,
  easeType = 'elastic.out(1, 0.8)',
  transformStyles = [
    'rotate(10deg) translate(-170px)',
    'rotate(5deg) translate(-85px)',
    'rotate(-3deg)',
    'rotate(-10deg) translate(85px)',
    'rotate(2deg) translate(170px)'
  ],
  enableHover = true,
  cardWidth = 160,
  cardAspectRatio = '4/5'
}: BounceCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showColors, setShowColors] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [sequenceFrames, setSequenceFrames] = useState<{ [key: number]: number }>({});
  const sequenceIntervalsRef = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  // Auto-toggle between lineart and color every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (hoveredCard === null) {
        setShowColors(prev => !prev);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [hoveredCard]);

  // Persistent bounce animation with ScrollTrigger - plays every time element enters viewport
  useEffect(() => {
    if (!containerRef.current) return;
    
    const cards = containerRef.current.querySelectorAll('.b-card');
    if (cards.length === 0) return;

    // Create ScrollTrigger that plays animation each time
    const scrollTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => playBounceAnimation(cards),
      onEnterBack: () => playBounceAnimation(cards),
      // Uncomment below to see markers for debugging
      // markers: true
    });

    // Play initial animation
    playBounceAnimation(cards);

    return () => {
      scrollTrigger.kill();
    };
  }, [animationDelay, animationStagger, easeType]);

  const playBounceAnimation = (cards: NodeListOf<Element>) => {
    gsap.fromTo(
      cards,
      { 
        scale: 0,
        opacity: 0
      },
      {
        scale: 1,
        opacity: 1,
        stagger: animationStagger,
        ease: easeType,
        delay: animationDelay,
        duration: 0.8
      }
    );
  };

  // Cleanup sequence intervals
  useEffect(() => {
    return () => {
      Object.values(sequenceIntervalsRef.current).forEach(clearInterval);
    };
  }, []);

  const getNoRotationTransform = (transformStr: string): string => {
    const hasRotate = /rotate\([^)]*\)/.test(transformStr);
    if (hasRotate) {
      return transformStr.replace(/rotate\([^)]*\)/, 'rotate(0deg)');
    }
    return transformStr === 'none' ? 'rotate(0deg)' : `${transformStr} rotate(0deg)`;
  };

  const getPushedTransform = (baseTransform: string, offsetX: number): string => {
    const translateRegex = /translate\(([-0-9.]+)px\)/;
    const match = baseTransform.match(translateRegex);
    if (match) {
      const currentX = parseFloat(match[1]);
      const newX = currentX + offsetX;
      return baseTransform.replace(translateRegex, `translate(${newX}px)`);
    }
    return baseTransform === 'none' ? `translate(${offsetX}px)` : `${baseTransform} translate(${offsetX}px)`;
  };

  const pushSiblings = (hoveredIdx: number) => {
    if (!enableHover || !containerRef.current) return;

    const cards = containerRef.current.querySelectorAll('.b-card');

    cards.forEach((card, i) => {
      gsap.killTweensOf(card);

      const baseTransform = transformStyles[i] || 'none';

      if (i === hoveredIdx) {
        const noRotation = getNoRotationTransform(baseTransform);
        gsap.to(card, {
          transform: noRotation,
          scale: 1.05,
          duration: 0.4,
          ease: 'back.out(1.4)',
          zIndex: 50
        });
      } else {
        const offsetX = i < hoveredIdx ? -140 : 160;
        const pushedTransform = getPushedTransform(baseTransform, offsetX);
        const distance = Math.abs(hoveredIdx - i);
        const delay = distance * 0.05;

        gsap.to(card, {
          transform: pushedTransform,
          scale: 0.95,
          duration: 0.4,
          ease: 'back.out(1.4)',
          delay,
          zIndex: 10
        });
      }
    });
  };

  const resetSiblings = () => {
    if (!enableHover || !containerRef.current) return;

    const cards = containerRef.current.querySelectorAll('.b-card');

    cards.forEach((card, i) => {
      gsap.killTweensOf(card);

      const baseTransform = transformStyles[i] || 'none';
      gsap.to(card, {
        transform: baseTransform,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(1.4)',
        zIndex: 10
      });
    });
  };

  const startSequence = (idx: number) => {
    if (!sequences[idx] || sequences[idx].length === 0) {
      return;
    }

    // Clear any existing interval
    if (sequenceIntervalsRef.current[idx]) {
      clearInterval(sequenceIntervalsRef.current[idx]);
    }

    // Start from frame 0
    setSequenceFrames(prev => {
      const newState = { ...prev, [idx]: 0 };
      return newState;
    });

    // Play sequence
    let frameIndex = 0;
    const interval = setInterval(() => {
      frameIndex = (frameIndex + 1) % sequences[idx].length;
      setSequenceFrames(prev => ({
        ...prev,
        [idx]: frameIndex
      }));
    }, 100); // 10 fps

    sequenceIntervalsRef.current[idx] = interval;
  };

  const stopSequence = (idx: number) => {
    if (sequenceIntervalsRef.current[idx]) {
      clearInterval(sequenceIntervalsRef.current[idx]);
      delete sequenceIntervalsRef.current[idx];
    }
    
    // Remove from state
    setSequenceFrames(prev => {
      const newState = { ...prev };
      delete newState[idx];
      return newState;
    });
  };

  const handleCardEnter = (idx: number) => {
    setHoveredCard(idx);
    pushSiblings(idx);
    startSequence(idx);
  };

  const handleCardLeave = (idx: number) => {
    setHoveredCard(null);
    resetSiblings();
    stopSequence(idx);
  };

  const getCurrentImage = (idx: number): string => {
    // Priority: sequence (when hovering) > color/lineart toggle
    if (hoveredCard === idx && sequenceFrames[idx] !== undefined && sequences[idx] && sequences[idx].length > 0) {
      const imagePath = sequences[idx][sequenceFrames[idx]];
      return imagePath;
    }
    
    const imagePath = showColors ? colors[idx] : linearts[idx];
    return imagePath;
  };

  const handleImageError = (idx: number, src: string) => {
    console.error(`Failed to load image for card ${idx}:`, src);
    setImageErrors(prev => ({ ...prev, [src]: true }));
  };

  const handleImageLoad = (idx: number, src: string) => {
    console.log(`Successfully loaded image for card ${idx}:`, src);
  };

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      ref={containerRef}
      style={{
        width: containerWidth,
        height: containerHeight
      }}
    >
      {linearts.map((_, idx) => {
        const isHovered = hoveredCard === idx;
        const isPlaying = sequenceFrames[idx] !== undefined;
        const hasSequence = sequences[idx] && sequences[idx].length > 0;
        const currentImage = getCurrentImage(idx);

        return (
          <div
            key={idx}
            className={`b-card absolute rounded-3xl overflow-hidden transition-shadow duration-300 cursor-pointer`}
            style={{
              width: cardWidth,
              aspectRatio: cardAspectRatio,
              transform: transformStyles[idx] || 'none',
              zIndex: isHovered ? 50 : 10
            }}
            onMouseEnter={() => handleCardEnter(idx)}
            onMouseLeave={() => handleCardLeave(idx)}
          >
            {/* Card Border */}
            <div className="absolute inset-0 border-4 border-zinc-800 rounded-3xl shadow-2xl shadow-black/50 pointer-events-none z-10" />
            
            {/* Image */}
            <div className="w-full h-full bg-zinc-950 relative">
              <img 
                className="w-full h-full object-cover transition-opacity duration-300" 
                src={currentImage} 
                alt={`showcase-card-${idx}`}
                onError={() => handleImageError(idx, currentImage)}
                onLoad={() => handleImageLoad(idx, currentImage)}
              />
              
              {/* Fallback if image fails to load */}
              {imageErrors[currentImage] && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-500 text-xs p-4 text-center">
                  <div>
                    <div className="mb-2">Failed to load:</div>
                    <div className="text-[10px] break-all">{currentImage}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Playing Indicator */}
            {isPlaying && hasSequence && (
              <div className="absolute top-3 right-3 z-30 pointer-events-none">
                <div className="px-2.5 py-1 bg-[#00AAFF] rounded-full text-[10px] font-bold text-white tracking-wider flex items-center gap-1.5 shadow-lg">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  PLAYING {sequenceFrames[idx] + 1}/{sequences[idx].length}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}