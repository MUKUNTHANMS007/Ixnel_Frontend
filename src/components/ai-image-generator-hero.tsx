import type React from "react"
import { useEffect, useRef } from "react"
import { ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageCard {
  id: string
  src: string
  alt: string
  rotation: number
}

interface ImageCarouselHeroProps {
  title: React.ReactNode
  subtitle: string
  description: string
  ctaText: string
  onCtaClick?: () => void
  images: ImageCard[]
  features?: Array<{
    title: string
    description: string
  }>
}

export function ImageCarouselHero({
  title,
  subtitle,
  description,
  ctaText,
  onCtaClick,
  images,
  features = [
    {
      title: "Realistic Results",
      description: "Photos that look professionally crafted",
    },
    {
      title: "Fast Generation",
      description: "Turn ideas into images in seconds.",
    },
    {
      title: "Diverse Styles",
      description: "Choose from a wide range of artistic options.",
    },
  ],
}: ImageCarouselHeroProps) {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const requestRef = useRef<number>(0)
  const rotationRef = useRef(0)
  const mousePosRef = useRef({ x: 0.5, y: 0.5 })
  const imagesRef = useRef(images)
  
  // Keep imagesRef synced in case props change
  useEffect(() => {
    imagesRef.current = images
  }, [images])

  // Extremely performant animation loop using direct DOM manipulation
  const animate = () => {
    // Determine rotation speed (degrees per frame) - roughly matching the old interval but smoother
    rotationRef.current = (rotationRef.current + 0.25) % 360
    
    const isMobile = window.innerWidth < 768
    const radius = isMobile ? 120 : 250
    
    cardsRef.current.forEach((card, index) => {
      if (!card) return
      
      const image = imagesRef.current[index]
      if (!image) return

      // Calculate position
      const baseAngle = index * (360 / imagesRef.current.length)
      const angle = (baseAngle + rotationRef.current) * (Math.PI / 180)
      
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius

      // Calculate perspective based on mouse position
      const perspectiveX = (mousePosRef.current.x - 0.5) * 15
      const perspectiveY = (mousePosRef.current.y - 0.5) * 15

      const zIndex = Math.round(Math.sin(angle) * 10) + 20

      // Apply transforms directly, bypassing React
      card.style.transform = `translate(${x}px, ${y}px) rotateX(${perspectiveY}deg) rotateY(${perspectiveX}deg) rotateZ(${image.rotation}deg)`
      card.style.zIndex = zIndex.toString()
    })

    requestRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    // Update ref instead of state to prevent re-renders on mouse move
    mousePosRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    }
  }

  return (
    <div className="relative w-full py-20 bg-white overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 max-w-7xl mx-auto">
        {/* Carousel Container */}
        <div
          className="relative w-full h-[400px] sm:h-[500px] mb-12 sm:mb-20 perspective-[1000px]"
          onMouseMove={handleMouseMove}
        >
          {/* Rotating Image Cards */}
          <div className="absolute inset-0 flex items-center justify-center">
            {images.map((image, index) => (
              <div
                key={image.id}
                ref={(el) => {
                  cardsRef.current[index] = el
                }}
                className="absolute w-40 h-56 sm:w-56 sm:h-72 transition-transform duration-0"
                style={{
                  transformStyle: "preserve-3d",
                  // Initial styles before the first frame runs
                  transform: `translate(0px, 0px) rotateZ(${image.rotation}deg)`,
                }}
              >
                <div
                  className={cn(
                    "relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/20",
                    "transition-all duration-500 hover:scale-110 hover:border-indigo-500/50 hover:shadow-indigo-500/30",
                    "cursor-pointer group",
                  )}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <img
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-500 mix-blend-overlay pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="relative z-40 text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            {subtitle}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 mb-8 tracking-tight text-balance">
            {title}
          </h1>

          <p className="text-xl text-neutral-600 mb-10 text-balance leading-relaxed">
            {description}
          </p>

          <button
            onClick={onCtaClick}
            className={cn(
              "inline-flex items-center gap-3 px-10 py-4 rounded-full",
              "bg-neutral-900 text-white font-bold text-lg shadow-xl shadow-neutral-200",
              "hover:bg-neutral-800 hover:-translate-y-1 transition-all duration-300",
              "active:scale-95 group",
            )}
          >
            {ctaText}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Features Section */}
        <div className="relative z-40 w-full grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "p-8 rounded-3xl",
                "bg-white/50 backdrop-blur-md border border-neutral-200 shadow-sm",
                "hover:border-indigo-500/30 hover:shadow-indigo-500/5 transition-all duration-500",
                "group text-center",
              )}
            >
              <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-indigo-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-neutral-500 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
