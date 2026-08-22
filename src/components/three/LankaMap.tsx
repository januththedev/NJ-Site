import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { exams } from '../../data/exams'

/**
 * Stylized 3D Sri Lanka map with exactly 27 glowing, pulsing pinpoints —
 * one per exam hall, positioned from each centre's real lat/lng.
 */
export default function LankaMap() {
  const { scene } = useGLTF('/models/sri-lanka.glb')
  const group = useRef<THREE.Group>(null)
  const pins = useRef<THREE.Mesh[]>([])

  // map local space: x=(lng-80.8)*2.6, y=(lat-7.87)*2.6 (matches the GLB builder)
  const pinPositions = useMemo(
    () =>
      exams.centres.map((c) => ({
        x: (c.lng - 80.8) * 2.6,
        y: (c.lat - 7.87) * 2.6,
        z: 0.2,
        name: c.name,
      })),
    [],
  )

  useMemo(() => void scene, [scene])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    pins.current.forEach((pin, i) => {
      if (!pin) return
      const s = 1 + Math.sin(t * 2.4 + i * 0.7) * 0.35
      pin.scale.setScalar(s)
      const mat = pin.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 1.6 + Math.sin(t * 2.4 + i * 0.7) * 1.1
    })
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.22) * 0.09
      group.current.position.y = Math.sin(t * 0.7) * 0.06 - 0.1
    }
  })

  return (
    <group ref={group} rotation={[-0.34, 0, 0]} scale={1.45}>
      <primitive object={scene} />
      {pinPositions.map((p, i) => (
        <mesh
          key={`${p.name}-${i}`}
          position={[p.x, p.y, p.z]}
          ref={(m) => {
            if (m) pins.current[i] = m as THREE.Mesh
          }}
        >
          <sphereGeometry args={[0.055, 12, 10]} />
          <meshStandardMaterial color="#7df3ff" emissive="#38e8ff" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}
