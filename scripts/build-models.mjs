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

// ─────────────────────────────────────────────────────────────────────────────
// Concept 3 — Open physics book with flippable pages (Theory & Revision card)
// Pages are segmented planes so the runtime can curl/bend them while flipping.
function buildOpenBook() {
  const book = new THREE.Group()
  book.name = 'OpenBook'

  const PW = 0.98 // page width
  const PH = 1.38 // page height

  const coverMat = mat({ color: '#1e3d78', roughness: 0.45, metalness: 0.08 })
  const linerMat = mat({ color: '#33415c', roughness: 0.8 })
  const spineMat = mat({ color: '#152e5e', roughness: 0.5 })
  const pageMat = new THREE.MeshStandardMaterial({ color: '#f6f0df', roughness: 0.88, side: THREE.DoubleSide })

  // ── cover boards (slight overhang beyond the pages, opened flat) ──
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group()
    pivot.rotation.y = side * 0.44
    const board = new THREE.Mesh(new THREE.BoxGeometry(PW + 0.06, PH + 0.08, 0.05), coverMat)
    board.position.x = (side * (PW + 0.06)) / 2
    const liner = new THREE.Mesh(new THREE.BoxGeometry(PW - 0.02, PH - 0.04, 0.012), linerMat)
    liner.position.set((side * (PW - 0.02)) / 2, 0, side > 0 ? -0.03 : 0.03)
    pivot.add(board, liner)
    pivot.name = side < 0 ? 'CoverLeft' : 'CoverRight'
    book.add(pivot)
  }

  // ── spine: half-cylinder + head/tail bands ──
  const spineCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, PH + 0.08, 16, 1, false, Math.PI / 2, Math.PI), spineMat)
  spineCyl.rotation.y = Math.PI / 2
  spineCyl.scale.z = 1.4
  book.add(spineCyl)
  for (const yy of [PH / 2 + 0.06, -PH / 2 - 0.06]) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.05, 0.24), mat({ color: '#c9a24b', metalness: 0.75, roughness: 0.35 }))
    band.position.y = yy
    book.add(band)
  }

  // ── static page stacks: thick right block, thinner used left block ──
  const mkStackPage = (side, i, total) => {
    const g = new THREE.Group()
    g.rotation.y = side * (0.36 - i * 0.018)
    const page = new THREE.Mesh(new THREE.BoxGeometry(PW - 0.01, PH - 0.02, 0.016), pageMat)
    page.position.set((side * (PW - 0.01)) / 2, 0, 0.09 + i * 0.02)
    g.add(page)
    return g
  }
  for (let i = 0; i < 7; i++) book.add(mkStackPage(1, i, 7)) // right: unflipped
  for (let i = 0; i < 3; i++) book.add(mkStackPage(-1, i, 3)) // left: already read

  // ── print on the visible right page: heading rule, text lines, diagram ──
  const inkMat = mat({ color: '#39435a', roughness: 0.85 })
  const topZ = 0.09 + 7 * 0.02 + 0.008
  const header = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.05, 0.006), mat({ color: '#22325c' }))
  header.position.set(0.5, 0.56, topZ)
  book.add(header)
  for (let r = 0; r < 6; r++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.72 - (r % 2) * 0.12, 0.014, 0.005), inkMat)
    line.position.set(0.48, 0.42 - r * 0.15, topZ)
    book.add(line)
  }
  const diagram = new THREE.Mesh(
    new THREE.TorusGeometry(0.1, 0.013, 8, 26),
    mat({ color: '#38e8ff', emissive: '#38e8ff', emissiveIntensity: 0.55 })
  )
  diagram.position.set(0.52, -0.34, topZ)
  diagram.name = 'Diagram'
  book.add(diagram)
  // faint mirrored lines on the left (already-read) page
  for (let r = 0; r < 5; r++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.68 - (r % 3) * 0.1, 0.012, 0.005), mat({ color: '#5b6478' }))
    line.position.set(-0.48, 0.42 - r * 0.17, 0.09 + 3 * 0.02 + 0.008)
    book.add(line)
  }

  // ── flippable pages: segmented planes (curl-bent at runtime) ──
  for (let i = 0; i < 4; i++) {
    const geo = new THREE.PlaneGeometry(PW - 0.02, PH - 0.03, 14, 1)
    const page = new THREE.Mesh(geo, pageMat)
    page.position.x = (PW - 0.02) / 2 // hinge at spine edge
    const pivot = new THREE.Group()
    pivot.add(page)
    pivot.position.z = 0.235 + i * 0.018
    pivot.rotation.y = 0.37
    pivot.name = `FlipPage${i}`
    book.add(pivot)
  }

  // ── ribbon bookmark draped over the right stack ──
  const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.09, PH * 0.86, 0.008), mat({ color: '#b8323c', roughness: 0.7 }))
  ribbon.position.set(0.62, -0.02, 0.245 + 4 * 0.018 + 0.012)
  ribbon.rotation.z = 0.06
  ribbon.name = 'Ribbon'
  book.add(ribbon)

  return book
}

