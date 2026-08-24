import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ROWS = 5
const PER_ROW = 16 // 5 × 16 = 80 students — a small-to-medium lecture hall
const ROW_DZ = 0.52
const ROW_RISE = 0.21
const BODY_LIFT = 0.38 // seat top → body center
const HEAD_LIFT = 0.71 // seat top → head center

/**
 * Classes hero: a tiered lecture hall seating ~80 students (50–100 range),
 * built from two instanced meshes (bodies + heads) with a gentle attention
 * sway rippling through the rows, facing a glowing board. Hovering starts
 * the lesson: a quarter of the class raises their hands and the board
 * strokes flare brighter.
 */
export default function LectureHall({ active = false }: { active?: boolean }) {
  const bodies = useRef<THREE.InstancedMesh | null>(null)
  const heads = useRef<THREE.InstancedMesh | null>(null)
  const arms = useRef<THREE.InstancedMesh | null>(null)
  const board = useRef<THREE.Group>(null)
  const raise = useRef<number[]>([])

  const seats = useMemo(() => {
    const list: { x: number; baseY: number; z: number; ry: number; s: number; phase: number; color: THREE.Color }[] = []
    const palette = ['#64748b', '#38bdf8', '#fbbf24', '#a78bfa', '#cbd5e1', '#7dd3fc'].map((c) => new THREE.Color(c))
    let i = 0
    for (let row = 0; row < ROWS; row++) {
      for (let n = 0; n < PER_ROW; n++) {
        list.push({
          x: -2.05 + (n + (row % 2) * 0.5) * (4.1 / PER_ROW) + (Math.random() - 0.5) * 0.04,
          baseY: row * ROW_RISE,
          z: -row * ROW_DZ,
          ry: (Math.random() - 0.5) * 0.5,
          s: 0.9 + Math.random() * 0.2,
          phase: Math.random() * Math.PI * 2,
          color: palette[i % palette.length],
        })
        i++
      }
    }
    return list
  }, [])

  const tmp = useMemo(() => new THREE.Object3D(), [])

  // every ~4th student raises a hand when the class is in session
  const raisers = useMemo(
    () =>
      seats
        .map((st, i) => ({ st, i, side: i % 2 ? 1 : -1 }))
        .filter((_, n) => n % 4 === 1),
    [seats],
  )

  const place = (mesh: THREE.InstancedMesh | null, headLift: number, t = 0, animate = false) => {
    if (!mesh) return
    seats.forEach((st, i) => {
      const bob = animate ? Math.sin(t * 1.8 + st.phase + st.z * 2.2) * 0.014 : 0
      const turn = animate ? Math.sin(t * 0.9 + st.phase) * 0.06 : 0
      tmp.position.set(st.x, st.baseY + headLift + bob, st.z)
      tmp.rotation.set(0, st.ry + turn, 0)
      tmp.scale.setScalar(st.s)
      tmp.updateMatrix()
      mesh.setMatrixAt(i, tmp.matrix)
      if (!animate) mesh.setColorAt(i, st.color)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const t = state.clock.elapsedTime
    place(bodies.current, BODY_LIFT, t, true)
    place(heads.current, HEAD_LIFT, t, true)

    // hands shoot up one after another while hovered, then settle back down
    raisers.forEach((r, n) => {
      raise.current[n] ??= 0
      const target = active ? 1 : 0
      const rate = 4.5 + ((n * 37) % 10) * 0.35 // staggered eagerness
      raise.current[n] += (target - raise.current[n]) * Math.min(1, dt * rate)
      const p = raise.current[n]
      if (!arms.current) return
      const st = r.st
      const bob = Math.sin(t * 1.8 + st.phase + st.z * 2.2) * 0.014
      const wave = Math.sin(t * 6 + st.phase) * 0.12 * p // waving hand once up
      tmp.position.set(st.x + r.side * 0.125, st.baseY + THREE.MathUtils.lerp(BODY_LIFT - 0.02, HEAD_LIFT + 0.14, p) + bob, st.z - 0.06)
      tmp.rotation.set(0, 0, THREE.MathUtils.lerp(r.side * 1.45, -r.side * (0.08 + wave), p))
      tmp.scale.setScalar(st.s)
      tmp.updateMatrix()
      arms.current.setMatrixAt(n, tmp.matrix)
    })
    if (arms.current && raisers.length) arms.current.instanceMatrix.needsUpdate = true

    // board strokes flare while the lesson runs
    board.current?.children.forEach((m) => {
      const mat = (m as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined
      if (mat?.emissive) mat.emissiveIntensity += ((active ? 2.4 : 0.9) - mat.emissiveIntensity) * Math.min(1, dt * 5)
    })
  })

  const stepColor = <meshStandardMaterial color="#141f36" roughness={0.9} />
  const deskColor = <meshStandardMaterial color="#1d2b47" roughness={0.7} metalness={0.2} />

  return (
    <group rotation={[0, 0.3, 0]} position={[0, -0.55, 0.4]}>
      {/* tiered steps */}
      {Array.from({ length: ROWS }).map((_, row) => (
        <mesh key={row} position={[0, row * ROW_RISE + 0.1, -row * ROW_DZ]}>
          <boxGeometry args={[4.6, 0.2, 0.6]} />
          {stepColor}
        </mesh>
      ))}
      {/* long desks along each row */}
      {Array.from({ length: ROWS }).map((_, row) => (
        <mesh key={`d${row}`} position={[0, row * ROW_RISE + 0.3, -row * ROW_DZ + 0.28]}>
          <boxGeometry args={[4.3, 0.05, 0.16]} />
          {deskColor}
        </mesh>
      ))}

      {/* the students */}
      <instancedMesh
        ref={(m) => {
          bodies.current = m
          place(m, BODY_LIFT)
        }}
        args={[undefined, undefined, ROWS * PER_ROW]}
      >
        <capsuleGeometry args={[0.085, 0.17, 4, 10]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
      <instancedMesh
        ref={(m) => {
          heads.current = m
          place(m, HEAD_LIFT)
        }}
        args={[undefined, undefined, ROWS * PER_ROW]}
      >
        <sphereGeometry args={[0.072, 12, 10]} />
        <meshStandardMaterial roughness={0.55} />
      </instancedMesh>
      {/* raised hands (visible during hover) */}
      <instancedMesh
        ref={(m) => {
          arms.current = m
        }}
        args={[undefined, undefined, Math.max(raisers.length, 1)]}
      >
        <capsuleGeometry args={[0.028, 0.15, 4, 8]} />
        <meshStandardMaterial color="#d8b4a0" roughness={0.6} />
      </instancedMesh>

      {/* front board with glowing formula strokes */}
      <group ref={board} position={[0, 1.15, 0.85]}>
        <mesh>
          <boxGeometry args={[1.7, 0.75, 0.05]} />
          <meshStandardMaterial color="#0b1424" roughness={0.3} metalness={0.4} />
        </mesh>
        {[
          [-0.5, 0.18, 0.55],
          [-0.1, 0.02, 0.8],
          [-0.42, -0.14, 0.4],
          [0.3, 0.12, 0.28],
        ].map(([x, y, w], i) => (
          <mesh key={i} position={[x, y, 0.032]}>
            <boxGeometry args={[w, 0.02, 0.005]} />
            <meshStandardMaterial color="#7dd3fc" emissive="#38e8ff" emissiveIntensity={0.9} toneMapped={false} />
          </mesh>
        ))}
      </group>
      {/* lectern */}
      <mesh position={[-1.55, 0.42, 0.72]}>
        <boxGeometry args={[0.32, 0.55, 0.26]} />
        {deskColor}
      </mesh>
      {/* warm front light so faces read */}
      <pointLight position={[0, 1.9, 2.2]} intensity={9} color="#ffe7c4" distance={7} />
    </group>
  )
}
