import * as THREE from 'three';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';

/**
 * Creates a stylized architectural 3D Player Mannequin positioned at the throw line.
 * Stature: Average adult male height 1.78m (5' 10"), eye height ~1.67m.
 * Stance: Standard tournament side-on darts stance with lead foot at Z = 2.37m
 * and right arm in throwing position.
 */
export function createPlayerDummyGroup(): THREE.Group {
  const dummy = new THREE.Group();
  dummy.name = 'player-dummy';

  // 1. Mannequin Materials (Sleek semi-translucent studio CAD style)
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // studio slate
    roughness: 0.32,
    metalness: 0.15,
    transparent: true,
    opacity: 0.85
  });

  const jointMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8, // cyan architectural joint accent
    roughness: 0.22,
    metalness: 0.75,
    transparent: true,
    opacity: 0.92
  });

  const dartMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37, // brass dart barrel
    roughness: 0.25,
    metalness: 0.9
  });

  const flightMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // cyan dart flights
    roughness: 0.3,
    metalness: 0.1
  });

  // Base coordinate reference for player
  // Lead foot front edge aligns exactly with Z = 2.37m
  const leadZFront = DARTS_DIMENSIONS.OCHE_DISTANCE_METERS; // 2.37m
  const footLength = 0.27; // 27cm shoe
  const footWidth = 0.10;
  const footHeight = 0.07;

  // 2. Feet (Lead Right Foot & Rear Left Foot)
  // Lead foot (Right): pointing forward/slightly angled along the oche line
  const leadFootGeom = new THREE.BoxGeometry(footWidth, footHeight, footLength);
  const leadFoot = new THREE.Mesh(leadFootGeom, bodyMat);
  leadFoot.name = 'dummy-lead-foot';
  // Position so front face (min Z) is at exactly 2.37m
  leadFoot.position.set(0.06, footHeight / 2 + 0.002, leadZFront + footLength / 2);
  leadFoot.castShadow = true;
  leadFoot.receiveShadow = true;
  dummy.add(leadFoot);

  // Rear foot (Left): balanced behind at an angle
  const rearFootGeom = new THREE.BoxGeometry(footWidth, footHeight, footLength);
  const rearFoot = new THREE.Mesh(rearFootGeom, bodyMat);
  rearFoot.name = 'dummy-rear-foot';
  rearFoot.rotation.y = -Math.PI / 4;
  rearFoot.position.set(-0.16, footHeight / 2 + 0.002, leadZFront + 0.32);
  rearFoot.castShadow = true;
  rearFoot.receiveShadow = true;
  dummy.add(rearFoot);

  // Ankle Joints
  const ankleGeom = new THREE.SphereGeometry(0.042, 16, 16);
  const rightAnkle = new THREE.Mesh(ankleGeom, jointMat);
  rightAnkle.position.set(0.06, 0.09, leadFoot.position.z);
  dummy.add(rightAnkle);

  const leftAnkle = new THREE.Mesh(ankleGeom, jointMat);
  leftAnkle.position.set(-0.16, 0.09, rearFoot.position.z);
  dummy.add(leftAnkle);

  // 3. Lower Legs (Calves) & Knees
  const calfGeom = new THREE.CylinderGeometry(0.048, 0.042, 0.42, 16);
  const rightCalf = new THREE.Mesh(calfGeom, bodyMat);
  rightCalf.position.set(0.06, 0.31, leadFoot.position.z - 0.02);
  rightCalf.castShadow = true;
  dummy.add(rightCalf);

  const leftCalf = new THREE.Mesh(calfGeom, bodyMat);
  leftCalf.position.set(-0.16, 0.31, rearFoot.position.z);
  leftCalf.castShadow = true;
  dummy.add(leftCalf);

  const kneeGeom = new THREE.SphereGeometry(0.048, 16, 16);
  const rightKnee = new THREE.Mesh(kneeGeom, jointMat);
  rightKnee.position.set(0.06, 0.53, leadFoot.position.z - 0.02);
  dummy.add(rightKnee);

  const leftKnee = new THREE.Mesh(kneeGeom, jointMat);
  leftKnee.position.set(-0.16, 0.53, rearFoot.position.z);
  dummy.add(leftKnee);

  // 4. Thighs & Pelvis
  const thighGeom = new THREE.CylinderGeometry(0.062, 0.05, 0.42, 16);
  const rightThigh = new THREE.Mesh(thighGeom, bodyMat);
  rightThigh.position.set(0.05, 0.75, leadFoot.position.z + 0.01);
  rightThigh.castShadow = true;
  dummy.add(rightThigh);

  const leftThigh = new THREE.Mesh(thighGeom, bodyMat);
  leftThigh.position.set(-0.12, 0.75, rearFoot.position.z - 0.04);
  leftThigh.castShadow = true;
  dummy.add(leftThigh);

  // Pelvis / Hips
  const pelvisGeom = new THREE.BoxGeometry(0.32, 0.16, 0.20);
  const pelvis = new THREE.Mesh(pelvisGeom, bodyMat);
  pelvis.name = 'dummy-pelvis';
  pelvis.position.set(-0.03, 0.98, leadFoot.position.z + 0.03);
  pelvis.rotation.y = -Math.PI / 10;
  pelvis.castShadow = true;
  dummy.add(pelvis);

  // 5. Torso (Lower Abdomen & Upper Chest)
  const torsoGroup = new THREE.Group();
  torsoGroup.name = 'dummy-torso';

  const abdomenGeom = new THREE.CylinderGeometry(0.13, 0.14, 0.20, 16);
  const abdomen = new THREE.Mesh(abdomenGeom, bodyMat);
  abdomen.position.set(-0.02, 1.14, leadFoot.position.z + 0.02);
  abdomen.castShadow = true;
  torsoGroup.add(abdomen);

  const chestGeom = new THREE.BoxGeometry(0.38, 0.26, 0.22);
  const chest = new THREE.Mesh(chestGeom, bodyMat);
  chest.position.set(-0.01, 1.36, leadFoot.position.z + 0.01);
  chest.rotation.y = -Math.PI / 8; // side-on throwing angle
  chest.castShadow = true;
  torsoGroup.add(chest);

  dummy.add(torsoGroup);

  // 6. Shoulders, Neck & Head
  const shoulderGeom = new THREE.SphereGeometry(0.052, 16, 16);

  // Right shoulder (aiming side)
  const rightShoulder = new THREE.Mesh(shoulderGeom, jointMat);
  rightShoulder.position.set(0.16, 1.48, leadFoot.position.z - 0.02);
  dummy.add(rightShoulder);

  // Left shoulder (back side)
  const leftShoulder = new THREE.Mesh(shoulderGeom, jointMat);
  leftShoulder.position.set(-0.19, 1.48, leadFoot.position.z + 0.08);
  dummy.add(leftShoulder);

  // Neck
  const neckGeom = new THREE.CylinderGeometry(0.055, 0.065, 0.10, 16);
  const neck = new THREE.Mesh(neckGeom, bodyMat);
  neck.position.set(-0.01, 1.53, leadFoot.position.z + 0.01);
  dummy.add(neck);

  // Head (stylized cranium centered at Y = 1.68m, top at 1.78m)
  const headGroup = new THREE.Group();
  headGroup.name = 'dummy-head';

  const headCraniumGeom = new THREE.SphereGeometry(0.10, 24, 24);
  headCraniumGeom.scale(0.85, 1.0, 1.05);
  const cranium = new THREE.Mesh(headCraniumGeom, bodyMat);
  // Center at Y = 1.68m -> radius 0.10m means top is at 1.78m exact!
  cranium.position.set(-0.01, 1.68, leadFoot.position.z + 0.01);
  cranium.rotation.y = -Math.PI / 18; // turned slightly toward board
  cranium.castShadow = true;
  headGroup.add(cranium);

  // Stylized eye visor bar indicating eye level (~1.67m)
  const visorGeom = new THREE.BoxGeometry(0.13, 0.018, 0.06);
  const visorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const visor = new THREE.Mesh(visorGeom, visorMat);
  visor.position.set(-0.01, 1.67, leadFoot.position.z - 0.075);
  headGroup.add(visor);

  dummy.add(headGroup);

  // 7. Left Arm (Relaxed / Rested)
  const armGeom = new THREE.CylinderGeometry(0.04, 0.035, 0.28, 16);
  const leftUpperArm = new THREE.Mesh(armGeom, bodyMat);
  leftUpperArm.position.set(-0.21, 1.34, leadFoot.position.z + 0.08);
  dummy.add(leftUpperArm);

  const leftElbow = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 16), jointMat);
  leftElbow.position.set(-0.22, 1.19, leadFoot.position.z + 0.07);
  dummy.add(leftElbow);

  const leftForearm = new THREE.Mesh(armGeom, bodyMat);
  leftForearm.position.set(-0.20, 1.05, leadFoot.position.z + 0.04);
  dummy.add(leftForearm);

  // 8. Right Arm (Active Throwing Stance Aiming at Board)
  const throwingArmGroup = new THREE.Group();
  throwingArmGroup.name = 'dummy-throwing-arm';

  // Upper arm raised forward
  const rightUpperArmGeom = new THREE.CylinderGeometry(0.042, 0.038, 0.28, 16);
  rightUpperArmGeom.rotateX(Math.PI / 5);
  const rightUpperArm = new THREE.Mesh(rightUpperArmGeom, bodyMat);
  rightUpperArm.position.set(0.15, 1.42, leadFoot.position.z - 0.12);
  rightUpperArm.castShadow = true;
  throwingArmGroup.add(rightUpperArm);

  // Right Elbow joint
  const rightElbow = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), jointMat);
  rightElbow.position.set(0.14, 1.37, leadFoot.position.z - 0.22);
  throwingArmGroup.add(rightElbow);

  // Forearm angled up toward eye-line release point
  const rightForearmGeom = new THREE.CylinderGeometry(0.036, 0.032, 0.26, 16);
  rightForearmGeom.rotateX(-Math.PI / 4);
  const rightForearm = new THREE.Mesh(rightForearmGeom, bodyMat);
  rightForearm.position.set(0.10, 1.49, leadFoot.position.z - 0.24);
  rightForearm.castShadow = true;
  throwingArmGroup.add(rightForearm);

  // Hand holding dart
  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.034, 16, 16), jointMat);
  rightHand.position.set(0.07, 1.60, leadFoot.position.z - 0.24);
  throwingArmGroup.add(rightHand);

  // Miniature brass dart poised at release height
  const dartBarrelGeom = new THREE.CylinderGeometry(0.0035, 0.0035, 0.05, 12);
  dartBarrelGeom.rotateX(Math.PI / 2);
  const dartBarrel = new THREE.Mesh(dartBarrelGeom, dartMat);
  dartBarrel.position.set(0.07, 1.62, leadFoot.position.z - 0.27);
  throwingArmGroup.add(dartBarrel);

  const dartFlightGeom = new THREE.BoxGeometry(0.024, 0.024, 0.02);
  const dartFlight = new THREE.Mesh(dartFlightGeom, flightMat);
  dartFlight.position.set(0.07, 1.62, leadFoot.position.z - 0.24);
  throwingArmGroup.add(dartFlight);

  dummy.add(throwingArmGroup);

  return dummy;
}
