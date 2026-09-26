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

  // 3. Wall Surround (solid 38mm thick EVA foam protection ring)
  const surroundShape = new THREE.Shape();
  surroundShape.absarc(0, 0, DARTS_DIMENSIONS.SURROUND_OUTER_RADIUS_METERS, 0, Math.PI * 2, false);
  const surroundHole = new THREE.Path();
  surroundHole.absarc(0, 0, DARTS_DIMENSIONS.BOARD_RADIUS_METERS, 0, Math.PI * 2, true);
  surroundShape.holes.push(surroundHole);

  const surroundDepth = DARTS_DIMENSIONS.SURROUND_THICKNESS_METERS;
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: surroundDepth,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.003,
    bevelThickness: 0.003,
    curveSegments: 64
  };
  const surroundGeom = new THREE.ExtrudeGeometry(surroundShape, extrudeSettings);
  // Center along Z so it sits flush with the board from back wall (Z = -0.038) to front face (Z = 0)
  surroundGeom.translate(0, 0, -surroundDepth);

  const surroundMat = new THREE.MeshStandardMaterial({
    color: 0x881313, // classic deep red matte EVA foam
    roughness: 0.88,
    metalness: 0.04
  });
  const surroundMesh = new THREE.Mesh(surroundGeom, surroundMat);
  surroundMesh.name = 'surround';
  surroundMesh.position.set(0, 0, 0);
  surroundMesh.castShadow = true;
  surroundMesh.receiveShadow = true;
  group.add(surroundMesh);

  return group;
}
