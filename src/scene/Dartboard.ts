import * as THREE from 'three';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';
import { createDartboardTexture, createDartboardBumpMap } from './DartboardTexture';
import { createSurroundTexture, createSurroundBumpMap } from './SurroundTexture';
import { create3DSpiderGroup } from './SpiderWires';
import { create3DNumberRingGroup } from './NumberRing';

export function createDartboardGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'dartboard-assembly';

  // Position center of bullseye at regulation height Y = 1.727m, front face at Z = 0
  group.position.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 0);

  const texture = createDartboardTexture();
  const bumpMap = createDartboardBumpMap();

  // 1. Board Body Cylinder
  const boardGeom = new THREE.CylinderGeometry(
    DARTS_DIMENSIONS.BOARD_RADIUS_METERS,
    DARTS_DIMENSIONS.BOARD_RADIUS_METERS,
    DARTS_DIMENSIONS.BOARD_THICKNESS_METERS,
    64
  );
  boardGeom.rotateX(Math.PI / 2);

  const sideMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.7,
    metalness: 0.2
  });

  const faceMat = new THREE.MeshStandardMaterial({
    map: texture,
    bumpMap: bumpMap,
    bumpScale: 0.0005,
    roughness: 0.82,
    metalness: 0.04
  });

  const backMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.95 });

  const boardMesh = new THREE.Mesh(boardGeom, [sideMat, faceMat, backMat]);
  boardMesh.name = 'board-cylinder';
  // Position so front face is at local Z = 0 (extends backward to Z = -BOARD_THICKNESS)
  boardMesh.position.set(0, 0, -DARTS_DIMENSIONS.BOARD_THICKNESS_METERS / 2);
  boardMesh.castShadow = true;
  boardMesh.receiveShadow = true;
  group.add(boardMesh);

  // 2. Board Face planar disc for razor-sharp rendering
  const faceGeom = new THREE.CircleGeometry(DARTS_DIMENSIONS.BOARD_RADIUS_METERS, 64);
  const faceMesh = new THREE.Mesh(faceGeom, faceMat);
  faceMesh.name = 'board-face';
  faceMesh.position.set(0, 0, 0.0005);
  faceMesh.receiveShadow = true;
  group.add(faceMesh);

  // 3. Authentic Brushed Steel Outer Clamping Rim Band
  const rimGeom = new THREE.TorusGeometry(
    DARTS_DIMENSIONS.BOARD_RADIUS_METERS,
    0.0015,
    8,
    72
  );
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x71717a,
    metalness: 0.85,
    roughness: 0.3
  });
  const rimMesh = new THREE.Mesh(rimGeom, rimMat);
  rimMesh.name = 'board-rim-band';
  rimMesh.position.set(0, 0, 0.0008);
  group.add(rimMesh);

  // 4. Physical 3D Metallic Wire Spider (Rings + Radial Blades)
  const spiderGroup = create3DSpiderGroup();
  group.add(spiderGroup);

  // 5. Physical 3D Floating Number Ring & Tournament Numerals
  const numberRingGroup = create3DNumberRingGroup();
  group.add(numberRingGroup);

  // 6. Wall Surround (high-depth matte black EVA foam ring with rounded bullnose bevel)
  const bevel = 0.006; // 6mm rounded bullnose bevel
  const outerR = DARTS_DIMENSIONS.SURROUND_OUTER_RADIUS_METERS - bevel;
  const innerR = DARTS_DIMENSIONS.BOARD_RADIUS_METERS + bevel;

  const surroundShape = new THREE.Shape();
  surroundShape.absarc(0, 0, outerR, 0, Math.PI * 2, false);
  const surroundHole = new THREE.Path();
  surroundHole.absarc(0, 0, innerR, 0, Math.PI * 2, true);
  surroundShape.holes.push(surroundHole);

  // Depth: extends from back wall (Z = -0.038) forward to Z = +0.006 (stands 6mm proud of board face)
  const totalThickness = DARTS_DIMENSIONS.SURROUND_THICKNESS_METERS + 0.006; // 0.044m
  const innerDepth = totalThickness - 2 * bevel; // 0.032m
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: innerDepth,
    bevelEnabled: true,
    bevelSegments: 6,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel,
    curveSegments: 72
  };
  const surroundGeom = new THREE.ExtrudeGeometry(surroundShape, extrudeSettings);
  // Translate so back bevel touches back wall at Z = -0.038 and front face stands proud at Z = +0.006
  surroundGeom.translate(0, 0, -DARTS_DIMENSIONS.SURROUND_THICKNESS_METERS + bevel);

  const surroundTexture = createSurroundTexture();
  const surroundBump = createSurroundBumpMap();

  const surroundMatParams: THREE.MeshStandardMaterialParameters = {
    color: 0x18191d, // tournament matte black / anthracite EVA foam
    roughness: 0.90, // soft velvety foam surface
    metalness: 0.02
  };
  if (surroundTexture) surroundMatParams.map = surroundTexture;
  if (surroundBump) {
    surroundMatParams.bumpMap = surroundBump;
    surroundMatParams.bumpScale = 0.0016;
  }

  const surroundMat = new THREE.MeshStandardMaterial(surroundMatParams);
  const surroundMesh = new THREE.Mesh(surroundGeom, surroundMat);
  surroundMesh.name = 'surround';
  surroundMesh.castShadow = true;
  surroundMesh.receiveShadow = true;
  group.add(surroundMesh);

  // Inner recessed shadow ring between dartboard rim and surround
  const innerShadowGeom = new THREE.TorusGeometry(
    DARTS_DIMENSIONS.BOARD_RADIUS_METERS + 0.001,
    0.002,
    8,
    72
  );
  const innerShadowMat = new THREE.MeshBasicMaterial({
    color: 0x050507,
    transparent: true,
    opacity: 0.75
  });
  const innerShadowMesh = new THREE.Mesh(innerShadowGeom, innerShadowMat);
  innerShadowMesh.name = 'surround-inner-shadow-ring';
  innerShadowMesh.position.set(0, 0, 0.001);
  group.add(innerShadowMesh);

  return group;
}
