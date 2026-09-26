import * as THREE from 'three';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';

export function createOcheGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'oche-assembly';

  // 1. Darts Throw Mat Runner (from wall Z=0 to beyond oche Z=3.2m)
  const matGeom = new THREE.PlaneGeometry(
    DARTS_DIMENSIONS.MAT_WIDTH_METERS,
    DARTS_DIMENSIONS.MAT_LENGTH_METERS
  );
  matGeom.rotateX(-Math.PI / 2);

  let matTexture: THREE.Texture | null = null;
  let matBumpTexture: THREE.Texture | null = null;
  if (typeof document !== 'undefined') {
    const matCanvas = document.createElement('canvas');
    matCanvas.width = 512;
    matCanvas.height = 2048;
    const ctx = matCanvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 512;
    bumpCanvas.height = 2048;
    const bCtx = bumpCanvas.getContext('2d');

    if (ctx && bCtx) {
      // Base vulcanized rubber color (matte charcoal)
      ctx.fillStyle = '#1c1d22';
      ctx.fillRect(0, 0, 512, 2048);

      bCtx.fillStyle = '#808080';
      bCtx.fillRect(0, 0, 512, 2048);

      // Fine horizontal anti-slip micro-ribs
      for (let y = 16; y < 2032; y += 8) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
        ctx.fillRect(16, y, 480, 3);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
        ctx.fillRect(16, y + 3, 480, 2);

        bCtx.fillStyle = '#757575';
        bCtx.fillRect(16, y, 480, 3);
        bCtx.fillStyle = '#8b8b8b';
        bCtx.fillRect(16, y + 3, 480, 2);
      }

      // Realistic dark rubber beveled perimeter edge (no glowing orange lines!)
      // Outer bevel shadow
      ctx.strokeStyle = '#111215';
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, 502, 2038);

      bCtx.strokeStyle = '#606060';
      bCtx.lineWidth = 10;
      bCtx.strokeRect(5, 5, 502, 2038);

      // Inner subtle rim transition
      ctx.strokeStyle = '#272930';
      ctx.lineWidth = 3;
      ctx.strokeRect(12, 12, 488, 2024);

      bCtx.strokeStyle = '#909090';
      bCtx.lineWidth = 3;
      bCtx.strokeRect(12, 12, 488, 2024);

      // Regulation toe line indicator at 2.37m (Y=1520), muted matte finish
      ctx.strokeStyle = '#8f2323'; // muted deep red, painted rubber look
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(24, 1520);
      ctx.lineTo(488, 1520);
      ctx.stroke();

      matTexture = new THREE.CanvasTexture(matCanvas);
      matTexture.colorSpace = THREE.SRGBColorSpace;

      matBumpTexture = new THREE.CanvasTexture(bumpCanvas);
    }
  }

  const matParams: THREE.MeshStandardMaterialParameters = {
    color: matTexture ? 0xffffff : 0x1c1d22,
    roughness: 0.94,
    metalness: 0.0
  };
  if (matTexture) {
    matParams.map = matTexture;
  }
  if (matBumpTexture) {
    matParams.bumpMap = matBumpTexture;
    matParams.bumpScale = 0.0012;
  }

  const matMaterial = new THREE.MeshStandardMaterial(matParams);

  const matMesh = new THREE.Mesh(matGeom, matMaterial);
  matMesh.name = 'darts-mat';
  // Position so mat starts at wall (Z=0) and extends forward
  matMesh.position.set(0, 0.002, DARTS_DIMENSIONS.MAT_LENGTH_METERS / 2);
  matMesh.receiveShadow = true;
  group.add(matMesh);

  // 2. Raised Wooden Oche Bar (Toe Line)
  // Regulation: 38mm high, 600mm wide, 50mm deep
  const barGeom = new THREE.BoxGeometry(
    DARTS_DIMENSIONS.OCHE_BAR_WIDTH_METERS,
    DARTS_DIMENSIONS.OCHE_BAR_HEIGHT_METERS,
    DARTS_DIMENSIONS.OCHE_BAR_DEPTH_METERS
  );
  const barMat = new THREE.MeshStandardMaterial({
    color: 0xc87d32, // rich timber finish
    roughness: 0.45,
    metalness: 0.1
  });
  const barMesh = new THREE.Mesh(barGeom, barMat);
  barMesh.name = 'oche-raised-bar';
  // Front edge positioned at exactly Z = 2.37m
  barMesh.position.set(
    0,
    DARTS_DIMENSIONS.OCHE_BAR_HEIGHT_METERS / 2 + 0.002,
    DARTS_DIMENSIONS.OCHE_DISTANCE_METERS + DARTS_DIMENSIONS.OCHE_BAR_DEPTH_METERS / 2
  );
  barMesh.castShadow = true;
  barMesh.receiveShadow = true;
  group.add(barMesh);

  return group;
}
