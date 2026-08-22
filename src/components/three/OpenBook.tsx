import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { getLenis } from '../layout/SmoothScroll'

/**
 * Open physics book with physically-motivated page turns:
 * - pages accelerate under "gravity" as they fall across the spine
 * - the sheet curls (cylindrical bend along its width) mid-flip, and the
 *   curl amplitude grows with flip speed (scroll velocity / hover)
 * - pages land with a small damped rebound onto the far stack
 */
const PAGE_SEGS = 14
const PW = 0.96 // flipping-page width (must match the builder)

export default function OpenBook({ hoverRef }: { hoverRef: React.MutableRefObject<boolean> }) {
  const { scene } = useGLTF('/models/open-book.glb')
  const group = useRef<THREE.Group>(null)

  const pages = useMemo(() => {
    const list: { pivot: THREE.Group; baseX: Float32Array; pos: THREE.BufferAttribute }[] = []
    scene.traverse((o) => {
      if (/^FlipPage\d$/.test(o.name)) {
        const mesh = (o as THREE.Group).children[0] as THREE.Mesh
        const pos = mesh.geometry.getAttribute('position') as THREE.BufferAttribute
        list.push({ pivot: o as THREE.Group, baseX: Float32Array.from(pos.array as Float32Array), pos })
      }
    })
    list.sort((a, b) => a.pivot.name.localeCompare(b.pivot.name))
    return list
  }, [scene])

  const clock = useRef(0)

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const velocity = Math.abs(getLenis()?.velocity ?? 0)

    // flip speed: gentle idle + scroll-velocity boost + hover boost
    const speed = 0.5 + Math.min(4.5, velocity * 0.085) + (hoverRef.current ? 2.4 : 0)
    clock.current += dt * speed

    const CYCLE = 1.35 // seconds of one page's fall
    const GAP = 1.05 // stagger between successive pages

    // energy in the flip → how much the sheet curls (fast flips flap harder)
    const energy = THREE.MathUtils.clamp(speed / 3.2, 0.55, 2.2)

    pages.forEach(({ pivot, baseX, pos }, i) => {
      let p = THREE.MathUtils.clamp((clock.current - i * GAP) / CYCLE, 0, 1)
      if (clock.current > pages.length * GAP + CYCLE + 1.8) clock.current = 0

      // gravity-like profile: slow lift-off, accelerating fall, tiny rebound
      let eased: number
      if (p < 0.55) {
        const q = p / 0.55
        eased = 0.18 + 0.32 * (q * q) // resisted lift against the stack
      } else if (p < 0.9) {
        const q = (p - 0.55) / 0.35
        eased = 0.5 + 0.5 * (q * q * (3 - 2 * q)) // accelerating fall
      } else {
        const q = (p - 0.9) / 0.1
        eased = 1 - Math.sin((1 - q) * Math.PI) * 0.045 // landing rebound
      }

      const START = 0.37
      const END = Math.PI - 0.37
      pivot.rotation.y = THREE.MathUtils.lerp(START, END, eased)

      // cylindrical curl: peaks mid-flight, scaled by flip energy
      const curl = Math.sin(p * Math.PI) ** 1.15 * 0.34 * energy
      for (let v = 0; v < pos.count; v++) {
        const bx = baseX[v * 3] // -PW/2 .. +PW/2 (hinge at -PW/2 edge via mesh offset)
        const frac = (bx + PW / 2) / PW // 0 at hinge → 1 at free edge
        pos.setZ(v, Math.sin(frac * Math.PI) * curl)
        // curled page shortens along its width (arc-chord effect)
        pos.setX(v, bx * (1 - 0.16 * Math.sin(frac * Math.PI) * (curl / (0.34 * 2.2))))
      }
      pos.needsUpdate = true
    })

    // gentle presentation drift
    if (group.current) {
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.04
      group.current.rotation.y +=
        (Math.sin(state.clock.elapsedTime * 0.4) * 0.12 - group.current.rotation.y) * dt * 2
    }
  })

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  )
}
