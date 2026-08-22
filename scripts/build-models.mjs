/**
 * Procedurally builds the two NJ Physics hero models and writes GLB files:
 *   public/models/study-island.glb  (Concept 1 — floating physics study island)
 *   public/models/prism.glb         (Concept 2 — optics & spectrum prism)
 *
 * Run: node scripts/build-models.mjs   (or: npm run models)
 */
import * as THREE from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// GLTFExporter's binary path uses Blob + FileReader; Node has Blob but no FileReader.
if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((ab) => {
        this.result = ab
        this.onloadend?.()
      })
    }
  }
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'models')

// Deterministic pseudo-random so rebuilds are reproducible
let seed = 42
const rand = () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

const mat = (opts) => new THREE.MeshStandardMaterial({ ...opts })

function facet(geometry) {
  const g = geometry.index ? geometry.toNonIndexed() : geometry
  g.computeVertexNormals()
  return g
}

function jitter(geometry, amount) {
  const pos = geometry.getAttribute('position')
  const seen = new Map()
  for (let i = 0; i < pos.count; i++) {
    const key = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`
    let dx, dy, dz
    if (seen.has(key)) {
      ;[dx, dy, dz] = seen.get(key)
    } else {
      dx = (rand() - 0.5) * amount
      dy = (rand() - 0.5) * amount * 0.6
      dz = (rand() - 0.5) * amount
      seen.set(key, [dx, dy, dz])
    }
    pos.setXYZ(i, pos.getX(i) + dx, pos.getY(i) + dy, pos.getZ(i) + dz)
  }
  geometry.computeVertexNormals()
  return geometry
}

function buildStudyIsland() {
  const island = new THREE.Group()
  island.name = 'StudyIsland'

  // --- Rock underside with exposed strata ---
  const strataColors = ['#6b5544', '#57452f', '#453723']
  strataColors.forEach((color, i) => {
    const rTop = 2.05 - i * 0.12
    const geo = facet(new THREE.CylinderGeometry(rTop, rTop - 0.85, 0.75 - i * 0.08, 9, 1))
    jitter(geo, 0.22)
    const rock = new THREE.Mesh(geo, mat({ color, roughness: 0.95, flatShading: true }))
    rock.position.y = -0.38 - i * 0.72
    rock.name = `Strata${i}`
    island.add(rock)
  })
  // dangling keystone chunk
  const keystoneGeo = facet(new THREE.IcosahedronGeometry(0.55, 0))
  jitter(keystoneGeo, 0.25)
  const keystone = new THREE.Mesh(keystoneGeo, mat({ color: '#3a2e1e', roughness: 1 }))
  keystone.position.y = -2.15
  island.add(keystone)

  // --- Grassy knoll top ---
  const grassGeo = facet(new THREE.CylinderGeometry(2.18, 2.05, 0.42, 9, 1))
  jitter(grassGeo, 0.14)
  const grass = new THREE.Mesh(grassGeo, mat({ color: '#5da345', roughness: 0.85 }))
  grass.position.y = 0.21
  grass.name = 'GrassTop'
  island.add(grass)

  const dirtGeo = facet(new THREE.CylinderGeometry(2.06, 2.0, 0.28, 9, 1))
  jitter(dirtGeo, 0.16)
  const dirt = new THREE.Mesh(dirtGeo, mat({ color: '#7a5c3e', roughness: 0.95 }))
  dirt.position.y = -0.13
  island.add(dirt)

  // --- Book stack (spines carry A/L PHYSICS + විද්‍යාව labels at runtime) ---
  const books = [
    { w: 1.5, h: 0.26, d: 1.05, color: '#274b8f' },
    { w: 1.34, h: 0.24, d: 0.95, color: '#a33d3d', rot: 0.16 },
    { w: 1.2, h: 0.22, d: 0.88, color: '#2e7d54', rot: -0.12 },
  ]
  let bookY = 0.42 + books[0].h / 2
  books.forEach((b, i) => {
    const group = new THREE.Group()
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), mat({ color: b.color, roughness: 0.6 }))
    group.add(mesh)
    // pages block peeking out
    const pages = new THREE.Mesh(
      new THREE.BoxGeometry(b.w * 0.94, b.h * 0.82, b.d * 0.96),
      mat({ color: '#efe6cf', roughness: 0.9 })
    )
    pages.position.x = 0.06
    group.add(pages)
    // spine label strip (front face) — runtime applies CanvasTexture here
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(b.w * 0.92, b.h * 0.78),
      new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0 })
    )
    label.position.z = b.d / 2 + 0.005
    label.name = `SpineLabel${i + 1}`
    group.add(label)

    group.position.y = bookY
    group.rotation.y = b.rot ?? 0
    bookY += b.h + (books[i + 1]?.h ?? 0) / 2
    group.name = `Book${i + 1}`
    island.add(group)
  })

  // --- Scientific calculator next to the books ---
  const calc = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.07, 0.95), mat({ color: '#20242e', roughness: 0.4, metalness: 0.2 }))
  calc.add(body)
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.02, 0.24), mat({ color: '#9fd8c5', roughness: 0.25, emissive: '#123b31', emissiveIntensity: 0.4 }))
  screen.position.set(0, 0.045, -0.28)
  calc.add(screen)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      const key = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.03, 0.07), mat({ color: c === 0 ? '#ffb454' : '#39404f', roughness: 0.5 }))
      key.position.set(-0.195 + c * 0.13, 0.05, 0.06 + r * 0.14)
      calc.add(key)
    }
  }
  calc.position.set(1.05, 0.49, 0.55)
  calc.rotation.y = -0.5
  calc.name = 'Calculator'
  island.add(calc)

  // --- Pendulum with glowing bob ---
  const pend = new THREE.Group()
  const postMat = mat({ color: '#8a93a6', roughness: 0.35, metalness: 0.7 })
  const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.035, 1.05, 8), postMat)
  postL.position.set(-0.32, 0.52, 0)
  const postR = postL.clone()
  postR.position.x = 0.32
  const cross = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.68, 8), postMat)
  cross.rotation.z = Math.PI / 2
  cross.position.set(0, 1.05, 0)
  pend.add(postL, postR, cross)
  const string = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.62, 6), mat({ color: '#cfd6e4' }))
  string.position.set(0, 0.74, 0)
  pend.add(string)
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 20, 16),
    mat({ color: '#ffca7a', emissive: '#ffb454', emissiveIntensity: 2.2, roughness: 0.3 })
  )
  ball.position.set(0, 0.42, 0)
  ball.name = 'PendulumBall'
  pend.add(ball)
  pend.position.set(-0.85, 0.42, 0.62)
  pend.rotation.y = 0.4
  pend.name = 'Pendulum'
  island.add(pend)

  // --- Floating translucent lightbulb overhead ---
  const bulb = new THREE.Group()
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: '#fff6e0',
    transparent: true,
    opacity: 0.32,
    roughness: 0.06,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    emissive: '#ffd9a0',
    emissiveIntensity: 0.4,
    side: THREE.DoubleSide,
  })
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 20), glassMat)
  globe.scale.y = 1.18
  bulb.add(globe)
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.15, 0.18, 12),
    mat({ color: '#c9a24b', metalness: 0.85, roughness: 0.3 })
  )
  collar.position.y = -0.44
  bulb.add(collar)
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), mat({ color: '#3a3630', roughness: 0.6 }))
  tip.position.y = -0.56
  bulb.add(tip)
  const filament = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.08, 0.018, 48, 8),
    mat({ color: '#ffe9bd', emissive: '#ffc36b', emissiveIntensity: 3 })
  )
  filament.position.y = -0.02
  filament.name = 'Filament'
  bulb.add(filament)
  bulb.position.set(0.15, 2.35, 0)
  bulb.name = 'Bulb'
  island.add(bulb)

  return island
}

function buildPrism() {
  const scene = new THREE.Group()
  scene.name = 'PrismScene'

  // --- Dark geometric platform ---
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 2.55, 0.22, 8),
    mat({ color: '#11141d', roughness: 0.55, metalness: 0.35 })
  )
  platform.position.y = -1.1
  platform.name = 'Platform'
  scene.add(platform)
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.28, 0.02, 8, 64),
    mat({ color: '#38e8ff', emissive: '#38e8ff', emissiveIntensity: 1.6 })
  )
  ring.rotation.x = Math.PI / 2
  ring.position.y = -0.98
  ring.name = 'PlatformRing'
  scene.add(ring)

  // --- Glass triangular prism (apex up) ---
  // Runtime canvases have no environment map, so transmission alone renders
  // dark — use transparent physical glass with a faint emissive tint instead.
  const prism = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.9, 1.6, 3, 1),
    new THREE.MeshPhysicalMaterial({
      color: '#bfe3ff',
      transparent: true,
      opacity: 0.4,
      roughness: 0.04,
      metalness: 0.05,
      ior: 1.49,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      emissive: '#16324d',
      emissiveIntensity: 0.5,
      side: THREE.DoubleSide,
    })
  )
  prism.rotation.y = Math.PI / 6 // face the incoming beam
  prism.name = 'Prism'
  scene.add(prism)

  // --- Incoming white beam (left → prism) ---
  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(2.45, 0.09, 0.09),
    new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 3.4 })
  )
  beam.position.set(-2.02, 0, 0.34)
  beam.name = 'WhiteBeam'
  scene.add(beam)

  // --- Spectrum fan (right face → curving upward), ROYGBIV ---
  const spectrum = new THREE.Group()
  const colors = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#32ade6', '#5856d6', '#af52de']
  colors.forEach((color, i) => {
    const len = 2.2 + i * 0.14
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(len, 0.085, 0.085),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 3 })
    )
    const angle = -0.06 - i * 0.085 // progressively curve upward
    strip.position.set(0.66 + (Math.cos(angle) * len) / 2 + 0.38, (Math.sin(angle) * len) / 2 + i * 0.07, -0.32)
    strip.rotation.z = angle
    strip.name = `Ray${i}`
    spectrum.add(strip)
  })
  spectrum.position.y = 0.05
  spectrum.name = 'Spectrum'
  scene.add(spectrum)

  return scene
}

async function exportGlb(object3d, outFile) {
  const exporter = new GLTFExporter()
  const buffer = await exporter.parseAsync(object3d, { binary: true })
  await writeFile(outFile, Buffer.from(buffer))
  console.log(`✔ wrote ${outFile} (${(buffer.byteLength / 1024).toFixed(0)} KB)`)
}

const islandScene = new THREE.Scene()
islandScene.add(buildStudyIsland())
await exportGlb(islandScene, join(outDir, 'study-island.glb'))

seed = 1337
const prismWrap = new THREE.Scene()
prismWrap.add(buildPrism())
await exportGlb(prismWrap, join(outDir, 'prism.glb'))

console.log('Done.')
