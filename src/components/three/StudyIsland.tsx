import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const SPINE_TEXTS = ['A/L PHYSICS', 'විද්‍යාව', 'NJ PHYSICS']

function makeSpineTexture(text: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  // dark plate so the label reads on any spine colour
  ctx.fillStyle = 'rgba(8,10,16,0.82)'
  ctx.fillRect(24, 20, canvas.width - 48, canvas.height - 40)
  ctx.font = `bold ${/[^\x00-\x7F]/.test(text) ? 60 : 68}px "Noto Sans Sinhala", "Space Grotesk", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ffd9a0'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 4)
  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  return tex
}

/**
 * Concept 1 — Floating Physics Study Island (hero model).
 * Idle bob + cursor-parallax rotation, pulsing bulb, swinging glowing
 * pendulum bob, and a click-anywhere "lightbulb moment" flash.
 */
export default function StudyIsland(props: React.ComponentProps<'group'>) {
  const { scene } = useGLTF('/models/study-island.glb')
  const group = useRef<THREE.Group>(null)
  const filamentMat = useRef<THREE.MeshStandardMaterial | null>(null)
  const ball = useRef<THREE.Object3D | null>(null)
  const flashRef = useRef(0)

  // Spine labels are baked as transparent planes in the GLB; paint text at
  // runtime where the browser can rasterize Sinhala natively.
  useMemo(() => {
    scene.traverse((obj) => {
      if (/^SpineLabel\d$/.test(obj.name)) {
        const mesh = obj as THREE.Mesh
        const idx = Number(obj.name.replace('SpineLabel', '')) - 1
        const mat = mesh.material as THREE.MeshBasicMaterial
        mat.map = makeSpineTexture(SPINE_TEXTS[idx] ?? 'PHYSICS')
        mat.opacity = 1
        mat.transparent = true
        mat.needsUpdate = true
      }
      if (obj.name === 'Filament') {
        filamentMat.current = (obj as THREE.Mesh).material as THREE.MeshStandardMaterial
      }
      if (obj.name === 'PendulumBall') ball.current = obj
    })
    return scene
  }, [scene])

  useEffect(
    () => () =>
      scene.traverse((o) => {
        if (/^SpineLabel\d$/.test(o.name)) (o as THREE.Mesh).material as THREE.MeshBasicMaterial
      }),
    [scene],
  )

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const g = group.current
    if (!g) return

    // idle float + gentle cursor parallax
    g.position.y = Math.sin(t * 0.6) * 0.12
    g.rotation.y += (state.pointer.x * 0.35 - g.rotation.y) * Math.min(1, dt * 2.4)
    g.rotation.x += (Math.sin(t * 0.25) * 0.03 - state.pointer.y * 0.08 - g.rotation.x) * Math.min(1, dt * 2.4)

    // bulb pulse + click flash decay
    flashRef.current = Math.max(0, flashRef.current - dt * 1.4)
    if (filamentMat.current) {
      filamentMat.current.emissiveIntensity = 2.6 + Math.sin(t * 2.1) * 0.7 + flashRef.current * 6
    }

    // pendulum swing about the crossbar (local crossbar sits at y≈1.05, r≈0.63)
    if (ball.current) {
      const theta = Math.sin(t * 1.9) * 0.5
      const r = 0.63
      ball.current.position.x = Math.sin(theta) * r
      ball.current.position.y = 1.05 - Math.cos(theta) * r - 0.42
      ball.current.rotation.z = -theta
    }
  })

  return (
    <group
      ref={group}
      {...props}
      onClick={(e) => {
        e.stopPropagation()
        flashRef.current = 1
      }}
    >
      <primitive object={scene} />
    </group>
  )
}