// ─────────────────────────────────────────────────────────────────────────────
// Concept 4 — Exam paper with red-pen grading (Papers card)
// Ticks are anchor-grouped so the runtime can "draw" each stroke progressively.
function buildExamPaper() {
  const paper = new THREE.Group()
  paper.name = 'ExamPaper'

  // ── sheet: segmented plane with a gentle baked curl (paper never lies flat) ──
  const SW = 1.5
  const SH = 2.0
  const geo = new THREE.PlaneGeometry(SW, SH, 12, 16)
  const pos = geo.getAttribute('position')
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const nx = x / (SW / 2)
    const ny = y / (SH / 2)
    // soft cylindrical wave + lifted corners
    pos.setZ(i, Math.sin(nx * 1.9) * 0.022 + Math.cos(ny * 2.3) * 0.014 + (Math.abs(nx) * Math.abs(ny)) ** 2 * 0.05)
  }
  geo.computeVertexNormals()
  const sheetMat = new THREE.MeshStandardMaterial({ color: '#f7f3e8', roughness: 0.92, side: THREE.DoubleSide })
  const sheet = new THREE.Mesh(geo, sheetMat)
  sheet.name = 'Sheet'
  sheet.rotation.x = -0.07
  paper.add(sheet)

  const sz = 0.035 // print height above the sheet surface

  // ── letterhead: institute bar + gold rule ──
  const headerBar = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.11, 0.006), mat({ color: '#22325c' }))
  headerBar.position.set(-0.22, 0.82, sz)
  paper.add(headerBar)
  const goldRule = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.02, 0.005), mat({ color: '#c9a24b', metalness: 0.7, roughness: 0.35 }))
  goldRule.position.set(0, 0.73, sz)
  paper.add(goldRule)

  // ── ruled answer lines ──
  const lineMat = mat({ color: '#495064', roughness: 0.85 })
  for (let r = 0; r < 8; r++) {
    const w = r % 3 === 2 ? 0.86 : 1.18
    const line = new THREE.Mesh(new THREE.BoxGeometry(w, 0.016, 0.006), lineMat)
    line.position.set(-0.04, 0.58 - r * 0.185, sz)
    line.rotation.x = -0.02
    paper.add(line)
  }
  const margin = new THREE.Mesh(new THREE.BoxGeometry(0.014, 1.8, 0.006), mat({ color: '#d96a6a' }))
  margin.position.set(-0.6, -0.08, sz)
  paper.add(margin)

  // ── red ticks: two anchored strokes per tick, grown at runtime ──
  const mkStroke = (len, rotZ, ax, ay) => {
    const anchor = new THREE.Group()
    anchor.position.set(ax, ay, sz + 0.012)
    anchor.rotation.z = rotZ
    const g = new THREE.BoxGeometry(len, 0.03, 0.014)
    g.translate(len / 2, 0, 0) // grows from the anchor along local +X
    const stroke = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#c81e1e', emissive: '#7e1010', emissiveIntensity: 0.35, roughness: 0.45 }))
    anchor.add(stroke)
    return anchor
  }
  for (let t = 0; t < 4; t++) {
    const cy = 0.62 - t * 0.46
    const cx = 0.46
    const a = mkStroke(0.13, 0.72, cx - 0.12, cy - 0.09)
    const b = mkStroke(0.23, -0.52, cx + 0.01, cy + 0.005)
    a.name = `Tick${t + 1}_a`
    b.name = `Tick${t + 1}_b`
    a.scale.x = 0.001
    b.scale.x = 0.001
    paper.add(a, b)
  }

  // ── final grade ring around an "A" (pops in after the last tick) ──
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.14, 0.022, 10, 32),
    mat({ color: '#c81e1e', emissive: '#7e1010', emissiveIntensity: 0.4 })
  )
  ring.position.set(0.56, 0.88, sz + 0.02)
  ring.name = 'GradeRing'
  ring.scale.setScalar(0.001)
  paper.add(ring)
  const gradeA = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.1, 0.012), mat({ color: '#c81e1e' }))
  gradeA.position.set(0.555, 0.878, sz + 0.012)
  gradeA.rotation.z = -0.12
  gradeA.name = 'GradeA'
  gradeA.scale.setScalar(0.001)
  paper.add(gradeA)

  // ── red pen: hex barrel, grip, metal nib — origin AT THE TIP ──
  const pen = new THREE.Group()
  pen.name = 'Pen'
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.66, 6), mat({ color: '#c0392b', roughness: 0.3 }))
  barrel.rotation.z = Math.PI / 2
  barrel.position.x = 0.42
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.14, 6), mat({ color: '#26262b', roughness: 0.6 }))
  grip.rotation.z = Math.PI / 2
  grip.position.x = 0.06
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 6), mat({ color: '#aeb6c2', metalness: 0.85, roughness: 0.25 }))
  cone.rotation.z = Math.PI / 2
  cone.position.x = -0.05
  const nib = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), mat({ color: '#1c1c20' }))
  nib.position.x = -0.112
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.09, 6), mat({ color: '#8f1d1d', roughness: 0.35 }))
  cap.rotation.z = Math.PI / 2
  cap.position.x = 0.78
  pen.add(barrel, grip, cone, nib, cap)
  pen.position.set(-0.25, -1.16, 0.14)
  pen.rotation.z = 0.22
  paper.add(pen)

  return paper
}

