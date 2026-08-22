import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { getLenis } from '../layout/SmoothScroll'

/**
 * Open physics book whose pages flip continuously. Flip speed reacts to
 * scroll velocity (Lenis) and mouse hover over the card.
 */
export default function OpenBook({ hoverRef }: { hoverRef: React.MutableRefObject<boolean> }) {
  const { scene } = useGLTF('/models/open-book.glb')
  const pages = useRef<THREE.Group[]>([])
  const clockRef = useRef(0)
  const group = useRef<THREE.Group>(null)

  useMemo(() => {
    pages.current = []
    scene.traverse((o) => {
      if (/^FlipPage\d$/.test(o.name)) pages.current.push(o as THREE.Group)
    })
    pages.current.sort((a, b) => a.name.localeCompare(b.name))
    return scene
  }, [scene])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const velocity = Math.abs(getLenis()?.velocity ?? 0)
    const speed = 0.55 + Math.min(5, velocity * 0.09) + (hoverRef.current ? 2.6 : 0)
    clockRef.current += dt * speed

    const CYCLE = 2.2 // seconds one page takes
    const GAP = 1.1 // stagger between page starts
    pages.current.forEach((pivot, i) => {
      const phase = THREE.MathUtils.clamp((clockRef.current - i * GAP) / CYCLE, 0, 1)
      const eased = phase < 1 ? phase * phase * (3 - 2 * phase) : 1
      pivot.rotation.y = THREE.MathUtils.lerp(0.35, Math.PI - 0.35, eased)
    })
    if (clockRef.current > pages.current.length * GAP + CYCLE + 1.6) clockRef.current = 0

    if (group.current) {
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05
      group.current.rotation.y += (Math.sin(state.clock.elapsedTime * 0.4) * 0.12 - group.current.rotation.y) * dt * 2
    }
  })

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  )
}
