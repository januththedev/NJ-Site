import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Retro desk telephone for the Contact hero. Rings on a loop — handset
 * rattles and sound-wave rings expand outward. Hovering "answers" it:
 * the handset lifts off the cradle and the ringing stops.
 */
export default function Telephone() {
  const handset = useRef<THREE.Group>(null)
  const waves = useRef<THREE.Mesh[]>([])
  const ringClock = useRef(1.2)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const t = state.clock.elapsedTime
    ringClock.current += dt
    const PERIOD = 2.8
    const RING_LEN = 0.75
    const phase = ringClock.current % PERIOD
    const ringing = !hovered && phase < RING_LEN
    const lift = hovered ? 1 : 0

    if (handset.current) {
      const r = ringing ? 1 : 0
      handset.current.position.y = 0.66 + lift * 0.18 + r * Math.abs(Math.sin(t * 55)) * 0.022
      handset.current.position.x = r * Math.sin(t * 48) * 0.016
      handset.current.rotation.z = r * Math.sin(t * 42) * 0.05 - lift * 0.14
    }
    waves.current.forEach((w, i) => {
      if (!w) return
      const mat = w.material as THREE.MeshBasicMaterial
      const wp = (phase - 0.05 - i * 0.22) / 0.55
      if (ringing && wp > 0 && wp < 1) {
        w.visible = true
        w.scale.setScalar(0.55 + wp * 1.7)
        mat.opacity = 0.5 * (1 - wp)
      } else {
        w.visible = false
      }
    })
  })

  const dark = <meshStandardMaterial color="#22344f" roughness={0.4} metalness={0.35} />
  const darker = <meshStandardMaterial color="#16243c" roughness={0.5} metalness={0.3} />

  return (
    <group
      position={[0, -0.6, 0]}
      scale={1.75}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      rotation={[0, -0.5, 0]}
    >
      {/* body */}
      <mesh position={[0, 0.24, 0]} castShadow>
        <boxGeometry args={[0.98, 0.48, 0.68]} />
        {dark}
      </mesh>
      {/* sloped keypad deck */}
      <mesh position={[0, 0.5, 0.18]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[0.8, 0.06, 0.42]} />
        <meshStandardMaterial color="#16243c" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* keypad */}
      {Array.from({ length: 12 }).map((_, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        return (
          <mesh key={i} position={[-0.2 + col * 0.2, 0.565 - row * 0.085, 0.24 + row * 0.098]} rotation={[-0.5, 0, 0]}>
            <boxGeometry args={[0.13, 0.03, 0.075]} />
            <meshStandardMaterial color="#27405f" roughness={0.35} emissive="#38e8ff" emissiveIntensity={0.12} />
          </mesh>
        )
      })}
      {/* glowing status strip */}
      <mesh position={[0, 0.28, 0.345]}>
        <boxGeometry args={[0.7, 0.02, 0.01]} />
        <meshStandardMaterial color="#38e8ff" emissive="#38e8ff" emissiveIntensity={hovered ? 2.2 : 1.1} toneMapped={false} />
      </mesh>
      {/* cradle posts */}
      {[-0.36, 0.36].map((x) => (
        <mesh key={x} position={[x, 0.53, -0.14]}>
          <boxGeometry args={[0.1, 0.14, 0.16]} />
          {darker}
        </mesh>
      ))}

      {/* handset (rattles / lifts) */}
      <group ref={handset} position={[0, 0.66, -0.14]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.075, 0.52, 6, 12]} />
          {darker}
        </mesh>
        {[-0.34, 0.34].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <sphereGeometry args={[0.115, 20, 16]} />
            {dark}
          </mesh>
        ))}
      </group>

      {/* coiled cord: helix from the base side up toward the handset */}
      <mesh position={[0.52, 0.3, 0.05]} rotation={[0, 0, 0.15]}>
        <torusKnotGeometry args={[0.09, 0.016, 64, 8, 7, 1]} />
        <meshStandardMaterial color="#20344f" roughness={0.6} />
      </mesh>

      {/* sound-wave rings (visible while ringing) */}
      {[0, 1].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) waves.current[i] = m
          }}
          position={[0, 0.2, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          visible={false}
        >
          <torusGeometry args={[0.55, 0.014, 8, 48]} />
          <meshBasicMaterial color="#38e8ff" transparent opacity={0.5} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}