// ─────────────────────────────────────────────────────────────────────────────
// Concept 5 — Vernier caliper measuring a specimen (Practical Sessions)
function buildVernierCaliper() {
  const rig = new THREE.Group()
  rig.name = 'CaliperRig'

  const steel = mat({ color: '#b9c2cf', metalness: 0.85, roughness: 0.3 })

  const caliper = new THREE.Group()
  caliper.name = 'Caliper'
  const beam = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.14, 0.16), steel)
  caliper.add(beam)
  // main scale ticks
  for (let i = 0; i <= 24; i++) {
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.05, 0.02), mat({ color: '#39404f' }))
    tick.position.set(-1.6 + i * 0.1333, 0.095, 0)
    caliper.add(tick)
  }
  // fixed jaw (left)
  const fixedJaw = new THREE.Group()
  const fjPlate = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.18), steel)
  fjPlate.position.y = 0.24
  const fjArm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.16), steel)
  fjArm.position.x = 0.17
  fixedJaw.add(fjPlate, fjArm)
  fixedJaw.position.x = -0.85
  fixedJaw.name = 'FixedJaw'
  caliper.add(fixedJaw)

  // sliding jaw (moves along X at runtime)
  const slider = new THREE.Group()
  const sjBody = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.78, 0.2), mat({ color: '#99a3b2', metalness: 0.8, roughness: 0.35 }))
  sjBody.position.y = 0.3
  const sjArm = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.14, 0.16), steel)
  sjArm.position.x = -0.16
  const thumb = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 12), mat({ color: '#ffb454', metalness: 0.6, roughness: 0.4 }))
  thumb.rotation.x = Math.PI / 2
  thumb.position.set(0, 0.3, 0.14)
  slider.add(sjBody, sjArm, thumb)
  slider.position.x = 1.75
  slider.name = 'Slider'
  caliper.add(slider)

  // depth rod
  const rod = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.03, 0.03), steel)
  rod.position.set(2.2, -0.02, 0)
  caliper.add(rod)

  caliper.position.y = 0.4
  rig.add(caliper)

  // specimen being measured (brass cylinder between the jaws)
  const specimen = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.62, 20),
    mat({ color: '#c9a24b', metalness: 0.9, roughness: 0.25 })
  )
  specimen.position.set(-0.1, 0.31, 0)
  specimen.name = 'Specimen'
  rig.add(specimen)

  return rig
}

