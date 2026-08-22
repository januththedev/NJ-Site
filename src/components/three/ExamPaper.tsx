import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from '../../hooks/useGsapContext'

/**
 * Exam paper that gets graded by a red pen:
 * - the pen travels between answers in small lifting arcs
 * - each ✓ stroke is DRAWN progressively (grows from its anchor)
 * - a circled "A" pops in after the last tick
 * Replays every time `trigger` increments (scroll-past or hover).
 */
export default function ExamPaper({ trigger = 0 }: { trigger?: number }) {
  const { scene } = useGLTF('/models/exam-paper.glb')
  const strokes = useRef<THREE.Group[]>([])
  const ring = useRef<THREE.Group | null>(null)
  const gradeA = useRef<THREE.Object3D | null>(null)
  const pen = useRef<THREE.Group | null>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const group = useRef<THREE.Group>(null)

  useMemo(() => {
    strokes.current = []
    scene.traverse((o) => {
      if (/^Tick\d+_[ab]$/.test(o.name)) {
        const g = o as THREE.Group
        const mesh = g.children[0] as THREE.Mesh
        // GLTFLoader yields plain BufferGeometry (no .parameters) — measure it
        const geo = mesh.geometry as THREE.BufferGeometry
        if (!geo.boundingBox) geo.computeBoundingBox()
        g.userData.len = geo.boundingBox!.max.x - geo.boundingBox!.min.x
        g.scale.x = 0.001
        strokes.current.push(g)
      }
      if (o.name === 'GradeRing' || o.name === 'GradeA') {
        ;(o as THREE.Mesh).scale.setScalar(0.001)
        if (o.name === 'GradeRing') ring.current = o as THREE.Group
        else gradeA.current = o
      }
      if (o.name === 'Pen') pen.current = o as THREE.Group
    })
    // document order: Tick1_a, Tick1_b, Tick2_a …
    strokes.current.sort((a, b) => a.name.localeCompare(b.name))
    return scene
  }, [scene])

  useEffect(() => {
    if (!trigger || !pen.current) return
    tlRef.current?.kill()

    const reset = () => {
      strokes.current.forEach((s) => gsap.set(s.scale, { x: 0.001 }))
      if (ring.current) gsap.set(ring.current.scale, { x: 0.001, y: 0.001, z: 0.001 })
      if (gradeA.current) gsap.set(gradeA.current.scale, { x: 0.001, y: 0.001, z: 0.001 })
    }
    reset()

    const ctx = gsap.context(() => {
      const penObj = pen.current!
      const REST = { x: -1.05, y: -1.32, z: 0.34 }
      gsap.set(penObj.position, REST)
      gsap.set(penObj.rotation, { z: 0.42 })

      const tl = gsap.timeline({
        onComplete: () => {
          // return the pen to its resting pose on the desk
          gsap.to(penObj.position, { x: -0.25, y: -1.16, z: 0.14, duration: 0.6, ease: 'power2.inOut' })
          gsap.to(penObj.rotation, { z: 0.22, duration: 0.6 })
        },
      })

      const pairs: Record<string, THREE.Group[]> = {}
      strokes.current.forEach((s) => {
        const tick = s.name.split('_')[0]
        ;(pairs[tick] ??= []).push(s)
      })

      Object.keys(pairs).sort().forEach((tickName, idx) => {
        const [a, b] = pairs[tickName]
        const target = a.position // both strokes share the tick's row area
        const liftY = 0.34 + Math.random() * 0.08

        // arc toward the stroke start (lift, glide, drop to the paper)
        tl.to(penObj.position, { x: target.x - 0.14, y: target.y + liftY, z: 0.4, duration: 0.26, ease: 'power1.out' }, idx * 0.62)
        tl.to(penObj.position, { x: a.position.x - (a.userData.len as number) / 2 + 0.02, y: a.position.y - 0.02, z: 0.075, duration: 0.16, ease: 'power2.in' }, idx * 0.62 + 0.26)

        // draw stroke A under the nib…
        tl.to(a.scale, { x: 1, duration: 0.16, ease: 'none' }, idx * 0.62 + 0.44)
        // …slide the nib across to stroke B's start while A finishes
        tl.to(penObj.position, { x: b.position.x, y: b.position.y, z: 0.075, duration: 0.14, ease: 'none' }, idx * 0.62 + 0.46)
        tl.to(b.scale, { x: 1, duration: 0.22, ease: 'none' }, idx * 0.62 + 0.6)
        // flick off the paper toward the next answer
        tl.to(penObj.position, { z: 0.28, duration: 0.12, ease: 'power2.out' }, idx * 0.62 + 0.8)
        tl.to(penObj.rotation, { z: 0.42 + Math.sin(idx) * 0.12, duration: 0.3 }, idx * 0.62 + 0.5)
      })

      // circled grade after the final tick
      const last = 4 * 0.62
      tl.to(ring.current!.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'back.out(2.2)' }, last + 0.15)
      tl.to(gradeA.current!.scale, { x: 1, y: 1, z: 1, duration: 0.3, ease: 'back.out(2.6)' }, last + 0.3)

      tlRef.current = tl
    })
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    if (group.current) {
      group.current.rotation.y += (Math.sin(state.clock.elapsedTime * 0.45) * 0.14 - group.current.rotation.y) * dt * 2
      group.current.rotation.x = -0.12
    }
  })

  return (
    <group ref={group} rotation={[0.06, 0, 0]}>
      <primitive object={scene} />
    </group>
  )
}
