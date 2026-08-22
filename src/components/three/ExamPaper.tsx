import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from '../../hooks/useGsapContext'

/**
 * Exam paper that gets graded with a red pen: the pen sweeps across the
 * sheet and red check ticks pop in one by one every time `trigger`
 * increments (scroll-past or hover).
 */
export default function ExamPaper({ trigger = 0 }: { trigger?: number }) {
  const { scene } = useGLTF('/models/exam-paper.glb')
  const ticks = useRef<THREE.Group[]>([])
  const pen = useRef<THREE.Group | null>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const group = useRef<THREE.Group>(null)

  useMemo(() => {
    ticks.current = []
    scene.traverse((o) => {
      if (/^Tick\d$/.test(o.name)) {
        ticks.current.push(o as THREE.Group)
        ;(o as THREE.Group).children.forEach((child) => {
          const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
          m.opacity = 0
          m.transparent = true
        })
        ;(o as THREE.Group).scale.setScalar(0.3)
      }
      if (o.name === 'Pen') pen.current = o as THREE.Group
    })
    ticks.current.sort((a, b) => a.name.localeCompare(b.name))
    return scene
  }, [scene])

  useEffect(() => {
    if (!trigger || !pen.current) return
    tlRef.current?.kill()

    // reset ticks before replay
    ticks.current.forEach((tick) => {
      ;(tick as THREE.Group).children.forEach((child) => {
        const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial
        gsap.set(m, { opacity: 0 })
      })
      gsap.set(tick.scale, { x: 0.3, y: 0.3, z: 0.3 })
    })

    const ctx = gsap.context(() => {
      // park pen at the start of the first tick row
      gsap.set(pen.current!.position, { x: -0.9, y: -1.35, z: 0.5 })
      gsap.set(pen.current!.rotation, { z: 0.5 })
      const tl = gsap.timeline({ onComplete: () => pen.current && gsap.to(pen.current.position, { x: -0.25, y: -1.18, duration: 0.7 }) })
      ticks.current.forEach((tick, i) => {
        tl.to(pen.current!.position, {
          x: tick.position.x - 0.22,
          y: tick.position.y - 0.12,
          z: 0.42,
          duration: 0.38,
          ease: 'power2.inOut',
        }, i * 0.55)
        tl.to(tick.children.map((c) => (c as THREE.Mesh).material as THREE.MeshStandardMaterial), {
          opacity: 1,
          duration: 0.18,
        }, i * 0.55 + 0.3)
        tl.fromTo(tick.scale, { x: 0.3, y: 0.3, z: 0.3 }, { x: 1, y: 1, z: 1, duration: 0.28, ease: 'back.out(2.4)' }, i * 0.55 + 0.3)
        tl.to(pen.current!.rotation, { z: 0.5 - (i % 2) * 0.16, duration: 0.2 }, i * 0.55)
      })
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