// ─────────────────────────────────────────────────────────────────────────────
// Concept 6 — Stylized Sri Lanka map base (27 pins added at runtime)
function buildLankaMap() {
  const group = new THREE.Group()
  group.name = 'LankaMap'

  // simplified coastline polygon [lng, lat]
  const outline = [
    [80.21, 9.82], [80.42, 9.65], [81.0, 8.9], [81.23, 8.57], [81.45, 8.35],
    [81.67, 7.9], [81.86, 7.0], [81.75, 6.75], [81.22, 6.45], [80.78, 6.03],
    [80.45, 5.92], [80.28, 5.97], [79.86, 6.44], [79.73, 7.0], [79.77, 7.58],
    [79.72, 8.08], [79.98, 8.35], [79.9, 8.9], [80.0, 9.35],
  ]
  const shape = new THREE.Shape()
  outline.forEach(([lng, lat], i) => {
    const x = (lng - 80.8) * 2.6
    const y = (lat - 7.87) * 2.6
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  })
  shape.closePath()

  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 })
  geo.center()
  const land = new THREE.Mesh(
    geo,
    mat({ color: '#182132', metalness: 0.55, roughness: 0.4, emissive: '#0d2436', emissiveIntensity: 0.5 })
  )
  land.name = 'LandMass'
  group.add(land)

  // glowing underlay halo
  const haloGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false })
  haloGeo.center()
  const halo = new THREE.Mesh(
    haloGeo,
    mat({ color: '#38e8ff', emissive: '#38e8ff', emissiveIntensity: 1.4, transparent: true, opacity: 0.28 })
  )
  halo.scale.set(1.035, 1.035, 1)
  halo.position.z = -0.1
  halo.name = 'Halo'
  group.add(halo)

  return group
}

