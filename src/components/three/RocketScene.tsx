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

function Terrain() {
  const geo = useTerrainGeometry()
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors flatShading roughness={0.95} />
    </mesh>
  )
}

/* ── The Moon: cratered grey sphere for the landing finale ── */
function makeMoonGeometry() {
  const R = 3.2
  const geo = new THREE.SphereGeometry(R, 48, 36)
  const pos = geo.getAttribute('position')
  const v = new THREE.Vector3()
  const craters = Array.from({ length: 16 }, () => {
    const c = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
    return c.normalize().multiplyScalar(R)
  })
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const n = v.clone().normalize()
    let r = R * (1 + Math.sin(n.x * 7) * Math.cos(n.y * 6) * Math.sin(n.z * 8) * 0.012)
    craters.forEach((c) => {
      const ang = n.angleTo(c.clone().normalize())
      if (ang < 0.38) r -= (0.38 - ang) * 0.55 // dent
    })
    pos.setXYZ(i, n.x * r, n.y * r, n.z * r)
  }
  geo.computeVertexNormals()
  return geo
}

/* ── Particles: engine flames + launch smoke / moondust (additive points) ── */
const FLAME_COUNT = 320
const SMOKE_COUNT = 260

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

function spawnParticle(
  sys: ReturnType<typeof makeParticleSystem>,
  origin: THREE.Vector3,
  spread: number,
  upBias: number,
  hSpread = 2.2,
) {
  const i = sys.cursor
  sys.cursor = (sys.cursor + 1) % sys.count
  sys.positions[i * 3] = origin.x + (Math.random() - 0.5) * spread
  sys.positions[i * 3 + 1] = origin.y
  sys.positions[i * 3 + 2] = origin.z + (Math.random() - 0.5) * spread
  sys.vel[i * 3] = (Math.random() - 0.5) * hSpread
  sys.vel[i * 3 + 1] = -(2.5 + Math.random() * 3.5) * upBias
  sys.vel[i * 3 + 2] = (Math.random() - 0.5) * hSpread
  sys.life[i] = 1
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
  const shrinkRef = useRef({ s: 1 })
  const flyingRef = useRef(false)
  const landingRef = useRef(false) // post-ascent moon approach phase
  const moonT = useRef({ t: 0 }) // 0 hidden → 1 parked under the rocket
  const glowMat = useRef<THREE.MeshStandardMaterial | null>(null)
  const beaconMat = useRef<THREE.MeshStandardMaterial | null>(null)

  const flame = useMemo(() => makeParticleSystem(FLAME_COUNT, 0.55, 0.95), [])
  const smoke = useMemo(() => makeParticleSystem(SMOKE_COUNT, 2.6, 0.32), [])
  const flameRef = useRef<THREE.Points>(null)
  const smokeRef = useRef<THREE.Points>(null)

  const moonGeo = useMemo(makeMoonGeometry, [])
  const moonGroup = useRef<THREE.Group>(null)
  const MOON_R = 3.2
  const MOON_FINAL = { y: 37.15, z: -5 } // top surface sits just under the descended rocket

  const [isNight, setIsNight] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const [spaceMode, setSpaceMode] = useState(false) // deep-space backdrop for the finale

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
        shrinkRef.current.s = 1
        moonT.current.t = 0
        landingRef.current = false
        flyingRef.current = false
        setSpaceMode(false)
        ;(window as unknown as Record<string, unknown>).__flightActive = false
        onFlightEnd()
      },
    })

    // Phase A — ascent (page scrolls back to the top over these 5 seconds)
    tl.to(thrustRef, { current: 1, duration: 0.45 }, 0)
      .to(shakeRef, { current: 1, duration: 0.3 }, 0)
      .to(shakeRef, { current: 0.25, duration: 1.2 }, 0.8)
      .to(riseRef, { current: 40, duration: 4.6, ease: 'power2.in' }, 0.35)
      .to(thrustRef, { current: 0.65, duration: 1.4 }, 3.2)

    // Phase B — the moon finale: shrink away and land on the lunar surface
    tl.call(() => {
      landingRef.current = true
      setSpaceMode(true)
    }, [], 4.85)
      .to(moonT, { t: 1, duration: 1.5, ease: 'power2.out' }, 4.9)
      .to(shrinkRef.current, { s: 0.22, duration: 1.9, ease: 'power2.inOut' }, 5.0)
      .to(riseRef, { current: 41.0, duration: 1.9, ease: 'power1.inOut' }, 5.0) // descend onto the surface
      .call(
        () => {
          // touchdown dust burst
          const impact = new THREE.Vector3(0, riseRef.current - 0.42, 0)
          for (let i = 0; i < 90; i++) spawnParticle(smoke, impact, 2.4, -0.22, 5.5)
        },
        [],
        6.75,
      )
      .to(thrustRef, { current: 0, duration: 0.25 }, 6.75)
      .to({}, { duration: 0.75 }) // hold the landed shot
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
  const lastWall = useRef(performance.now())
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useFrame((state, dtRaw) => {
    const now = performance.now()
    // wall-clock delta (clamped) — camera damping must not crawl at low FPS
    const dtReal = Math.min(Math.max((now - lastWall.current) / 1000, 0.001), 0.25)
    lastWall.current = now
    const dt = Math.min(dtRaw, 0.05)
    const t = state.clock.elapsedTime
    const flying = flyingRef.current
    const landing = landingRef.current

    // rocket lifts off / shrinks for the finale
    if (group.current) {
      group.current.position.y = riseRef.current
      group.current.scale.setScalar(shrinkRef.current.s)
    }

    // moon slides up into the frame as the finale begins
    if (moonGroup.current) {
      const mt = moonT.current.t
      moonGroup.current.visible = landing || mt > 0.001
      if (moonGroup.current.visible) {
        const eased = mt * mt * (3 - 2 * mt)
        moonGroup.current.position.set(0, THREE.MathUtils.lerp(-60, MOON_FINAL.y, eased), MOON_FINAL.z)
      }
    }

    ;(window as unknown as Record<string, unknown>).__flight = {
      flying,
      landing,
      rise: Math.round(riseRef.current),
      thrust: Number(thrustRef.current.toFixed(2)),
      camY: Math.round(camera.position.y),
      scale: Number(shrinkRef.current.s.toFixed(2)),
      branch: flying ? (landing ? 'landing' : 'ascent') : 'scroll',
    }

    if (glowMat.current) glowMat.current.emissiveIntensity = 1.6 + Math.sin(t * 2.2) * 0.5 + thrustRef.current * 5
    if (beaconMat.current) beaconMat.current.emissiveIntensity = 1.2 + (Math.sin(t * 3.4) > 0.55 ? 2.2 : 0)

    if (flying && landing) {
      // finale framing: wide shot, shrunken rocket parked on the moon
      camTarget.set(0, 39.8 + Math.sin(t * 0.8) * 0.15, 27)
      lookTarget.set(0, 39.4, -MOON_R * 1.4)
    } else if (flying) {
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
    camera.position.lerp(camTarget, 1 - Math.exp(-dtReal * 4.5))
    camera.lookAt(lookTarget)

    // particles
    if (thrustRef.current > 0.02) {
      nozzleWorld.set((Math.random() - 0.5) * 0.16 * shrinkRef.current.s, riseRef.current - 0.42, (Math.random() - 0.5) * 0.16 * shrinkRef.current.s)
      const n = Math.ceil(thrustRef.current * 14)
      for (let i = 0; i < n; i++) spawnParticle(flame, nozzleWorld, 0.24, 1)
      if (riseRef.current < 3.2 || landing) {
        for (let i = 0; i < 4; i++) spawnParticle(smoke, nozzleWorld, 1.6, 0.28, landing ? 3.2 : 2.2)
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

  // moon slides up from below into its landing spot as moonT → 1

  return (
    <>
      {spaceMode ? (
        // Finale backdrop: deep space, whatever the system theme is
        <>
          <color attach="background" args={['#04050d']} />
          <Stars radius={110} depth={60} count={2600} factor={4.2} saturation={0} fade speed={0.4} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[-14, 18, 12]} intensity={1.6} color="#e8ecff" />
        </>
      ) : isNight ? (
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

      {!spaceMode && <Terrain />}
      <group ref={group}>
        <primitive object={scene} />
      </group>

      {/* The Moon — slides up into place during the landing finale */}
      <group ref={moonGroup} visible={false}>
        <mesh geometry={moonGeo}>
          <meshStandardMaterial color="#b7b3aa" roughness={1} flatShading />
        </mesh>
      </group>

      <points ref={flameRef} geometry={flame.geo} material={flame.mat} frustumCulled={false} />
      <points ref={smokeRef} geometry={smoke.geo} material={smoke.mat} frustumCulled={false} />
    </>
  )
}
