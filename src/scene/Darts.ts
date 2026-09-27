import * as THREE from 'three';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';

/**
 * Creates an individual tournament tungsten dart.
 * Model consists of:
 *  1. Steel point (embedded in sisal)
 *  2. Machined knurled tungsten barrel (6.4mm dia x 50mm)
 *  3. Anodized aluminum/nylon stem (35mm)
 *  4. 4-Fin aerodynamic standard flight (42mm x 34mm)
 */
function createSingleDart(id: number, flightColor = 0x06b6d4): THREE.Group {
  const dart = new THREE.Group();
  dart.name = `dart-${id}`;

  // Materials
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    metalness: 0.95,
    roughness: 0.2
  });

  const tungstenMat = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    metalness: 0.92,
    roughness: 0.3
  });

  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x52525b,
    metalness: 0.85,
    roughness: 0.4
  });

  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    metalness: 0.8,
    roughness: 0.35
  });

  const flightMat = new THREE.MeshStandardMaterial({
    color: flightColor,
    roughness: 0.45,
    metalness: 0.1,
    side: THREE.DoubleSide
  });

  // 1. Steel Point (enters sisal at Z = -0.012m, extends to Z = +0.014m)
  const pointLength = 0.026;
  const pointGeom = new THREE.CylinderGeometry(0.0006, 0.0011, pointLength, 16);
  pointGeom.rotateX(Math.PI / 2);
  const pointMesh = new THREE.Mesh(pointGeom, steelMat);
  pointMesh.position.set(0, 0, 0.001);
  pointMesh.castShadow = true;
  pointMesh.receiveShadow = true;
  dart.add(pointMesh);

  // 2. Tungsten Barrel (50mm length, centered from Z = 0.014 to 0.064m)
  const barrelLength = 0.050;
  const barrelRadius = 0.0032; // 6.4mm diameter
  const barrelGeom = new THREE.CylinderGeometry(barrelRadius * 0.9, barrelRadius, barrelLength, 24);
  barrelGeom.rotateX(Math.PI / 2);
  const barrelMesh = new THREE.Mesh(barrelGeom, tungstenMat);
  barrelMesh.position.set(0, 0, 0.014 + barrelLength / 2);
  barrelMesh.castShadow = true;
  barrelMesh.receiveShadow = true;
  dart.add(barrelMesh);

  // Machined grip accent rings along barrel
  const ringCount = 5;
  for (let r = 0; r < ringCount; r++) {
    const ringGeom = new THREE.TorusGeometry(barrelRadius + 0.0001, 0.0003, 8, 24);
    const ringMesh = new THREE.Mesh(ringGeom, gripMat);
    ringMesh.position.set(0, 0, 0.022 + r * 0.008);
    ringMesh.castShadow = true;
    dart.add(ringMesh);
  }

  // 3. Stem / Shaft (35mm length, from Z = 0.064 to 0.099m)
  const stemLength = 0.035;
  const stemRadius = 0.0018; // 3.6mm diameter
  const stemGeom = new THREE.CylinderGeometry(stemRadius * 0.85, stemRadius, stemLength, 16);
  stemGeom.rotateX(Math.PI / 2);
  const stemMesh = new THREE.Mesh(stemGeom, stemMat);
  stemMesh.position.set(0, 0, 0.064 + stemLength / 2);
  stemMesh.castShadow = true;
  stemMesh.receiveShadow = true;
  dart.add(stemMesh);

  // 4. 4-Fin Standard Flight (cross pattern, 42mm length x 34mm span)
  const flightLength = 0.042;
  const flightSpan = 0.034;
  const finGeom1 = new THREE.PlaneGeometry(flightSpan, flightLength);
  finGeom1.rotateX(Math.PI / 2);
  const finMesh1 = new THREE.Mesh(finGeom1, flightMat);
  finMesh1.position.set(0, 0, 0.099 + flightLength / 2);
  finMesh1.castShadow = true;
  finMesh1.receiveShadow = true;
  dart.add(finMesh1);

  const finGeom2 = new THREE.PlaneGeometry(flightSpan, flightLength);
  finGeom2.rotateX(Math.PI / 2);
  finGeom2.rotateZ(Math.PI / 2);
  const finMesh2 = new THREE.Mesh(finGeom2, flightMat);
  finMesh2.position.set(0, 0, 0.099 + flightLength / 2);
  finMesh2.castShadow = true;
  finMesh2.receiveShadow = true;
  dart.add(finMesh2);

  // Flight protector cap at the rear tip
  const capGeom = new THREE.ConeGeometry(0.0018, 0.004, 8);
  capGeom.rotateX(-Math.PI / 2);
  const capMesh = new THREE.Mesh(capGeom, stemMat);
  capMesh.position.set(0, 0, 0.099 + flightLength + 0.002);
  capMesh.castShadow = true;
  dart.add(capMesh);

  return dart;
}

/**
 * Creates a tournament 180 cluster of 3 precision darts stuck into the Treble 20 bed.
 * Accurately models barrel collision avoidance, realistic upward landing pitch angle,
 * and high-fidelity shadow casting to demonstrate shadowless ring light illumination.
 */
export function createDartsGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'tournament-darts-group';

  // Treble 20 center height: Bullseye (1.727m) + Treble Ring mean radius (0.102m) = 1.829m
  const treble20Y = DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS + 0.102;

  // Dart 1: Dead center of Treble 20
  const dart1 = createSingleDart(1, 0x06b6d4); // Cyan flight
  dart1.position.set(0.000, treble20Y + 0.005, 0.000);
  // Slight upward pitch (tail is higher than point, typical thrown angle ~10°)
  dart1.rotation.set(-0.16, 0.02, 0.0);
  group.add(dart1);

  // Dart 2: Snug upper left grouping
  const dart2 = createSingleDart(2, 0x06b6d4);
  dart2.position.set(-0.006, treble20Y + 0.009, 0.000);
  dart2.rotation.set(-0.19, -0.05, -0.04);
  group.add(dart2);

  // Dart 3: Completing the 180 maximum in the lower bed
  const dart3 = createSingleDart(3, 0x06b6d4);
  dart3.position.set(0.005, treble20Y - 0.002, 0.000);
  dart3.rotation.set(-0.14, 0.06, 0.03);
  group.add(dart3);

  return group;
}
