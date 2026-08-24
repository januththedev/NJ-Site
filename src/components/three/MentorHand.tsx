import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/** Stylized figure: capsule body + sphere head (+ optional graduation cap). */
function Figure({
  position,
  color,
  cap = false,
  lean = 0,
  phase = 0,
}: {
  position: [number, number, number]
  color: string
  cap?: boolean
  lean?: number
  phase?: number
}) {
  const g = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (g.current) g.current.rotation.z = lean + Math.sin(state.clock.elapsedTime * 1.3 + phase) * 0.018
  })
  return (
    <group ref={g} position={position} rotation={[0, 0, lean]}>
      <mesh position={[0, 0.34, 0]}>
        <capsuleGeometry args={[0.15, 0.36, 6, 14]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.74, 0]}>
        <sphereGeometry args={[0.145, 20, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {cap && (
        <group position={[0, 0.87, 0]}>
          <mesh>
            <boxGeometry args={[0.26, 0.025, 0.26]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.13, 0.045, 0.13]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </mesh>
          <mesh position={[0.14, -0.01, 0]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} toneMapped={false} />
          </mesh>
        </group>
      )}
    </group>
  )
}

/**
 * Helping-Hand hero: the alumni panel stands on the upper level reaching
 * down to pull a new student up — paid mentorship in one image. A soft
 * pulse marks the clasp where the hands meet.
 */
export default function MentorHand() {
  const clasp = useRef<THREE.Mesh>(null)
  const pulse = useRef<THREE.Mesh>(null)
  const light = useRef<THREE.PointLight>(null)

  const pulseMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#38e8ff', transparent: true, opacity: 0.6, toneMapped: false }),
    [],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const wp = (t * 0.7) % 1
    if (pulse.current) {
      pulse.current.visible = wp < 0.8
      pulse.current.scale.setScalar(0.3 + wp * 1.4)
      pulseMat.opacity = 0.55 * (1 - wp)
    }
    const beat = 1 + Math.sin(t * 3.2) * 0.25
    if (clasp.current) clasp.current.scale.setScalar(beat)
    if (light.current) light.current.intensity = 3 + Math.sin(t * 3.2) * 1.2
  })

  const senior = '#f5a623'
  const seniorDim = '#c98a1e'
  const junior = '#38bdf8'

  return (
    <group position={[0, -1.05, 0]} scale={1.45} rotation={[0, 0.42, 0]}>
      {/* two-level ledge */}
      <mesh position={[-0.85, 0.4, 0]}>
        <boxGeometry args={[1.7, 0.8, 1.15]} />
        <meshStandardMaterial color="#16233b" roughness={0.85} />
      </mesh>
      <mesh position={[0.95, 0.06, 0]}>
        <boxGeometry args={[1.5, 0.12, 1.15]} />
        <meshStandardMaterial color="#101a2e" roughness={0.9} />
      </mesh>
      {/* edge glow strip on the upper level */}
      <mesh position={[0.02, 0.81, 0]}>
        <boxGeometry args={[1.7, 0.015, 1.15]} />
        <meshStandardMaterial color="#38e8ff" emissive="#38e8ff" emissiveIntensity={0.7} toneMapped={false} />
      </mesh>

      {/* the panel: three old students on the upper level */}
      <Figure position={[-1.25, 0.8, -0.28]} color={seniorDim} cap phase={1.2} />
      <Figure position={[-0.62, 0.8, -0.34]} color={seniorDim} cap phase={2.6} />
      {/* the one reaching down */}
      <group position={[-0.12, 0.8, 0.08]} rotation={[0, 0, 0]}>
        <Figure position={[0, 0, 0]} color={senior} cap lean={0.34} phase={0} />
        {/* extended arm down toward the junior */}
        <mesh position={[0.34, 0.28, 0]} rotation={[0, 0, -1.05]}>
          <capsuleGeometry args={[0.045, 0.42, 4, 10]} />
          <meshStandardMaterial color={senior} roughness={0.55} />
        </mesh>
      </group>

      {/* the new student reaching up from below */}
      <group position={[0.78, 0.12, 0.1]}>
        <Figure position={[0, 0, 0]} color={junior} lean={-0.12} phase={3.4} />
        <mesh position={[-0.3, 0.52, 0]} rotation={[0, 0, 0.95]}>
          <capsuleGeometry args={[0.045, 0.4, 4, 10]} />
          <meshStandardMaterial color={junior} roughness={0.55} />
        </mesh>
      </group>

      {/* clasp glow where the hands meet */}
      <pointLight ref={light} position={[0.42, 0.78, 0.25]} color="#38e8ff" intensity={3.5} distance={2.6} />
      <mesh ref={clasp} position={[0.42, 0.78, 0.25]}>
        <sphereGeometry args={[0.05, 12, 10]} />
        <meshStandardMaterial color="#bdf6ff" emissive="#38e8ff" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      <mesh ref={pulse} position={[0.42, 0.78, 0.25]} rotation={[Math.PI / 2, 0, 0]} material={pulseMat} visible={false}>
        <torusGeometry args={[0.16, 0.012, 8, 40]} />
      </mesh>
    </group>
  )
}
