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
const SMOKE_COUNT = 260

let puffTexture: THREE.Texture | null = null
function getPuffTexture() {
  if (!puffTexture) {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const ctx = c.getContext('2d')!
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.55, 'rgba(255,255,255,0.45)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)
    puffTexture = new THREE.CanvasTexture(c)
  }
  return puffTexture
}

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
    map: getPuffTexture(),
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

/* ── Realistic exhaust plume (shader) ──
 * Layered per real rocket physics: white-hot core at the nozzle, periodic
 * shock-diamond hotspots after the zone of silence, orange → deep-red
 * turbulent tail that dissipates downstream. Diamonds only exist in an
 * atmosphere — uDiamonds fades them out for vacuum burns. */
const flameVert = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  void main() {
    vUv = uv;
    vec3 p = position;
    float a = 1.0 - uv.y; // 0 at nozzle → 1 at tail
    float sway = sin(uTime * 21.0 + uv.x * 18.0) * 0.5 + cos(uTime * 16.0 + uv.x * 13.0) * 0.5;
    p.x += sway * 0.05 * a * a;
    p.z += cos(uTime * 17.0 + uv.x * 15.0) * 0.04 * a * a;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`
const flameFrag = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uThrust;
  uniform float uDiamonds;
  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  float noise1(float x) { float i = floor(x), f = fract(x); return mix(hash(i), hash(i + 1.0), f * f * (3.0 - 2.0 * f)); }
  void main() {
    float a = clamp(1.0 - vUv.y, 0.0, 1.0);          // 0 nozzle → 1 tail
    float flick = 0.8 + 0.45 * noise1(a * 7.0 - uTime * 13.0);
    // shock diamonds: periodic hotspots after the zone of silence
    float dia = pow(abs(sin(max(a - 0.10, 0.0) * 24.0)), 8.0) * exp(-a * 5.0) * uDiamonds;
    vec3 col = mix(vec3(1.0), vec3(0.72, 0.88, 1.0), smoothstep(0.02, 0.22, a));
    col = mix(col, vec3(1.0, 0.58, 0.18), smoothstep(0.18, 0.55, a));
    col = mix(col, vec3(0.85, 0.22, 0.06), smoothstep(0.60, 0.95, a));
    float inten = exp(-a * 2.6) * 0.85 + dia * 1.9;
    float edgeFade = smoothstep(1.0, 0.55, a);
    gl_FragColor = vec4(col * inten * flick * uThrust, edgeFade * uThrust * 0.85);
  }
`

/* ── The full rocket journey scene ── */
export default function RocketScene({
  onFlightEnd,
  onFinaleFade,
  screenRef,
}: {
  onFlightEnd: () => void
  onFinaleFade: () => void
  screenRef: React.MutableRefObject<{ x: number; y: number; visible: boolean }>
}) {
  const { scene } = useGLTF('/models/rocket.glb')
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera

  // Portrait viewports see the same world height (fixed vertical FOV) in a
  // much narrower frame — chase distance and finale layout adapt to it.
  const portrait = typeof window !== 'undefined' && window.innerHeight > window.innerWidth

  const group = useRef<THREE.Group>(null)
  const rocketInner = useRef<THREE.Group | null>(null) // ONLY the rocket moves — pad & tower stay on Earth
  const progressRef = useRef(0)
  const thrustRef = useRef(0)
  const riseRef = useRef(0)
  const shakeRef = useRef(0)
  const shrinkRef = useRef({ s: 1 })
  const flyingRef = useRef(false)
  const landingRef = useRef(false) // post-ascent moon approach phase
  const moonT = useRef({ t: 0 }) // 0 hidden → 1 parked under the rocket
  const tiltRef = useRef(0) // bank into the approach, upright again by touchdown
  const approachP = useRef({ p: 0 }) // bézier parameter for the curved descent
  const approachCP = useRef<{ S: THREE.Vector3; C: THREE.Vector3 } | null>(null)
  const moonSquash = useRef({ k: 0 }) // volume squash on the moon at touchdown
  const baseRotZ = useRef(0) // GLB's own resting z-rotation, tilt is added on top
  const glowMat = useRef<THREE.MeshStandardMaterial | null>(null)
  const beaconMat = useRef<THREE.MeshStandardMaterial | null>(null)

  // Finale layout: a SMALL moon parked in the top-right of the viewport with
  // the page still visible behind it — the rocket shrinks and lands on it.
  // Offsets are tuned against the frozen chase-camera pose (0, ~42.6, D)
  // looking level, so the moon projects to roughly 12% of screen height.
  const CHASE_D = portrait ? 21 : 16.5
  // Projected against the frozen chase pose so the moon sits in the empty
  // top-right corner at ~13% of screen height. On phones it is smaller and
  // shifted right so its left edge stays clear of the hero badge text, and
  // higher so it clears the "Best Physics" headline below.
  const MOON_SCALE = portrait ? 0.65 : 1
  const MOON_FINAL = { x: portrait ? 9.5 : 22.5, y: portrait ? 61.5 : 55.5, z: -44 }
  // where the rocket touches down (moon top surface ≈ center + R·scale·1.02)
  const LAND = { x: MOON_FINAL.x, y: MOON_FINAL.y + 3.27 * MOON_SCALE, z: MOON_FINAL.z }
  // phones shrink the rocket a touch more so its nose stays below the navbar
  const LAND_SHRINK = portrait ? 0.28 : 0.34
  // bank angle into the approach — shallower on phones, the narrow portrait
  // FOV otherwise swings the nose off-screen mid-transit
  const TILT_AMP = portrait ? 0.22 : 0.38

  const plumeGeo = useMemo(() => new THREE.CylinderGeometry(0.075, 0.30, 1.7, 20, 24, true), [])
  const plumeMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: flameVert,
        fragmentShader: flameFrag,
        uniforms: {
          uTime: { value: 0 },
          uThrust: { value: 0 },
          uDiamonds: { value: 1 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  )
  const diamondsRef = useRef(1)

  const smoke = useMemo(() => makeParticleSystem(SMOKE_COUNT, 1.35, 0.5), [])
  const smokeRef = useRef<THREE.Points>(null)

  const moonGeo = useMemo(makeMoonGeometry, [])
  const moonGroup = useRef<THREE.Group>(null)

  const [isNight, setIsNight] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  // The page itself is the backdrop during the whole flight — stars would
  // paint over the scrolling content, so they take a break while airborne.
  const [hideStars, setHideStars] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const fn = () => setIsNight(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  // collect named parts from the GLB; hang the exhaust plume off the rocket
  useMemo(() => {
    scene.traverse((o) => {
      if (o.name === 'EngineGlow') glowMat.current = (o as THREE.Mesh).material as THREE.MeshStandardMaterial
      if (o.name === 'Rocket') {
        rocketInner.current = o as THREE.Group
        baseRotZ.current = (o as THREE.Group).rotation.z
        const plume = new THREE.Mesh(plumeGeo, plumeMat)
        plume.position.y = -0.48 // just below the nozzle bell
        ;(o as THREE.Group).add(plume)
      }
      const tower = o.name === 'Tower' && (o as THREE.Group).children
      if (tower) {
        const beacon = tower[tower.length - 1] as THREE.Mesh
        if (beacon?.material) beaconMat.current = beacon.material as THREE.MeshStandardMaterial
      }
    })
    return scene
  }, [scene, plumeGeo, plumeMat])

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
    if (flyingRef.current || !rocketInner.current) return
    flyingRef.current = true
    const tl = gsap.timeline({
      onComplete: () => {
        riseRef.current = 0
        thrustRef.current = 0
        shakeRef.current = 0
        shrinkRef.current.s = 1
        moonT.current.t = 0
        tiltRef.current = 0
        approachP.current.p = 0
        approachCP.current = null
        moonSquash.current.k = 0
        landingRef.current = false
        flyingRef.current = false
        setHideStars(false)
        rocketInner.current!.position.set(0, 0, 0)
        ;(window as unknown as Record<string, unknown>).__flightActive = false
        onFlightEnd()
      },
    })

    // Phase A — ascent (page scrolls back to the top over these 5 seconds)
    tl.call(() => setHideStars(true), [], 0)
      .to(thrustRef, { current: 1, duration: 0.45 }, 0)
      .to(shakeRef, { current: 1, duration: 0.3 }, 0)
      .to(shakeRef, { current: 0.25, duration: 1.2 }, 0.8)
      .to(riseRef, { current: 40, duration: 4.6, ease: 'power2.in' }, 0.35)
      .to(thrustRef, { current: 0.65, duration: 1.4 }, 3.2)
      // destination moon eases into its corner spot right as we lift off
      .to(moonT.current, { t: 1, duration: 2.2, ease: 'power2.out' }, 0.4)

    // Phase B — the finale, flown like a real tail-sitter landing: bank into
    // a curved approach, brighten the retro-burn, come upright, then settle
    // onto the small corner moon while the page stays visible behind it.
    tl.call(() => {
      landingRef.current = true
      // capture the approach bézier once: S = where ascent left us, C pulls
      // the path into a gentle arc that eases down onto the moon top
      const S = rocketInner.current!.position.clone()
      const C = new THREE.Vector3(
        (S.x + LAND.x) / 2,
        LAND.y + (portrait ? -2 : 3),
        (S.z + LAND.z) / 2 + (portrait ? -1 : -3),
      )
      approachCP.current = { S, C }
    }, [], 5.0)
      .to(shrinkRef.current, { s: LAND_SHRINK, duration: 1.75, ease: 'power2.inOut' }, 5.0)
      .to(tiltRef, { current: 1, duration: 0.5, ease: 'power2.out' }, 5.0) // bank toward the moon…
      .to(tiltRef, { current: 0, duration: 0.75, ease: 'power2.inOut' }, 5.9) // …upright before touchdown
      .to(thrustRef, { current: 0.95, duration: 0.9 }, 5.1) // retro-burn flares for the descent
      .to(
        approachP.current,
        {
          p: 1,
          duration: 1.75,
          ease: 'power2.out', // fast handoff from the ascent, easing to a soft arrival
          onUpdate: () => {
            const cp = approachCP.current
            if (!cp || !rocketInner.current) return
            const p = Math.min(Math.max(approachP.current.p, 0), 1)
            const u = 1 - p
            rocketInner.current.position.set(
              u * u * cp.S.x + 2 * u * p * cp.C.x + p * p * LAND.x,
              u * u * cp.S.y + 2 * u * p * cp.C.y + p * p * LAND.y,
              u * u * cp.S.z + 2 * u * p * cp.C.z + p * p * LAND.z,
            )
          },
        },
        5.02,
      )
      .call(
        () => {
          // touchdown: vacuum ejecta radiates ALONG the surface (no air to
          // billow it), engine cuts, moon squashes and springs back
          const impact = new THREE.Vector3(LAND.x, LAND.y - 0.42 * shrinkRef.current.s, LAND.z)
          for (let i = 0; i < 110; i++) spawnParticle(smoke, impact, 3.0, -0.13, 7)
        },
        [],
        6.77,
      )
      .to(thrustRef, { current: 0, duration: 0.22 }, 6.77)
      .to(shakeRef, { current: 0, duration: 0.3 }, 6.77)
      // suspension settle: compress on contact, then spring to rest
      .to(rocketInner.current!.position, { y: LAND.y - 0.45 * MOON_SCALE, duration: 0.11, ease: 'power1.in' }, 6.78)
      .to(rocketInner.current!.position, { y: LAND.y, duration: 0.55, ease: 'elastic.out(1.1, 0.33)' }, 6.89)
      .to(moonSquash.current, { k: 0.07, duration: 0.1, ease: 'power2.out' }, 6.78)
      .to(moonSquash.current, { k: 0, duration: 0.7, ease: 'elastic.out(1.4, 0.35)' }, 6.9)
      .call(() => onFinaleFade(), [], 7.4) // fade the canvas out while parked
      .to({}, { duration: 1.4 }) // hold through the fade
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
  const _proj = useMemo(() => new THREE.Vector3(), [])
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

    // rocket lifts off / shrinks for the finale — pad & tower stay on Earth.
    // tiltRef banks it into the approach and back upright for touchdown.
    if (rocketInner.current) {
      rocketInner.current.scale.setScalar(shrinkRef.current.s)
      rocketInner.current.rotation.z = baseRotZ.current - tiltRef.current * TILT_AMP
      if (!landingRef.current) {
        rocketInner.current.position.y = riseRef.current
        rocketInner.current.position.x = 0
        rocketInner.current.position.z = 0
      }
    }

    // moon grows in at its corner spot — sliding up from below would sweep it
    // across the hero text while the page scrolls behind it. moonSquash gives
    // a volume-preserving compress-and-spring when the rocket touches down.
    if (moonGroup.current) {
      const mt = moonT.current.t
      moonGroup.current.visible = mt > 0.001
      if (moonGroup.current.visible) {
        const eased = mt * mt * (3 - 2 * mt)
        const base = Math.max(eased, 0.001) * MOON_SCALE
        const k = moonSquash.current.k
        moonGroup.current.position.set(MOON_FINAL.x, MOON_FINAL.y, MOON_FINAL.z)
        moonGroup.current.scale.set(base * (1 + k * 0.8), Math.max(base * (1 - k), 0.001), base * (1 + k * 0.8))
      }
    }

    if (glowMat.current) glowMat.current.emissiveIntensity = 1.6 + Math.sin(t * 2.2) * 0.5 + thrustRef.current * 5
    if (beaconMat.current) beaconMat.current.emissiveIntensity = 1.2 + (Math.sin(t * 3.4) > 0.55 ? 2.2 : 0)

    if (flying) {
      // One chase pose for the whole flight — ascent AND the corner-moon
      // landing — so the camera never swings and the page stays the backdrop.
      camTarget.set(
        Math.sin(t * 30) * 0.12 * shakeRef.current,
        riseRef.current + 2.6 + Math.sin(t * 26) * 0.08 * shakeRef.current,
        CHASE_D,
      )
      lookTarget.set(0, riseRef.current + (portrait ? 3.3 : 2.4), 0)
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

    // exhaust plume shader clocks — shock diamonds fade out in vacuum burns
    if (plumeMat.uniforms.uTime) plumeMat.uniforms.uTime.value = t
    const diaTarget = landing ? 0 : 1
    diamondsRef.current += (diaTarget - diamondsRef.current) * Math.min(1, dtReal * 2.5)
    if (plumeMat.uniforms.uDiamonds) plumeMat.uniforms.uDiamonds.value = diamondsRef.current * Math.min(1, thrustRef.current * 1.2)
    if (plumeMat.uniforms.uThrust) plumeMat.uniforms.uThrust.value = thrustRef.current

    // pad / touchdown smoke only — fire itself is drawn by the plume shader
    // exhaust smoke only where it reads: pad billow at liftoff and the final
    // approach to the moon — mid-transit puffs just blob over the page text
    const rp = rocketInner.current?.position
    const nearMoon =
      landing && !!rp && Math.hypot(rp.x - LAND.x, rp.y - LAND.y, rp.z - LAND.z) < 10
    if (thrustRef.current > 0.02 && (riseRef.current < 6 || nearMoon)) {
      // anchor to the rocket's live position (it drifts toward the moon in the finale)
      nozzleWorld.set(
        (rp?.x ?? 0) + (Math.random() - 0.5) * 0.16 * shrinkRef.current.s,
        (rp?.y ?? riseRef.current) - 0.42,
        (rp?.z ?? 0) + (Math.random() - 0.5) * 0.16 * shrinkRef.current.s,
      )
      for (let i = 0; i < 4; i++) spawnParticle(smoke, nozzleWorld, 1.8, 0.26, landing ? 4.5 : 2.2)
    }
    const fadeColor = new THREE.Color()
    for (let i = 0; i < smoke.count; i++) {
      if (smoke.life[i] <= 0) continue
      smoke.life[i] -= dt * 0.55
      smoke.positions[i * 3] += (smoke.vel[i * 3] + Math.sin(t + i) * 0.4) * dt
      smoke.positions[i * 3 + 1] += smoke.vel[i * 3 + 1] * dt * 0.4
      smoke.positions[i * 3 + 2] += smoke.vel[i * 3 + 2] * dt
      const l = Math.max(smoke.life[i], 0)
      fadeColor.setRGB(0.5, 0.52, 0.58).multiplyScalar(l * 0.55)
      smoke.colors.set([fadeColor.r, fadeColor.g, fadeColor.b], i * 3)
      if (smoke.life[i] <= 0) smoke.positions[i * 3 + 1] = 9999
    }
    if (smokeRef.current) {
      smokeRef.current.geometry.attributes.position.needsUpdate = true
      smokeRef.current.geometry.attributes.color.needsUpdate = true
    }

    // project the rocket's anchor to screen space for the click button
    if (screenRef.current && rocketInner.current) {
      const rp = rocketInner.current.position
      _proj.set(rp.x, rp.y + 2.2 * shrinkRef.current.s, rp.z).project(camera)
      const sx = (_proj.x * 0.5 + 0.5) * window.innerWidth
      const sy = (-_proj.y * 0.5 + 0.5) * window.innerHeight
      screenRef.current.x = sx
      screenRef.current.y = sy
      screenRef.current.visible =
        _proj.z < 1 && sx > -80 && sx < window.innerWidth + 80 && sy > -100 && sy < window.innerHeight + 160
    }
  })

  return (
    <>
      {isNight ? (
        <>
          {!hideStars && <Stars radius={110} depth={60} count={2600} factor={4.2} saturation={0} fade speed={0.6} />}
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

      {/* The Moon — slides up into place during the landing finale */}
      <group ref={moonGroup} visible={false}>
        <mesh geometry={moonGeo}>
          <meshStandardMaterial color="#b7b3aa" roughness={1} flatShading />
        </mesh>
      </group>

      <points ref={smokeRef} geometry={smoke.geo} material={smoke.mat} frustumCulled={false} />
    </>
  )
}
