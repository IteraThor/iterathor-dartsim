import * as THREE from 'three';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';

/**
 * Creates physical 3D number ring floating 4mm proud of the board face
 * with steel wire frame and authentic raised tournament numerals.
 */
export function create3DNumberRingGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'number-ring';

  const ringRadius = 0.198; // 198mm radius
  const wireRadius = 0.00085; // 0.85mm wire thickness
  const zPosition = 0.0035; // floats 3.5mm proud of board face

  // 1. Steel Number Ring Outer Wire
  const ringGeom = new THREE.TorusGeometry(ringRadius, wireRadius, 8, 96);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xe4e4e7,
    metalness: 0.9,
    roughness: 0.2
  });
  const ringMesh = new THREE.Mesh(ringGeom, ringMat);
  ringMesh.position.set(0, 0, zPosition);
  ringMesh.castShadow = true;
  group.add(ringMesh);

  // 2. Mounting Prongs (4 clips at 45 deg intervals holding the ring to the outer board)
  const prongMat = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.5,
    metalness: 0.7
  });
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI / 2) * i + Math.PI / 4;
    const prongGeom = new THREE.BoxGeometry(0.003, 0.032, 0.003);
    const prong = new THREE.Mesh(prongGeom, prongMat);
    prong.position.set(
      Math.cos(angle) * (ringRadius + 0.01),
      Math.sin(angle) * (ringRadius + 0.01),
      zPosition / 2
    );
    prong.rotation.z = angle + Math.PI / 2;
    group.add(prong);
  }

  // 3. 20 High-contrast raised white tournament numerals
  const numSegments = 20;
  const segAngle = (Math.PI * 2) / numSegments;

  DARTS_DIMENSIONS.SEGMENTS_ORDER.forEach((num, i) => {
    // 3D coordinate system: top is PI/2 (+Y), clockwise is decreasing angle
    const angle = Math.PI / 2 - i * segAngle;
    const nx = Math.cos(angle) * ringRadius;
    const ny = Math.sin(angle) * ringRadius;

    const numMesh = createNumberMesh(num.toString());
    numMesh.position.set(nx, ny, zPosition + 0.001);
    numMesh.rotation.z = angle - Math.PI / 2;
    group.add(numMesh);
  });

  return group;
}

function createNumberMesh(numStr: string): THREE.Mesh {
  let texture: THREE.Texture | null = null;

  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 256, 256);

      // Deep drop shadow for optical separation from the board
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 6;

      // Crisp white tournament numeral
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 135px -apple-system, BlinkMacSystemFont, "Impact", "Arial Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(numStr, 128, 128);
    }
    texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
  }

  const matParams: THREE.MeshStandardMaterialParameters = {
    color: 0xffffff,
    transparent: true,
    roughness: 0.3,
    metalness: 0.2,
    depthWrite: false
  };
  if (texture) {
    matParams.map = texture;
  }

  const mat = new THREE.MeshStandardMaterial(matParams);
  const geom = new THREE.PlaneGeometry(0.03, 0.03);
  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  return mesh;
}
