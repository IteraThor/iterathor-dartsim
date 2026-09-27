import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';

export interface IT2RingRigOptions {
  modelUrl?: string;
  rotationZ?: number;
  onLoaded?: (group: THREE.Group) => void;
}

export interface IT2RingRigGroup extends THREE.Group {
  setRingLightEnabled: (enabled: boolean) => void;
  isRingLightEnabled: () => boolean;
  toggleRingLight: () => boolean;
  setRingLightIntensity: (factor: number) => void;
  getRingLightIntensity: () => number;
}

/**
 * Creates the IT2 3-Camera Darts Ring Rig assembly mounted around the dartboard.
 * Sourced directly from IT2 Assembly CAD geometry with 3 camera pods at 120° intervals
 * and an integrated 360° shadowless LED ring light illuminating the dartboard face.
 */
export function createIT2RingRigGroup(options: IT2RingRigOptions = {}): IT2RingRigGroup {
  const root = new THREE.Group() as IT2RingRigGroup;
  root.name = 'it2-ring-rig';

  // 90° counterclockwise default rotation around Z-axis (aligns mounting arms to 0°, 120°, 240°)
  const defaultRotZ = options.rotationZ !== undefined ? options.rotationZ : Math.PI / 2;
  root.userData.rotationZ = defaultRotZ;

  // Mount centered at the bullseye height, flush against the back wall (Z = -0.038m)
  root.position.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, -DARTS_DIMENSIONS.BOARD_THICKNESS_METERS);

  // -------------------------------------------------------------
  // 360° Continuous COB LED Strip & Physical Light Emitters
  // Sits in the CAD ring's inner rim channel (radius 343mm, Z = 173mm)
  // -------------------------------------------------------------
  const stripRadius = 0.343;
  const stripWidth = 0.007; // 7mm width recessed inside ring channel
  const ringZ = 0.173; // CAD Z position in meters

  // 1. Emissive High-CRI LED Core Strip
  const stripGeom = new THREE.CylinderGeometry(stripRadius, stripRadius, stripWidth, 96, 1, true);
  stripGeom.rotateX(Math.PI / 2);
  stripGeom.translate(0, 0, ringZ);

  const stripMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xf6faff,
    emissiveIntensity: 1.8,
    roughness: 0.25,
    metalness: 0.1,
    side: THREE.DoubleSide,
    toneMapped: true
  });
  const ledStripMesh = new THREE.Mesh(stripGeom, stripMat);
  ledStripMesh.name = 'it2-led-strip';
  root.add(ledStripMesh);

  // 2. Frosted Silicone Diffuser Lip for realistic soft glow
  const diffuserRadius = 0.342;
  const diffuserWidth = 0.008;
  const diffuserGeom = new THREE.CylinderGeometry(diffuserRadius, diffuserRadius, diffuserWidth, 96, 1, true);
  diffuserGeom.rotateX(Math.PI / 2);
  diffuserGeom.translate(0, 0, ringZ);

  const diffuserMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.65,
    roughness: 0.5,
    side: THREE.DoubleSide
  });
  const diffuserMesh = new THREE.Mesh(diffuserGeom, diffuserMat);
  diffuserMesh.name = 'it2-led-diffuser';
  root.add(diffuserMesh);

  // 3. 12 Symmetrical 360° Point Light Emitters for true shadowless illumination
  const lightGroup = new THREE.Group();
  lightGroup.name = 'it2-ring-light-group';

  const lights: THREE.PointLight[] = [];
  const lightCount = 12;
  const lightRadius = 0.338; // 338mm (just inside the LED channel)
  const lightZ = 0.170; // 170mm (132mm in front of board face)
  const baseIntensity = 0.14; // Soft, realistic, non-glaring illumination
  const lightColor = 0xf6faff; // 5700K tournament cool daylight

  for (let i = 0; i < lightCount; i++) {
    const angle = (i / lightCount) * Math.PI * 2;
    const x = lightRadius * Math.cos(angle);
    const y = lightRadius * Math.sin(angle);

    const light = new THREE.PointLight(lightColor, baseIntensity, 0.95, 2.0);
    light.name = `it2-led-light-${i}`;
    light.position.set(x, y, lightZ);
    light.castShadow = false; // Zero directional shadows; 360° light cross-cancels shadows
    lightGroup.add(light);
    lights.push(light);
  }
  root.add(lightGroup);

  // Light State & Controller Methods
  let isLightEnabled = true;
  let intensityFactor = 1.0;

  const updateLights = () => {
    const factor = isLightEnabled ? intensityFactor : 0.0;
    stripMat.emissiveIntensity = 1.8 * factor;
    diffuserMat.emissiveIntensity = 0.6 * factor;
    stripMat.needsUpdate = true;
    diffuserMat.needsUpdate = true;
    lights.forEach((l) => {
      l.intensity = baseIntensity * factor;
    });
  };

  root.setRingLightEnabled = (enabled: boolean) => {
    isLightEnabled = enabled;
    updateLights();
  };

  root.isRingLightEnabled = () => isLightEnabled;

  root.toggleRingLight = () => {
    isLightEnabled = !isLightEnabled;
    updateLights();
    return isLightEnabled;
  };

  root.setRingLightIntensity = (factor: number) => {
    intensityFactor = Math.max(0, Math.min(3, factor));
    updateLights();
  };

  root.getRingLightIntensity = () => intensityFactor;

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

      // Rotate 90 degrees counterclockwise around board center (Z-axis)
      model.rotation.z = defaultRotZ;

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) {
            mesh.geometry.computeVertexNormals();
          }
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
