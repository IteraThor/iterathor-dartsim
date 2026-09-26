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
  if (typeof document !== 'undefined') {
    const matCanvas = document.createElement('canvas');
    matCanvas.width = 512;
    matCanvas.height = 2048;
    const ctx = matCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1c1c22';
      ctx.fillRect(0, 0, 512, 2048);

      // Gold border lines
      ctx.strokeStyle = '#e5a521';
      ctx.lineWidth = 10;
      ctx.strokeRect(12, 12, 488, 2024);

      // Distance markers along the runner
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('WINMAU / REGULATION DARTS RUNNER', 256, 400);

      // 2.37m marker
      ctx.fillStyle = '#e5a521';
      ctx.font = 'bold 44px Arial, sans-serif';
      ctx.fillText('2.37 m  /  7\' 9¼"', 256, 1450);

      // Toe line indicator
      ctx.strokeStyle = '#e52521';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(30, 1520);
      ctx.lineTo(482, 1520);
      ctx.stroke();

      matTexture = new THREE.CanvasTexture(matCanvas);
      matTexture.colorSpace = THREE.SRGBColorSpace;
    }
  }

  const matParams: THREE.MeshStandardMaterialParameters = {
    color: matTexture ? 0xffffff : 0x1c1c22,
    roughness: 0.85,
    metalness: 0.1
  };
  if (matTexture) {
    matParams.map = matTexture;
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
