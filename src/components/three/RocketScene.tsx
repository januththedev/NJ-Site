import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { gsap, ScrollTrigger } from '../../hooks/useGsapContext'

/* ── Terrain: low-poly rolling landscape, flat around the launchpad ── */
function useTerrainGeometry() {
  return useMemo(() => {
    const geo = new THREE.CircleGeometry(90, 120)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.getAttribute('position')
    const colors = new Float32Array(pos.count * 3)
    const cGrass = new THREE.Color('#2e4a33')
    const cDry = new THREE.Color('#4a4433')
    const cRock = new THREE.Color('#57503f')
    const tmp = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const d = Math.hypot(x, z)
      const falloff = THREE.MathUtils.smoothstep(d, 9, 34)
      const h =
        (Math.sin(x * 0.14) * Math.cos(z * 0.11) * 1.6 +
          Math.sin(x * 0.05 + 1.7) * Math.cos(z * 0.07) * 2.6) *
        falloff
      pos.setY(i, h)
      tmp.copy(cGrass).lerp(cDry, THREE.MathUtils.clamp(h * 0.22 + 0.25, 0, 1))
      if (h > 2.6) tmp.lerp(cRock, Math.min(1, (h - 2.6) * 0.35))
      colors.set([tmp.r, tmp.g, tmp.b], i * 3)
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [])
}

/* ── Particles: engine flames + launch smoke (additive points) ── */
const FLAME_COUNT = 320
const SMOKE_COUNT = 220

function makeParticleSystem(count: number, size: number, opacity: number) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const life = new Float32Array(count)
  const vel = new Float32Array(count * 3)
  positions.fill(9999)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const mat = new THREE.PointsMaterial({
    size,
    vertexColors: true,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  })
  return { geo, mat, positions, colors, life, vel, count, cursor: 0 }
}

function spawnParticle(sys: ReturnType<typeof makeParticleSystem>, origin: THREE.Vector3, spread: number, upBias: number) {
  const i = sys.cursor
  sys.cursor = (sys.cursor + 1) % sys.count
  sys.positions[i * 3] = origin.x + (Math.random() - 0.5) * spread
  sys.positions[i * 3 + 1] = origin.y
  sys.positions[i * 3 + 2] = origin.z + (Math.random() - 0.5) * spread
  sys.vel[i * 3] = (Math.random() - 0.5) * 2.2
  sys.vel[i * 3 + 1] = -(2.5 + Math.random() * 3.5) * upBias
  sys.vel[i * 3 + 2] = (Math.random() - 0.5) * 2.2
  sys.life[i] = 1
}

function Terrain() {
  const geo = useTerrainGeometry()
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors flatShading roughness={0.95} />
    </mesh>
  )
}