// ─────────────────────────────────────────────────────────────────────────────
// Concept 7 — Rocket on launchpad (scroll journey hero + blast-off)
function buildRocket() {
  const assembly = new THREE.Group()
  assembly.name = 'RocketAssembly'

  const rocket = new THREE.Group()
  rocket.name = 'Rocket'
  const white = mat({ color: '#eef1f6', roughness: 0.35, metalness: 0.15 })
  const dark = mat({ color: '#23262e', roughness: 0.5, metalness: 0.6 })
  const red = mat({ color: '#d33a3a', roughness: 0.4 })

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 3.4, 28), white)
  body.position.y = 2.2
  rocket.add(body)
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.505, 0.505, 0.22, 28), red)
  stripe.position.y = 3.1
  rocket.add(stripe)
  const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.7, 28), white)
  upper.position.y = 4.25
  rocket.add(upper)
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.15, 28), red)
  nose.position.y = 5.17
  rocket.add(nose)
  // porthole
  const port = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.035, 10, 24), dark)
  port.position.set(0, 3.7, 0.47)
  rocket.add(port)
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.115, 20), mat({ color: '#9fd8ff', emissive: '#3d7ea8', emissiveIntensity: 0.7 }))
  glass.position.set(0, 3.7, 0.475)
  rocket.add(glass)

  // fins ×3
  const finShape = new THREE.Shape()
  finShape.moveTo(0, 0)
  finShape.lineTo(0.85, -0.15)
  finShape.lineTo(0.85, 0.55)
  finShape.lineTo(0, 1.05)
  finShape.closePath()
  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.07, bevelEnabled: false })
  for (let i = 0; i < 3; i++) {
    const fin = new THREE.Mesh(finGeo, red)
    const holder = new THREE.Group()
    fin.position.z = -0.035
    holder.add(fin)
    holder.rotation.y = (i * Math.PI * 2) / 3
    holder.position.y = 0.55
    rocket.add(holder)
  }

  // engine section + nozzle
  const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.6, 0.5, 28), dark)
  engine.position.y = 0.25
  rocket.add(engine)
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.46, 0.55, 24, 1, true), mat({ color: '#15161b', metalness: 0.9, roughness: 0.35, side: THREE.DoubleSide }))
  nozzle.position.y = -0.22
  rocket.add(nozzle)
  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(0.3, 20),
    mat({ color: '#ffd9a0', emissive: '#ff8c2a', emissiveIntensity: 2.4 })
  )
  glow.rotation.x = Math.PI / 2
  glow.position.y = -0.42
  glow.name = 'EngineGlow'
  rocket.add(glow)

  assembly.add(rocket)

  // launchpad
  const pad = new THREE.Group()
  pad.name = 'LaunchPad'
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.7, 0.4, 10), mat({ color: '#3a3f4c', roughness: 0.9 }))
  deck.position.y = -0.95
  pad.add(deck)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.28, 0.035, 8, 48), mat({ color: '#ffb454', emissive: '#ffb454', emissiveIntensity: 1.2 }))
  ring.rotation.x = Math.PI / 2
  ring.position.y = -0.74
  pad.add(ring)
  for (let i = 0; i < 4; i++) {
    const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.5, 0.22), dark)
    const a = (i * Math.PI) / 2 + Math.PI / 4
    clamp.position.set(Math.cos(a) * 0.68, -0.55, Math.sin(a) * 0.68)
    pad.add(clamp)
  }
  // service tower
  const tower = new THREE.Group()
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.26, 6.4, 0.26), mat({ color: '#565e70', metalness: 0.6, roughness: 0.5 }))
  mast.position.y = 2.4
  tower.add(mast)
  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.09, 0.09), mat({ color: '#565e70' }))
    arm.position.set(-0.62, 1.4 + i * 1.15, 0)
    tower.add(arm)
  }
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), mat({ color: '#ff5252', emissive: '#ff2020', emissiveIntensity: 2 }))
  beacon.position.y = 5.75
  tower.add(beacon)
  tower.position.set(1.75, -0.75, 0)
  tower.name = 'Tower'
  pad.add(tower)

  assembly.add(pad)
  return assembly
}

const bookScene = new THREE.Scene()
bookScene.add(buildOpenBook())
await exportGlb(bookScene, join(outDir, 'open-book.glb'))

const paperScene = new THREE.Scene()
paperScene.add(buildExamPaper())
await exportGlb(paperScene, join(outDir, 'exam-paper.glb'))

const caliperScene = new THREE.Scene()
caliperScene.add(buildVernierCaliper())
await exportGlb(caliperScene, join(outDir, 'vernier-caliper.glb'))

const lankaScene = new THREE.Scene()
lankaScene.add(buildLankaMap())
await exportGlb(lankaScene, join(outDir, 'sri-lanka.glb'))

const rocketScene = new THREE.Scene()
rocketScene.add(buildRocket())
await exportGlb(rocketScene, join(outDir, 'rocket.glb'))

console.log('Done.')
