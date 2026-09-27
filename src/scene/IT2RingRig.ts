import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';

export interface IT2RingRigOptions {
  modelUrl?: string;
  onLoaded?: (group: THREE.Group) => void;
}

/**
 * Creates the IT2 3-Camera Darts Ring Rig assembly mounted around the dartboard.
 * Sourced directly from IT2 Assembly CAD geometry with 3 camera pods at 120° intervals.
 */
export function createIT2RingRigGroup(options: IT2RingRigOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = 'it2-ring-rig';

  // Mount centered at the bullseye height, flush with the dartboard face
  root.position.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 0.0);

  // In Node/test environments where fetch or window is unavailable, return initialized group
  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return root;
  }

  const baseUrl = (import.meta as any).env?.BASE_URL || './';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  const modelUrl = options.modelUrl || `${cleanBase}models/it2_assembly.glb`;

  // Realistic architectural matte black PETG polymer material
  const rigMaterial = new THREE.MeshStandardMaterial({
    color: 0x181a20,
    roughness: 0.52,
    metalness: 0.15,
    envMapIntensity: 0.8
  });

  const loader = new GLTFLoader();
  loader.load(
    modelUrl,
    (gltf) => {
      const model = gltf.scene;
      model.name = 'it2-ring-model';

      // Convert CAD millimeter coordinates to meters
      model.scale.set(0.001, 0.001, 0.001);

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = rigMaterial;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });

      root.add(model);
      if (options.onLoaded) {
        options.onLoaded(root);
      }
    },
    undefined,
    (err) => {
      console.warn('Failed to load IT2 assembly model:', err);
    }
  );

  return root;
}
