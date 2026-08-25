import * as THREE from 'three'

/**
 * Idempotent in-place material darkening for GLB scenes — used to keep pale
 * models readable on the light theme. The hierarchy is never cloned, so
 * skinned/animated models keep working; userData remembers the untouched
 * original materials so repeated calls (theme flips, page re-visits) never
 * compound.
 */
export function darkenMaterials(scene: THREE.Object3D, factor: number) {
  if (factor <= 0) return
  scene.traverse((o) => {
    const mesh = o as THREE.Mesh
    const mat = mesh.material as THREE.MeshStandardMaterial
    if (!mat || !(mat as THREE.MeshStandardMaterial).color) return
    const orig = (mesh.userData.origMat ?? mat) as THREE.MeshStandardMaterial
    mesh.userData.origMat = orig
    const m = orig.clone()
    // lerp toward dark slate — works whatever the base color is
    m.color = (orig.color ?? new THREE.Color('#ffffff')).clone().lerp(new THREE.Color('#39485c'), factor)
    mesh.material = m
  })
}