/* ── The full rocket journey scene ── */
export default function RocketScene({ onFlightEnd }: { onFlightEnd: () => void }) {
  const { scene } = useGLTF('/models/rocket.glb')
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera

  const group = useRef<THREE.Group>(null)
  const progressRef = useRef(0)
  const thrustRef = useRef(0)
  const riseRef = useRef(0)
  const shakeRef = useRef(0)
  const flyingRef = useRef(false)
  const glowMat = useRef<THREE.MeshStandardMaterial | null>(null)
  const beaconMat = useRef<THREE.MeshStandardMaterial | null>(null)

  const flame = useMemo(() => makeParticleSystem(FLAME_COUNT, 0.55, 0.95), [])
  const smoke = useMemo(() => makeParticleSystem(SMOKE_COUNT, 2.6, 0.32), [])
  const flameRef = useRef<THREE.Points>(null)
  const smokeRef = useRef<THREE.Points>(null)

  const [isNight, setIsNight] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const fn = () => setIsNight(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  // collect named parts from the GLB
  useMemo(() => {
    scene.traverse((o) => {
      if (o.name === 'EngineGlow') glowMat.current = (o as THREE.Mesh).material as THREE.MeshStandardMaterial
      const tower = o.name === 'Tower' && (o as THREE.Group).children
      if (tower) {
        const beacon = tower[tower.length - 1] as THREE.Mesh
        if (beacon?.material) beaconMat.current = beacon.material as THREE.MeshStandardMaterial
      }
    })
    return scene
  }, [scene])

  // camera rig bound to document scroll
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      progressRef.current = 0.85
      return
    }
    const st = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => (progressRef.current = self.progress),
    })
    return () => st.kill()
  }, [])

  // imperative blast-off — invoked via window.__startFlight from RocketCanvas
  const startFlight = () => {
    if (flyingRef.current) return
    flyingRef.current = true
    const tl = gsap.timeline({
      onComplete: () => {
        riseRef.current = 0
        thrustRef.current = 0
        shakeRef.current = 0
        flyingRef.current = false
        ;(window as unknown as Record<string, unknown>).__flightActive = false
        onFlightEnd()
      },
    })
    tl.to(thrustRef, { current: 1, duration: 0.45 }, 0)
      .to(shakeRef, { current: 1, duration: 0.3 }, 0)
      .to(shakeRef, { current: 0.25, duration: 1.2 }, 0.8)
      .to(riseRef, { current: 40, duration: 4.6, ease: 'power2.in' }, 0.35)
      .to(thrustRef, { current: 0.65, duration: 1.4 }, 3.2)
  }

  useEffect(() => {
    ;(window as unknown as Record<string, unknown>).__startFlight = startFlight
    return () => {
      delete (window as unknown as Record<string, unknown>).__startFlight
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const camTarget = useMemo(() => new THREE.Vector3(), [])
  const lookTarget = useMemo(() => new THREE.Vector3(), [])
  const nozzleWorld = useMemo(() => new THREE.Vector3(), [])
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const t = state.clock.elapsedTime
    const flying = flyingRef.current

    // the rocket lifts off while the camera tracks it
    if (group.current) group.current.position.y = riseRef.current
    ;(window as unknown as Record<string, unknown>).__flight = {
      flying,
      rise: Math.round(riseRef.current),
      thrust: Number(thrustRef.current.toFixed(2)),
      camY: Math.round(camera.position.y),
    }

    if (glowMat.current) glowMat.current.emissiveIntensity = 1.6 + Math.sin(t * 2.2) * 0.5 + thrustRef.current * 5
    if (beaconMat.current) beaconMat.current.emissiveIntensity = 1.2 + (Math.sin(t * 3.4) > 0.55 ? 2.2 : 0)

    if (flying) {
      camTarget.set(
        Math.sin(t * 30) * 0.12 * shakeRef.current,
        riseRef.current + 2.6 + Math.sin(t * 26) * 0.08 * shakeRef.current,
        11.5,
      )
      lookTarget.set(0, riseRef.current + 2.4, 0)
    } else {
      const p = reduced ? 0.85 : progressRef.current
      const c = THREE.MathUtils.smoothstep(p, 0.62, 1)
      const e = p * p * (3 - 2 * p)
      camTarget.set(
        THREE.MathUtils.lerp(-8.5, 0, c),
        THREE.MathUtils.lerp(2.2, 3.2, c) + Math.sin(p * Math.PI) * 1.2,
        THREE.MathUtils.lerp(23, 24, e),
      )
      lookTarget.set(THREE.MathUtils.lerp(-5.4, 0, c), THREE.MathUtils.lerp(-0.4, 3.4, c), 0)
    }
    camera.position.lerp(camTarget, 1 - Math.exp(-dt * 4.5))
    camera.lookAt(lookTarget)

    // particles
    if (thrustRef.current > 0.02) {
      nozzleWorld.set((Math.random() - 0.5) * 0.16, riseRef.current - 0.42, (Math.random() - 0.5) * 0.16)
      const n = Math.ceil(thrustRef.current * 14)
      for (let i = 0; i < n; i++) spawnParticle(flame, nozzleWorld, 0.24, 1)
      if (riseRef.current < 3.2) {
        for (let i = 0; i < 4; i++) spawnParticle(smoke, nozzleWorld, 1.6, 0.28)
      }
    }
    const fadeColor = new THREE.Color()
    const step = (sys: typeof flame, decay: number, smokeMode: boolean) => {
      for (let i = 0; i < sys.count; i++) {
        if (sys.life[i] <= 0) continue
        sys.life[i] -= dt * decay
        sys.positions[i * 3] += sys.vel[i * 3] * dt
        sys.positions[i * 3 + 1] += sys.vel[i * 3 + 1] * dt * (smokeMode ? 0.4 : 1)
        sys.positions[i * 3 + 2] += sys.vel[i * 3 + 2] * dt
        const l = Math.max(sys.life[i], 0)
        if (smokeMode) fadeColor.setRGB(0.5, 0.52, 0.58).multiplyScalar(l * 0.55)
        else fadeColor.setRGB(1, 0.55 + l * 0.45, 0.15 + l * 0.6).multiplyScalar(l * l)
        sys.colors.set([fadeColor.r, fadeColor.g, fadeColor.b], i * 3)
        if (sys.life[i] <= 0) sys.positions[i * 3 + 1] = 9999
      }
    }
    step(flame, 2.4, false)
    step(smoke, 0.55, true)
    if (flameRef.current) {
      flameRef.current.geometry.attributes.position.needsUpdate = true
      flameRef.current.geometry.attributes.color.needsUpdate = true
    }
    if (smokeRef.current) {
      smokeRef.current.geometry.attributes.position.needsUpdate = true
      smokeRef.current.geometry.attributes.color.needsUpdate = true
    }
  })

  return (
    <>
      {isNight ? (
        <>
          <Stars radius={110} depth={60} count={2600} factor={4.2} saturation={0} fade speed={0.6} />
          <ambientLight intensity={0.32} />
          <directionalLight position={[-18, 22, 10]} intensity={0.85} color="#9db8ff" />
          <pointLight position={[6, 4, 8]} intensity={40} color="#38e8ff" distance={40} />
        </>
      ) : (
        // Daylight: bright warm sun on the landscape — canvas stays transparent
        // above the horizon so the textured-dark page still reads through.
        <>
          <hemisphereLight args={['#eaf4ff', '#7c8a63', 1.35]} />
          <directionalLight position={[16, 26, 12]} intensity={2.6} color="#fff3dd" />
          <directionalLight position={[-10, 8, -14]} intensity={0.7} color="#bcd7ff" />
        </>
      )}

      <Terrain />
      <group ref={group}>
        <primitive object={scene} />
      </group>

      <points ref={flameRef} geometry={flame.geo} material={flame.mat} frustumCulled={false} />
      <points ref={smokeRef} geometry={smoke.geo} material={smoke.mat} frustumCulled={false} />
    </>
  )
}
