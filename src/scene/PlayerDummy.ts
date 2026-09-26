import * as THREE from 'three';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';

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
 * Builds a clean, cohesive architectural 3D Player Mannequin.
 * Height: 1.78m (5' 10") average adult male stature.
 * Stance: Clean tournament stance at throw line (Z = 2.37m).
 * Architecture: Seamless connected capsules with zero disjointed floating parts.
 */
export function createPlayerDummyGroup(): THREE.Group {
  const dummy = new THREE.Group();
  dummy.name = 'player-dummy';

  // Uniform studio matte mannequin material (soft slate grey, smooth shading)
  const mannequinMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // clean neutral slate
    roughness: 0.45,
    metalness: 0.08,
    transparent: true,
    opacity: 0.85
  });

  const jointMat = new THREE.MeshStandardMaterial({
    color: 0x64748b, // subtle darker joint tone
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

  // Reference coordinates
  const leadZ = DARTS_DIMENSIONS.OCHE_DISTANCE_METERS; // 2.37m
  const footLen = 0.26;
  const footWidth = 0.09;
  const footHeight = 0.06;

  // 1. FEET (Flat on floor, lead foot front tip at Z = 2.37m)
  // Lead Foot (Right foot)
  const leadFootGeom = new THREE.BoxGeometry(footWidth, footHeight, footLen);
  const leadFoot = new THREE.Mesh(leadFootGeom, mannequinMat);
  leadFoot.name = 'dummy-lead-foot';
  // Center Z is 2.37 + footLen/2 so min Z is exactly 2.37m
  leadFoot.position.set(0.08, footHeight / 2 + 0.001, leadZ + footLen / 2);
  leadFoot.castShadow = true;
  leadFoot.receiveShadow = true;
  dummy.add(leadFoot);

  // Rear Foot (Left foot, angled naturally back)
  const rearFootGeom = new THREE.BoxGeometry(footWidth, footHeight, footLen);
  const rearFoot = new THREE.Mesh(rearFootGeom, mannequinMat);
  rearFoot.name = 'dummy-rear-foot';
  rearFoot.rotation.y = -Math.PI / 6;
  rearFoot.position.set(-0.16, footHeight / 2 + 0.001, leadZ + 0.28);
  rearFoot.castShadow = true;
  rearFoot.receiveShadow = true;
  dummy.add(rearFoot);

  // 2. SKELETON JOINT KEYPOINTS (Aligned to central spine plane at leadZ + 0.18)
  const spineZ = leadZ + 0.18;

  const rAnkle = new THREE.Vector3(0.08, 0.07, spineZ);
  const lAnkle = new THREE.Vector3(-0.14, 0.07, spineZ + 0.08);

  const rKnee = new THREE.Vector3(0.08, 0.49, spineZ);
  const lKnee = new THREE.Vector3(-0.12, 0.49, spineZ + 0.04);

  const rHip = new THREE.Vector3(0.10, 0.90, spineZ);
  const lHip = new THREE.Vector3(-0.10, 0.90, spineZ);

  const rShoulder = new THREE.Vector3(0.18, 1.42, spineZ);
  const lShoulder = new THREE.Vector3(-0.18, 1.42, spineZ);
  const headCenter = new THREE.Vector3(0.0, 1.67, spineZ);

  // 3. LEGS (Seamless connecting capsules)
  // Shins / Calves
  dummy.add(createConnectedLimb(rAnkle, rKnee, 0.044, mannequinMat, 'dummy-right-shin'));
  dummy.add(createConnectedLimb(lAnkle, lKnee, 0.044, mannequinMat, 'dummy-left-shin'));

  // Knee joint spheres
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

  // Hip joint spheres
  const hipGeom = new THREE.SphereGeometry(0.052, 16, 16);
  const rHipMesh = new THREE.Mesh(hipGeom, jointMat);
  rHipMesh.position.copy(rHip);
  dummy.add(rHipMesh);

  const lHipMesh = new THREE.Mesh(hipGeom, jointMat);
  lHipMesh.position.copy(lHip);
  dummy.add(lHipMesh);

  // 4. TORSO (Single unified anatomical piece from hips to shoulders)
  // Clean continuous anatomical capsule: broader across chest/shoulders, flatter front-to-back
  const torsoGeom = new THREE.CapsuleGeometry(0.13, 0.32, 12, 24);
  torsoGeom.scale(1.28, 1.0, 0.84);
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

  // Head (Smooth anatomical egg/capsule shape, top reaches exactly 1.78m)
  const headGroup = new THREE.Group();
  headGroup.name = 'dummy-head';

  // Radius 0.082m, length 0.056m -> height = 0.056 + 2*0.082 = 0.22m
  // Centered at Y = 1.67m -> top reaches 1.67 + 0.11 = 1.78m!
  const headGeom = new THREE.CapsuleGeometry(0.082, 0.056, 12, 24);
  const headMesh = new THREE.Mesh(headGeom, mannequinMat);
  headMesh.position.copy(headCenter);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Subtle clean eye line / brow feature
  const browGeom = new THREE.BoxGeometry(0.11, 0.014, 0.04);
  const browMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const browMesh = new THREE.Mesh(browGeom, browMat);
  browMesh.position.set(headCenter.x, 1.67, headCenter.z - 0.075);
  headGroup.add(browMesh);

  dummy.add(headGroup);

  // 6. SHOULDERS
  const shoulderGeom = new THREE.SphereGeometry(0.048, 16, 16);
  const rShoulderMesh = new THREE.Mesh(shoulderGeom, jointMat);
  rShoulderMesh.position.copy(rShoulder);
  dummy.add(rShoulderMesh);

  const lShoulderMesh = new THREE.Mesh(shoulderGeom, jointMat);
  lShoulderMesh.position.copy(lShoulder);
  dummy.add(lShoulderMesh);

  // 7. LEFT ARM (Rests cleanly at player's side)
  const lElbow = new THREE.Vector3(-0.19, 1.15, spineZ);
  const lWrist = new THREE.Vector3(-0.19, 0.88, spineZ);

  dummy.add(createConnectedLimb(lShoulder, lElbow, 0.038, mannequinMat, 'dummy-left-upper-arm'));
  const lElbowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.036, 16, 16), jointMat);
  lElbowMesh.position.copy(lElbow);
  dummy.add(lElbowMesh);

  dummy.add(createConnectedLimb(lElbow, lWrist, 0.032, mannequinMat, 'dummy-left-forearm'));
  const lHandMesh = new THREE.Mesh(new THREE.SphereGeometry(0.032, 16, 16), jointMat);
  lHandMesh.position.copy(lWrist);
  dummy.add(lHandMesh);

  // 8. RIGHT ARM (Throwing stance: raised smoothly towards board)
  const throwingArmGroup = new THREE.Group();
  throwingArmGroup.name = 'dummy-throwing-arm';

  // Elbow poised forward at chest height
  const rElbow = new THREE.Vector3(0.16, 1.38, spineZ - 0.22);
  // Wrist / hand at eye level release point
  const rWrist = new THREE.Vector3(0.08, 1.58, spineZ - 0.34);

  // Upper arm capsule
  throwingArmGroup.add(createConnectedLimb(rShoulder, rElbow, 0.038, mannequinMat));

  // Elbow joint
  const rElbowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.036, 16, 16), jointMat);
  rElbowMesh.position.copy(rElbow);
  throwingArmGroup.add(rElbowMesh);

  // Forearm capsule
  throwingArmGroup.add(createConnectedLimb(rElbow, rWrist, 0.032, mannequinMat));

  // Hand
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
