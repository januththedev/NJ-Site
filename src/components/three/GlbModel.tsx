import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Generic GLB accent for the sub-page heroes — normalizes any model to a
 * target height, centers it on the stage, turns it slowly, and plays its
 * first animation clip if asked (e.g. the walking person).
 *
 * Person model: "Cesium Man" © Analytical Graphics, Inc. — CC-BY 4.0
 * (Khronos glTF sample assets).
 */
export default function GlbModel({
  src,
  height = 2.1,
  speed = 0.45,
  playAnimation = false,
  brighten = 0,
  darken = 0,
}: {
  src: string
  /** normalized world height on the stage */
  height?: number
  /** turntable radians/second */
  speed?: number
  playAnimation?: boolean
  /** lightens + teal-emissives dark materials so they read on the dark stage.
   *  Clones the scene (never mutates the shared useGLTF cache) — only for
   *  static models; skinned/animated ones must stay uncloned. */
  brighten?: number
  /** darkens pale materials so they keep contrast on the light stage. */
  darken?: number
}) {
  const { scene, animations } = useGLTF(src)
  const group = useRef<THREE.Group>(null)
  const mixer = useRef<THREE.AnimationMixer | null>(null)

  const object = useMemo(() => {
    if (darken) {
      // skinned/animated models: swap materials IN PLACE (cloning the
      // hierarchy would break skinning). userData keeps the untouched
      // original so re-visits never compound the darkening. The factor
      // must be high — color only MULTIPLIES the texture.
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh
        const mat = mesh.material as THREE.MeshStandardMaterial
        if (!mat || !(mat as THREE.MeshStandardMaterial).color) return
        const orig = (mesh.userData.origMat ?? mat) as THREE.MeshStandardMaterial
        mesh.userData.origMat = orig
        const m = orig.clone()
        // lerp toward dark slate — works whatever the base color is
        m.color = (orig.color ?? new THREE.Color('#ffffff')).clone().lerp(new THREE.Color('#39485c'), darken)
        mesh.material = m
      })
      return scene
    }
    if (!brighten) return scene
    const clone = scene.clone(true)
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial
      if (mat && (mat as THREE.MeshStandardMaterial).emissive) {
        mesh.material = mat.clone()
        const m = mesh.material as THREE.MeshStandardMaterial
        m.color = m.color.clone().lerp(new THREE.Color('#cbd5e1'), 0.4)
        m.emissive = new THREE.Color('#2dd4bf').multiplyScalar(brighten)
      }
    })
    return clone
  }, [scene, brighten, darken])

  const { scale, center } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(object)
    const size = box.getSize(new THREE.Vector3())
    const c = box.getCenter(new THREE.Vector3())
    return { scale: height / (size.y || 1), center: c }
  }, [object, height])

  useEffect(() => {
    if (!playAnimation || !animations.length) return
    const m = new THREE.AnimationMixer(scene)
    animations.forEach((clip) => m.clipAction(clip).play())
    mixer.current = m
    return () => {
      m.stopAllAction()
      mixer.current = null
    }
  }, [scene, animations, playAnimation])

  useFrame((_, dt) => {
    if (mixer.current) mixer.current.update(Math.min(dt, 0.05))
    if (group.current) group.current.rotation.y += Math.min(dt, 0.05) * speed
  })

  return (
    <group ref={group} scale={scale}>
      <primitive object={object} position={[-center.x, -center.y, -center.z]} />
    </group>
  )
}
