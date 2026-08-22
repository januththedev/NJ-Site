import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const RAY_NAMES = Array.from({ length: 7 }, (_, i) => `Ray${i}`)

/**
 * Concept 2 — Optics & Spectrum Prism.
 * Slow orbit, cursor tilt, and a shimmering spectrum that travels along
 * the seven emissive rays. `speed` scales the whole scene (mini variants).
 */
export default function PrismScene({ speed = 1, ...props }: React.ComponentProps<'group'> & { speed?: number }) {
  const { scene } = useGLTF('/models/prism.glb')
  const group = useRef<THREE.Group>(null)
  const rayMats = useRef<THREE.MeshStandardMaterial[]>([])
  const beamMat = useRef<THREE.MeshStandardMaterial | null>(null)

  useMemo(() => {
    rayMats.current = []
    scene.traverse((obj) => {
      if (RAY_NAMES.includes(obj.name)) {
        rayMats.current.push((obj as THREE.Mesh).material as THREE.MeshStandardMaterial)
      }
      if (obj.name === 'WhiteBeam') beamMat.current = (obj as THREE.Mesh).material as THREE.MeshStandardMaterial
    })
    return scene
  }, [scene])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const g = group.current
    if (!g) return

    g.rotation.y += dt * 0.12 * speed
    g.rotation.x += (state.pointer.y * 0.1 - g.rotation.x) * Math.min(1, dt * 2)

    // spectrum shimmer: brightness wave travelling through the rays
    rayMats.current.forEach((mat, i) => {
      mat.emissiveIntensity = 2.2 + Math.sin(t * 2.4 - i * 0.55) * 0.9
    })
    if (beamMat.current) {
      beamMat.current.emissiveIntensity = 3 + Math.sin(t * 5.2) * 0.4
    }
  })

  return (
    <group ref={group} scale={speed > 0.6 ? 1 : 0.8} {...props}>
      <primitive object={scene} />
    </group>
  )
}
