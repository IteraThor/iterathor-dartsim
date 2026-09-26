import * as THREE from 'three';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';
import { createDartboardTexture } from './DartboardTexture';

export function createDartboardGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'dartboard-assembly';

  // Position center of bullseye at regulation height Y = 1.727m, front face at Z = 0
  group.position.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 0);

  const texture = createDartboardTexture();

  // 1. Board Body Cylinder
  // Cylinder oriented along Z axis
  const boardGeom = new THREE.CylinderGeometry(
    DARTS_DIMENSIONS.BOARD_RADIUS_METERS,
    DARTS_DIMENSIONS.BOARD_RADIUS_METERS,
    DARTS_DIMENSIONS.BOARD_THICKNESS_METERS,
    64
  );
  boardGeom.rotateX(Math.PI / 2);

  const sideMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
  const faceMat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.65,
    metalness: 0.08
  });
  const backMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 });

  const boardMesh = new THREE.Mesh(boardGeom, [sideMat, faceMat, backMat]);
  boardMesh.name = 'board-cylinder';
  // Position so front face is at local Z = 0 (extends backward to Z = -BOARD_THICKNESS)
  boardMesh.position.set(0, 0, -DARTS_DIMENSIONS.BOARD_THICKNESS_METERS / 2);
  boardMesh.castShadow = true;
  boardMesh.receiveShadow = true;
  group.add(boardMesh);

  // 2. Board Face planar disc for razor-sharp rendering without z-fighting
  const faceGeom = new THREE.CircleGeometry(DARTS_DIMENSIONS.BOARD_RADIUS_METERS, 64);
  const faceMesh = new THREE.Mesh(faceGeom, faceMat);
  faceMesh.name = 'board-face';
  faceMesh.position.set(0, 0, 0.0005);
  group.add(faceMesh);

  // 3. Wall Surround (EVA foam protection ring)
  const surroundGeom = new THREE.RingGeometry(
    DARTS_DIMENSIONS.BOARD_RADIUS_METERS,
    DARTS_DIMENSIONS.SURROUND_OUTER_RADIUS_METERS,
    64
  );
  const surroundMat = new THREE.MeshStandardMaterial({
    color: 0x881313, // classic deep red surround
    roughness: 0.85,
    metalness: 0.05,
    side: THREE.DoubleSide
  });
  const surroundMesh = new THREE.Mesh(surroundGeom, surroundMat);
  surroundMesh.name = 'surround';
  surroundMesh.position.set(0, 0, -0.001);
  group.add(surroundMesh);

  return group;
}
