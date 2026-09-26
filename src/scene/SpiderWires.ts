import * as THREE from 'three';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';

/**
 * Creates physical 3D metallic wire spider (blade wires and concentric rings)
 * sitting proud of the sisal face, casting real specular glints and subtle shadows.
 */
export function create3DSpiderGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'wire-spider';

  const wireMat = new THREE.MeshStandardMaterial({
    color: 0xe4e4e7,
    metalness: 0.95,
    roughness: 0.15
  });

  const wireRadius = 0.0007; // 0.7mm wire radius (1.4mm visible wire)
  const zOffset = 0.0016; // sits 1.6mm proud of sisal surface

  // 1. Concentric Wire Rings
  const rings = [
    DARTS_DIMENSIONS.INNER_BULL_RADIUS_METERS,
    DARTS_DIMENSIONS.OUTER_BULL_RADIUS_METERS,
    DARTS_DIMENSIONS.TREBLE_RING_INNER_METERS,
    DARTS_DIMENSIONS.TREBLE_RING_OUTER_METERS,
    DARTS_DIMENSIONS.DOUBLE_RING_INNER_METERS,
    DARTS_DIMENSIONS.DOUBLE_RING_OUTER_METERS
  ];

  rings.forEach((r, idx) => {
    const torusGeom = new THREE.TorusGeometry(r, wireRadius, 8, 96);
    const torus = new THREE.Mesh(torusGeom, wireMat);
    torus.name = `spider-ring-${idx}`;
    torus.position.set(0, 0, zOffset);
    torus.castShadow = true;
    group.add(torus);
  });

  // 2. Radial Wire Spokes (20 dividing blades)
  const numSegments = 20;
  const segAngle = (Math.PI * 2) / numSegments;

  const rInner = DARTS_DIMENSIONS.OUTER_BULL_RADIUS_METERS;
  const rOuter = DARTS_DIMENSIONS.DOUBLE_RING_OUTER_METERS;
  const spokeLength = rOuter - rInner;
  const spokeMidRadius = (rInner + rOuter) / 2;

  const spokeGeom = new THREE.CylinderGeometry(wireRadius, wireRadius, spokeLength, 8);
  spokeGeom.rotateZ(Math.PI / 2);

  for (let i = 0; i < numSegments; i++) {
    // Spoke i divides segment i-1 and segment i
    // Segment 20 (i=0) is at top (+Y, angle PI/2)
    // Left boundary of segment 20 is PI/2 + segAngle/2
    const angle = Math.PI / 2 + segAngle / 2 - i * segAngle;
    const spoke = new THREE.Mesh(spokeGeom, wireMat);
    spoke.name = `spider-spoke-${i}`;
    spoke.position.set(
      Math.cos(angle) * spokeMidRadius,
      Math.sin(angle) * spokeMidRadius,
      zOffset
    );
    spoke.rotation.z = angle;
    spoke.castShadow = true;
    group.add(spoke);
  }

  return group;
}
