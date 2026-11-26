import * as THREE from 'three'

/** A soft four-step gradient for toon shading. Few steps give the cartoon look, four keep it gentle. */
export function createToonGradient(): THREE.DataTexture {
  const texture = new THREE.DataTexture(new Uint8Array([110, 170, 220, 255]), 4, 1, THREE.RedFormat)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}
