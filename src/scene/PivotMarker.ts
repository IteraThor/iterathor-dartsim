import * as THREE from 'three';

/**
 * Creates the high-visibility floating pivot orb group indicating the 3D focal point
 * that the camera rotates / orbits around in the room.
 */
export function createPivotOrbGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'pivot-orb-group';

  // 1. Center glowing sphere - large, vibrant, and always visible
  const sphereGeom = new THREE.SphereGeometry(0.065, 32, 32);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.95
  });
  const sphereMesh = new THREE.Mesh(sphereGeom, sphereMat);
  sphereMesh.name = 'pivot-orb-sphere';
  sphereMesh.renderOrder = 998;
  group.add(sphereMesh);

  // 2. Outer pulsing translucent aura sphere
  const auraGeom = new THREE.SphereGeometry(0.09, 24, 24);
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35,
    wireframe: true
  });
  const auraMesh = new THREE.Mesh(auraGeom, auraMat);
  auraMesh.name = 'pivot-orb-aura';
  group.add(auraMesh);

  // 3. Horizontal orientation ring
  const ringGeom = new THREE.RingGeometry(0.08, 0.11, 32);
  ringGeom.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8
  });
  const ringMesh = new THREE.Mesh(ringGeom, ringMat);
  ringMesh.name = 'pivot-orb-ring';
  group.add(ringMesh);

  // 4. Vertical dashed beacon line from orb down to floor
  const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -3.2, 0)];
  const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
  const lineMat = new THREE.LineDashedMaterial({
    color: 0x00e5ff,
    dashSize: 0.08,
    gapSize: 0.05,
    transparent: true,
    opacity: 0.65
  });
  const line = new THREE.Line(lineGeom, lineMat);
  line.computeLineDistances();
  line.name = 'pivot-orb-line';
  group.add(line);

  // 5. Projected floor spot
  const floorSpotGeom = new THREE.RingGeometry(0.08, 0.14, 32);
  floorSpotGeom.rotateX(-Math.PI / 2);
  const floorSpotMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75
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
  const ringGeom = new THREE.RingGeometry(0.16, 0.22, 32);
  ringGeom.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xfacc15, // vibrant gold
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85
  });
  const ring = new THREE.Mesh(ringGeom, ringMat);
  ring.name = 'standing-ring';
  ring.position.y = 0.003;
  group.add(ring);

  // Standing beacon diamond above floor
  const diamondGeom = new THREE.OctahedronGeometry(0.08, 0);
  const diamondMat = new THREE.MeshBasicMaterial({
    color: 0xfacc15,
    wireframe: true,
    transparent: true,
    opacity: 0.8
  });
  const diamond = new THREE.Mesh(diamondGeom, diamondMat);
  diamond.name = 'standing-diamond';
  diamond.position.y = 0.25;
  group.add(diamond);

  // Forward gaze indicator arrow on the floor
  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(0, 0.28);
  arrowShape.lineTo(0.08, 0.16);
  arrowShape.lineTo(-0.08, 0.16);
  arrowShape.closePath();
  const arrowGeom = new THREE.ShapeGeometry(arrowShape);
  arrowGeom.rotateX(-Math.PI / 2);
  const arrowMat = new THREE.MeshBasicMaterial({
    color: 0xfacc15,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.95
  });
  const arrow = new THREE.Mesh(arrowGeom, arrowMat);
  arrow.name = 'standing-arrow';
  arrow.position.y = 0.004;
  group.add(arrow);

  return group;
}
