import * as THREE from 'three';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';

/**
 * Creates an anatomical shoe/foot geometry with a curved toe cap,
 * sloping instep, flat sole, and smooth beveled edges.
 * Local bounding box: flat sole at Y = 0, front toe tip at Z = 0, width centered at X = 0.
 */
function createShoeGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  // Side profile in (Length, Height): X is length from toe (0) to heel (0.245m), Y is height (0 to 0.055m)
  shape.moveTo(0.01, 0.002);
  shape.lineTo(0.24, 0.002);
  // Heel back curve
  shape.quadraticCurveTo(0.25, 0.03, 0.24, 0.055);
  // Ankle collar
  shape.lineTo(0.14, 0.055);
  // Instep slope to toe
  shape.quadraticCurveTo(0.08, 0.036, 0.02, 0.022);
  // Toe cap roundover
  shape.quadraticCurveTo(0.002, 0.01, 0.01, 0.002);

  const extrudeWidth = 0.076;
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: extrudeWidth,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.004,
    bevelThickness: 0.004
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  // Rotate so length is along +Z, height is along +Y, width is along X
  geom.rotateY(-Math.PI / 2);
  geom.translate(extrudeWidth / 2 + 0.004, 0, 0);

  // Align so min.z is exactly 0 and min.y is exactly 0
  geom.computeBoundingBox();
  if (geom.boundingBox) {
    geom.translate(0, -geom.boundingBox.min.y, -geom.boundingBox.min.z);
  }
  return geom;
}

/**
 * Creates a clean, mathematically aligned capsule limb connecting p1 and p2.
 */
function createConnectedLimb(
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  radius: number,
  material: THREE.Material,
  name?: string
): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const length = dir.length();
  const cylinderLength = Math.max(0.001, length - 2 * radius);

  const geom = new THREE.CapsuleGeometry(radius, cylinderLength, 8, 16);
  const mesh = new THREE.Mesh(geom, material);
  if (name) mesh.name = name;

  // Position at midpoint
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  mesh.position.copy(mid);

  // Align with vector p1 -> p2
  const up = new THREE.Vector3(0, 1, 0);
  const norm = dir.clone().normalize();
  if (Math.abs(up.dot(norm)) < 0.9999) {
    mesh.quaternion.setFromUnitVectors(up, norm);
  } else if (norm.y < 0) {
    mesh.rotation.x = Math.PI;
  }

  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Builds a clean, cohesive architectural 3D Player Mannequin standing straight at the throw line.
 * Height: 1.78m average adult male stature.
 * Stance: Straight, balanced, upright standing stance with both feet parallel at Z = 2.37m.
 */
