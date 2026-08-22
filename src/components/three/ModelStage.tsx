import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'

interface Props {
  children: React.ReactNode
  className?: string
  cameraPosition?: [number, number, number]
  fov?: number
  ariaLabel?: string
}

/**
 * Shared R3F stage: clamped DPR, Suspense boundary, and a frameloop that
 * pauses entirely when the canvas scrolls out of view.
 */
export default function ModelStage({ children, className = '', cameraPosition = [0, 1.2, 6], fov = 42, ariaLabel }: Props) {
  const holder = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = holder.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '80px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={holder}
      className={`h-full w-full ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      <Canvas
        dpr={[1, 1.75]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: cameraPosition, fov }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  )
}
