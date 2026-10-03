import * as THREE from 'three';

/**
 * Creates the floating pivot orb group indicating the 3D focal point
 * that the camera rotates / orbits around in the room.
 */
export function createPivotOrbGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'pivot-orb-group';

  // 1. Center glowing sphere
  const sphereGeom = new THREE.SphereGeometry(0.038, 24, 24);
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 2.0,
    roughness: 0.15,
    metalness: 0.85,
    transparent: true,
    opacity: 0.95
  });
  const sphereMesh = new THREE.Mesh(sphereGeom, sphereMat);
  sphereMesh.name = 'pivot-orb-sphere';
  group.add(sphereMesh);

  // 2. Horizontal orientation ring
  const ringGeom = new THREE.RingGeometry(0.05, 0.065, 32);
  ringGeom.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7
  });
  const ringMesh = new THREE.Mesh(ringGeom, ringMat);
  ringMesh.name = 'pivot-orb-ring';
  group.add(ringMesh);

  // 3. Projected floor spot
  const floorSpotGeom = new THREE.RingGeometry(0.04, 0.07, 24);
  floorSpotGeom.rotateX(-Math.PI / 2);
  const floorSpotMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.55
  });
  const floorSpot = new THREE.Mesh(floorSpotGeom, floorSpotMat);
  floorSpot.name = 'pivot-orb-floor';
  group.add(floorSpot);

  return group;
}

/**
 * Creates the standing position marker showing where the user is
 * physically standing in the room on the floor with facing direction.
 */
export function createStandingMarkerGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'standing-marker-group';

  // Floor glowing ring where user stands
  const ringGeom = new THREE.RingGeometry(0.12, 0.16, 32);
  ringGeom.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xfacc15, // vibrant gold
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8
  });
  const ring = new THREE.Mesh(ringGeom, ringMat);
  ring.name = 'standing-ring';
  ring.position.y = 0.003;
  group.add(ring);

  // Forward gaze indicator arrow on the floor
  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(0, 0.18);
  arrowShape.lineTo(0.05, 0.11);
  arrowShape.lineTo(-0.05, 0.11);
  arrowShape.closePath();
  const arrowGeom = new THREE.ShapeGeometry(arrowShape);
  arrowGeom.rotateX(-Math.PI / 2);
  const arrowMat = new THREE.MeshBasicMaterial({
    color: 0xfacc15,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9
  });
  const arrow = new THREE.Mesh(arrowGeom, arrowMat);
  arrow.name = 'standing-arrow';
  arrow.position.y = 0.004;
  group.add(arrow);

  return group;
}
