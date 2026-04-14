import { useEffect } from "react"
import { motion } from "framer-motion"
// The fix: Add the 'type' keyword here
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  id: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  onNavigate: (id: string) => void
  activePage: string
  className?: string
}

export function NavBar({ items, onNavigate, activePage, className }: NavBarProps) {
  useEffect(() => {
    // Force simple resize check if needed
  }, [])

  return (
    <div
      className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 z-[100]",
        className,
      )}
    >
      <div className="flex items-center gap-2 bg-neutral-900/80 border border-white/10 backdrop-blur-xl py-1.5 px-2 rounded-full shadow-2xl">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "relative cursor-pointer text-sm font-medium px-5 py-2 rounded-full transition-all duration-300",
                "text-neutral-400 hover:text-white",
                isActive && "text-white",
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Icon size={16} strokeWidth={2.5} className={cn("transition-transform duration-300", isActive && "scale-110")} />
                <span className="hidden md:inline">{item.name}</span>
              </span>

              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-white/5 rounded-full z-0"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#00AAFF] rounded-t-full">
                    <div className="absolute w-12 h-6 bg-[#00AAFF]/40 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-[#00AAFF]/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-[#00AAFF]/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}