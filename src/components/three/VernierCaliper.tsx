import { useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { gsap, ScrollTrigger } from '../../hooks/useGsapContext'

/**
 * Vernier caliper: the whole rig slides in cinematically from the left of
 * the screen (ScrollTrigger scrub) while the sliding jaw closes onto the
 * brass specimen as the section scrolls through.
 */
export default function VernierCaliper({ animate = false }: { animate?: boolean }) {
  const { scene } = useGLTF('/models/vernier-caliper.glb')
  const slider = useRef<THREE.Group | null>(null)
  const group = useRef<THREE.Group>(null)

  useMemo(() => {
    scene.traverse((o) => {
      if (o.name === 'Slider') slider.current = o as THREE.Group
    })
    return scene
  }, [scene])

  useEffect(() => {
    if (!group.current || !slider.current) return
    if (!animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      slider.current.position.x = 0.58
      return
    }
    slider.current.position.x = 1.75

    const ctx = gsap.context(() => {
      // cinematic slide-in from the side of the screen
      gsap.fromTo(
        group.current!.position,
        { x: -7.5, z: -3 },
        {
          x: 0,
          z: 0,
          duration: 1.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: '#practicals', start: 'top 80%', end: 'top 30%', scrub: 0.8 },
        },
      )
      gsap.fromTo(
        group.current!.rotation,
        { y: -0.55 },
        {
          y: 0.12,
          ease: 'none',
          scrollTrigger: { trigger: '#practicals', start: 'top 85%', end: 'center center', scrub: 0.8 },
        },
      )
      // jaw closes onto the specimen across the section scroll
      ScrollTrigger.create({
        trigger: '#practicals',
        start: 'top 60%',
        end: 'bottom 70%',
        scrub: 0.6,
        onUpdate: (self) => {
          if (!slider.current) return
          slider.current.position.x = THREE.MathUtils.lerp(1.75, 0.58, self.progress)
        },
      })
    })
    return () => ctx.revert()
  }, [animate])

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  )
}
