import * as THREE from 'three';
import { DARTS_DIMENSIONS, calculateDiagonalOcheDistance } from '../constants/dartsDimensions';

export function createDimensionGuidesGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'dimension-guides';

  const lineMatYellow = new THREE.LineDashedMaterial({
    color: 0xfacc15,
    dashSize: 0.05,
    gapSize: 0.03,
    linewidth: 2
  });

  const lineMatCyan = new THREE.LineDashedMaterial({
    color: 0x38bdf8,
    dashSize: 0.05,
    gapSize: 0.03,
    linewidth: 2
  });

  const lineMatOrange = new THREE.LineDashedMaterial({
    color: 0xf97316,
    dashSize: 0.05,
    gapSize: 0.03,
    linewidth: 2
  });

  // 1. Vertical Bullseye Height Line (Floor Y=0 to Bullseye Y=1.727m)
  // Shifted to the left side (X = -0.38m)
  const vertPoints = [
    new THREE.Vector3(-0.38, 0, 0),
    new THREE.Vector3(-0.38, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 0)
  ];
  const vertGeom = new THREE.BufferGeometry().setFromPoints(vertPoints);
  const vertLine = new THREE.Line(vertGeom, lineMatYellow);
  vertLine.computeLineDistances();
  vertLine.name = 'dim-vertical-height';
  group.add(vertLine);

  const vertLabel = createTextBillboard('1.73 m Height', '#facc15');
  vertLabel.position.set(-0.55, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS / 2, 0);
  group.add(vertLabel);

  // 2. Horizontal Throw Distance Line (Board Face Z=0 to Oche Z=2.37m at floor level)
  // Shifted to the right side (X = 0.45m)
  const horizPoints = [
    new THREE.Vector3(0.45, 0.015, 0),
    new THREE.Vector3(0.45, 0.015, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS)
  ];
  const horizGeom = new THREE.BufferGeometry().setFromPoints(horizPoints);
  const horizLine = new THREE.Line(horizGeom, lineMatCyan);
  horizLine.computeLineDistances();
  horizLine.name = 'dim-horizontal-distance';
  group.add(horizLine);

  const horizLabel = createTextBillboard('2.37 m Throw Distance', '#38bdf8');
  horizLabel.position.set(0.65, 0.16, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS / 2);
  group.add(horizLabel);

  // 3. Diagonal Distance Line (Bullseye to Oche front line)
  const diagPoints = [
    new THREE.Vector3(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 0),
    new THREE.Vector3(0, 0.015, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS)
  ];
  const diagGeom = new THREE.BufferGeometry().setFromPoints(diagPoints);
  const diagLine = new THREE.Line(diagGeom, lineMatOrange);
  diagLine.computeLineDistances();
  diagLine.name = 'dim-diagonal-hypotenuse';
  group.add(diagLine);

  const diagDistance = calculateDiagonalOcheDistance();
  const diagLabel = createTextBillboard(`${diagDistance.toFixed(2)} m Diagonal`, '#f97316');
  diagLabel.position.set(
    0.16,
    DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS / 2 + 0.1,
    DARTS_DIMENSIONS.OCHE_DISTANCE_METERS / 2
  );
  group.add(diagLabel);

  return group;
}

function createTextBillboard(text: string, color: string): THREE.Sprite {
  if (typeof document === 'undefined') {
    const spriteMat = new THREE.SpriteMaterial({ depthTest: false });
    return new THREE.Sprite(spriteMat);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new THREE.Sprite(new THREE.SpriteMaterial());
  }

  ctx.fillStyle = 'rgba(10, 14, 23, 0.9)';
  ctx.beginPath();
  ctx.roundRect(10, 10, 492, 108, 16);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(10, 10, 492, 108, 16);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(0.68, 0.17, 1);
  return sprite;
}
