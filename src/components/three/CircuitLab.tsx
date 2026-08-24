import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Interactive Circuit Lab — the Helping-Hand practicals scene.
 * A green metallic board floats over a faint grid; resistors (colour-banded),
 * a capacitor, a copper coil and a switch are wired to a central LED by
 * silver traces. Cyan energy pulses ride the traces toward the LED, which
 * flickers warm as each pulse arrives. The switch periodically flips open —
 * the pulses die and the LED dims to an ember until it closes again.
 */
const LED_POS = new THREE.Vector3(0, 0.55, 0.12)

function makeCurve(from: THREE.Vector3) {
  const mid = from.clone().lerp(LED_POS, 0.5)
  mid.y += 0.18 + Math.abs(from.x) * 0.05
  return new THREE.CatmullRomCurve3([from.clone().add(new THREE.Vector3(0, 0.06, 0)), mid, LED_POS.clone()], false, 'catmullrom', 0.6)
}

export default function CircuitLab() {
  const pulses = useRef<THREE.Mesh[]>([])
  const ledMat = useRef<THREE.MeshStandardMaterial>(null)
  const ledLight = useRef<THREE.PointLight>(null)
  const lever = useRef<THREE.Group>(null)
  const grid = useRef<THREE.GridHelper>(null)
  const boost = useRef(0)
  const lastU = useRef<number[]>([])
  const switchClosed = useRef(1)

  // component anchor points on the board
  const anchors = useMemo(
    () => [
      new THREE.Vector3(-1.15, 0.05, 0.38), // resistor 1
      new THREE.Vector3(-0.55, 0.05, -0.42), // resistor 2
      new THREE.Vector3(1.05, 0.05, -0.46), // capacitor
      new THREE.Vector3(1.12, 0.05, 0.52), // coil
      new THREE.Vector3(-0.3, 0.05, -0.78), // switch
    ],
    [],
  )

  const curves = useMemo(() => anchors.map(makeCurve), [anchors])
  const traceGeos = useMemo(() => curves.map((c) => new THREE.TubeGeometry(c, 40, 0.018, 8, false)), [curves])

  useEffect(() => {
    if (!grid.current) return
    const mat = grid.current.material as THREE.Material
    mat.transparent = true
    mat.opacity = 0.22
  }, [])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const t = state.clock.elapsedTime

    // the switch breathes: closed 5 s, open 2 s, on a 7 s loop
    const phase = t % 7
    const target = phase < 5 ? 1 : 0
    switchClosed.current += (target - switchClosed.current) * Math.min(1, dt * 6)
    const closed = switchClosed.current
    if (lever.current) lever.current.rotation.z = THREE.MathUtils.lerp(-0.55, 0.45, closed)

    // energy pulses ride each trace toward the LED
    pulses.current.forEach((p, i) => {
      if (!p) return
      const u = (t * 0.22 + i * 0.21) % 1
      curves[i].getPoint(u, p.position)
      p.visible = closed > 0.25 && u < 0.985
      ;(p.material as THREE.MeshBasicMaterial).opacity = closed * 0.95
      if (u < (lastU.current[i] ?? 0)) {
        // wrapped around = arrived at the LED
        boost.current = Math.min(1.6, boost.current + 0.55)
      }
      lastU.current[i] = u
    })

    // LED flicker: soft warm idle + bright kick when a pulse lands;
    // dims to an ember while the switch is open
    boost.current *= Math.exp(-dt * 2.6)
    const flicker = 0.85 + Math.sin(t * 27) * 0.08 + Math.sin(t * 61) * 0.05
    const base = 0.35 + closed * 1.05
    const inten = (base + boost.current) * flicker
    if (ledMat.current) {
      ledMat.current.emissiveIntensity = inten
      ledMat.current.color.setHSL(0.09, 0.9, THREE.MathUtils.lerp(0.42, 0.62, Math.min(1, inten / 2)))
    }
    if (ledLight.current) ledLight.current.intensity = inten * 2.4
  })

  const band = (color: string) => <meshStandardMaterial color={color} roughness={0.5} />

  return (
    <group rotation={[0.32, 0, 0]}>
      {/* faint engineering grid backdrop */}
      <gridHelper ref={grid} args={[9, 18, '#1e3a5f', '#14243c']} position={[0, -0.2, -1.35]} />

      {/* the board */}
      <mesh>
        <boxGeometry args={[3.3, 0.09, 2.05]} />
        <meshStandardMaterial color="#14532d" roughness={0.35} metalness={0.55} />
      </mesh>
      {/* corner standoffs — it floats */}
      {[
        [-1.5, -0.75],
        [1.5, -0.75],
        [-1.5, 0.75],
        [1.5, 0.75],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.14, z]}>
          <cylinderGeometry args={[0.045, 0.045, 0.14, 10]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.9} />
        </mesh>
      ))}

      {/* silver traces */}
      {traceGeos.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#b8c4d4" roughness={0.25} metalness={0.95} />
        </mesh>
      ))}

      {/* central LED on its pedestal */}
      <mesh position={[LED_POS.x, 0.09, LED_POS.z]}>
        <cylinderGeometry args={[0.11, 0.13, 0.18, 14]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>
      <mesh position={LED_POS}>
        <sphereGeometry args={[0.105, 20, 16]} />
        <meshStandardMaterial ref={ledMat} color="#ffd9a0" emissive="#ffb066" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <pointLight ref={ledLight} position={[LED_POS.x, LED_POS.y + 0.25, LED_POS.z]} color="#ffb066" intensity={3} distance={3.5} />

      {/* resistor: beige body with standard colour bands */}
      {[
        [-1.15, 0.38],
        [-0.55, -0.42],
      ].map(([x, z], ri) => (
        <group key={ri} position={[x, 0.17, z]} rotation={[0, ri ? -0.6 : 0.5, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.05, 0.16, 4, 12]} />
            {band('#d6c9a8')}
          </mesh>
          {[
            ['#78350f', -0.075],
            ['#0a0a0a', -0.035],
            ['#dc2626', 0.005],
            ['#eab308', 0.055],
          ].map(([c, ox], bi) => (
            <mesh key={bi} rotation={[0, 0, Math.PI / 2]} position={[ox as number, 0, 0]}>
              <cylinderGeometry args={[0.052, 0.052, 0.02, 14]} />
              {band(c as string)}
            </mesh>
          ))}
          {[0.115, -0.115].map((lx) => (
            <mesh key={lx} position={[lx, -0.09, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.12, 6]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {/* electrolytic capacitor with marking stripe */}
      <group position={[1.05, 0.19, -0.46]}>
        <mesh>
          <cylinderGeometry args={[0.075, 0.075, 0.22, 16]} />
          {band('#1e3a8a')}
        </mesh>
        <mesh position={[0.03, 0, 0]}>
          <cylinderGeometry args={[0.077, 0.077, 0.05, 16]} />
          {band('#dbeafe')}
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.03, 10]} />
          {band('#94a3b8')}
        </mesh>
        <mesh position={[0, -0.13, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.1, 6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>

      {/* copper coil inductor */}
      <group position={[1.12, 0.14, 0.52]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, -0.06 + i * 0.055, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.065, 0.018, 8, 20]} />
            {band('#b45309')}
          </mesh>
        ))}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.3, 10]} />
          {band('#334155')}
        </mesh>
      </group>

      {/* the switch — lever flips open and closed */}
      <group position={[-0.3, 0.05, -0.78]}>
        <mesh>
          <boxGeometry args={[0.2, 0.05, 0.12]} />
          {band('#0f172a')}
        </mesh>
        <group ref={lever} position={[-0.07, 0.03, 0]}>
          <mesh position={[0.09, 0.05, 0]} rotation={[0, 0, 0.15]}>
            <boxGeometry args={[0.2, 0.025, 0.04]} />
            {band('#e2e8f0')}
          </mesh>
          <mesh position={[0.185, 0.075, 0]}>
            <sphereGeometry args={[0.028, 10, 8]} />
            {band('#38bdf8')}
          </mesh>
        </group>
      </group>

      {/* energy pulses */}
      {curves.map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) pulses.current[i] = m
          }}
          visible={false}
        >
          <sphereGeometry args={[0.045, 10, 8]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.95} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}