export function createPlayerDummyGroup(): THREE.Group {
  const dummy = new THREE.Group();
  dummy.name = 'player-dummy';

  // Uniform studio matte mannequin material (soft neutral slate)
  const mannequinMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.45,
    metalness: 0.08,
    transparent: true,
    opacity: 0.85
  });

  const jointMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.35,
    metalness: 0.15,
    transparent: true,
    opacity: 0.9
  });

  const dartMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.3,
    metalness: 0.85
  });

  // Reference coordinates: throw line at Z = 2.37m, central spine line at Z = 2.54m
  const leadZ = DARTS_DIMENSIONS.OCHE_DISTANCE_METERS; // 2.370m
  const spineZ = leadZ + 0.170; // 2.540m (ankle position above heel)

  // 1. FEET (Anatomical beveled shoes resting flat on floor, toes flush at Z = 2.37m)
  const shoeGeom = createShoeGeometry();

  // Right Foot
  const rightFoot = new THREE.Mesh(shoeGeom, mannequinMat);
  rightFoot.name = 'dummy-lead-foot';
  rightFoot.position.set(0.11, 0, leadZ);
  rightFoot.castShadow = true;
  rightFoot.receiveShadow = true;
  dummy.add(rightFoot);

  // Left Foot (Straight, parallel, shoulder-width stance)
  const leftFoot = new THREE.Mesh(shoeGeom, mannequinMat);
  leftFoot.name = 'dummy-left-foot';
  leftFoot.position.set(-0.11, 0, leadZ);
  leftFoot.castShadow = true;
  leftFoot.receiveShadow = true;
  dummy.add(leftFoot);

  // 2. SKELETON JOINT KEYPOINTS (Straight vertical standing posture)
  const rAnkle = new THREE.Vector3(0.11, 0.07, spineZ);
  const lAnkle = new THREE.Vector3(-0.11, 0.07, spineZ);

  const rKnee = new THREE.Vector3(0.11, 0.49, spineZ);
  const lKnee = new THREE.Vector3(-0.11, 0.49, spineZ);

  const rHip = new THREE.Vector3(0.10, 0.90, spineZ);
  const lHip = new THREE.Vector3(-0.10, 0.90, spineZ);

  const rShoulder = new THREE.Vector3(0.18, 1.42, spineZ);
  const lShoulder = new THREE.Vector3(-0.18, 1.42, spineZ);
  const headCenter = new THREE.Vector3(0.0, 1.67, spineZ);

  // 3. LEGS (Straight, parallel vertical limbs)
  // Shins
  dummy.add(createConnectedLimb(rAnkle, rKnee, 0.044, mannequinMat, 'dummy-right-shin'));
  dummy.add(createConnectedLimb(lAnkle, lKnee, 0.044, mannequinMat, 'dummy-left-shin'));

  // Knee joints
  const kneeGeom = new THREE.SphereGeometry(0.046, 16, 16);
  const rKneeMesh = new THREE.Mesh(kneeGeom, jointMat);
  rKneeMesh.position.copy(rKnee);
  dummy.add(rKneeMesh);

  const lKneeMesh = new THREE.Mesh(kneeGeom, jointMat);
  lKneeMesh.position.copy(lKnee);
  dummy.add(lKneeMesh);

  // Thighs
  dummy.add(createConnectedLimb(rKnee, rHip, 0.055, mannequinMat, 'dummy-right-thigh'));
  dummy.add(createConnectedLimb(lKnee, lHip, 0.055, mannequinMat, 'dummy-left-thigh'));

  // Hip joints
  const hipGeom = new THREE.SphereGeometry(0.052, 16, 16);
  const rHipMesh = new THREE.Mesh(hipGeom, jointMat);
  rHipMesh.position.copy(rHip);
  dummy.add(rHipMesh);

  const lHipMesh = new THREE.Mesh(hipGeom, jointMat);
  lHipMesh.position.copy(lHip);
  dummy.add(lHipMesh);

  // 4. TORSO (Single continuous anatomical piece from hips to shoulders)
  const torsoGeom = new THREE.CapsuleGeometry(0.13, 0.32, 12, 24);
  torsoGeom.scale(1.28, 1.0, 0.84); // broader shoulders/chest, flatter depth front-to-back
  const torsoMesh = new THREE.Mesh(torsoGeom, mannequinMat);
  torsoMesh.name = 'dummy-torso';
  torsoMesh.position.set(0.0, 1.17, spineZ);
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  dummy.add(torsoMesh);

  // 5. NECK & HEAD
  // Neck
  const neckGeom = new THREE.CylinderGeometry(0.045, 0.052, 0.10, 16);
  const neckMesh = new THREE.Mesh(neckGeom, mannequinMat);
  neckMesh.position.set(0.0, 1.50, spineZ);
  dummy.add(neckMesh);

  // Head (Smooth anatomical cranium reaching exactly 1.78m)
  const headGroup = new THREE.Group();
  headGroup.name = 'dummy-head';

  const headGeom = new THREE.CapsuleGeometry(0.082, 0.056, 12, 24);
  const headMesh = new THREE.Mesh(headGeom, mannequinMat);
  headMesh.position.copy(headCenter);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  dummy.add(headGroup);

  // 6. SHOULDERS
  const shoulderGeom = new THREE.SphereGeometry(0.048, 16, 16);
  const rShoulderMesh = new THREE.Mesh(shoulderGeom, jointMat);
  rShoulderMesh.position.copy(rShoulder);
  dummy.add(rShoulderMesh);

  const lShoulderMesh = new THREE.Mesh(shoulderGeom, jointMat);
  lShoulderMesh.position.copy(lShoulder);
  dummy.add(lShoulderMesh);

  // 7. LEFT ARM (Hanging straight down along the left side)
  const lElbow = new THREE.Vector3(-0.18, 1.15, spineZ);
  const lWrist = new THREE.Vector3(-0.18, 0.88, spineZ);

  dummy.add(createConnectedLimb(lShoulder, lElbow, 0.038, mannequinMat, 'dummy-left-upper-arm'));
  const lElbowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.036, 16, 16), jointMat);
  lElbowMesh.position.copy(lElbow);
  dummy.add(lElbowMesh);

  dummy.add(createConnectedLimb(lElbow, lWrist, 0.032, mannequinMat, 'dummy-left-forearm'));
  const lHandMesh = new THREE.Mesh(new THREE.SphereGeometry(0.032, 16, 16), jointMat);
  lHandMesh.position.copy(lWrist);
  dummy.add(lHandMesh);

  // 8. RIGHT ARM (Throwing stance: raised smoothly in the forward vertical plane)
  const throwingArmGroup = new THREE.Group();
  throwingArmGroup.name = 'dummy-throwing-arm';

  const rElbow = new THREE.Vector3(0.18, 1.38, spineZ - 0.22);
  const rWrist = new THREE.Vector3(0.14, 1.58, spineZ - 0.34);

  throwingArmGroup.add(createConnectedLimb(rShoulder, rElbow, 0.038, mannequinMat));

  const rElbowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.036, 16, 16), jointMat);
  rElbowMesh.position.copy(rElbow);
  throwingArmGroup.add(rElbowMesh);

  throwingArmGroup.add(createConnectedLimb(rElbow, rWrist, 0.032, mannequinMat));

  const rHandMesh = new THREE.Mesh(new THREE.SphereGeometry(0.032, 16, 16), jointMat);
  rHandMesh.position.copy(rWrist);
  throwingArmGroup.add(rHandMesh);

  // Dart held in hand
  const dartGeom = new THREE.CylinderGeometry(0.0035, 0.0035, 0.08, 12);
  dartGeom.rotateX(Math.PI / 2);
  const dartMesh = new THREE.Mesh(dartGeom, dartMat);
  dartMesh.position.set(rWrist.x, rWrist.y + 0.015, rWrist.z - 0.04);
  throwingArmGroup.add(dartMesh);

  dummy.add(throwingArmGroup);

  return dummy;
}
