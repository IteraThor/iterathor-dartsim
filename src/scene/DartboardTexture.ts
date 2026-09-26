import * as THREE from 'three';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';

/**
 * Creates high-resolution sisal texture with fibrous micro-detail
 * and realistic tournament color palette.
 */
export function createDartboardTexture(): THREE.Texture {
  if (typeof document === 'undefined') {
    return new THREE.Texture();
  }

  const size = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  const cx = size / 2;
  const cy = size / 2;
  const scale = size / (DARTS_DIMENSIONS.BOARD_RADIUS_METERS * 2);

  const rInnerBull = DARTS_DIMENSIONS.INNER_BULL_RADIUS_METERS * scale;
  const rOuterBull = DARTS_DIMENSIONS.OUTER_BULL_RADIUS_METERS * scale;
  const rTrebleIn = DARTS_DIMENSIONS.TREBLE_RING_INNER_METERS * scale;
  const rTrebleOut = DARTS_DIMENSIONS.TREBLE_RING_OUTER_METERS * scale;
  const rDoubleIn = DARTS_DIMENSIONS.DOUBLE_RING_INNER_METERS * scale;
  const rDoubleOut = DARTS_DIMENSIONS.DOUBLE_RING_OUTER_METERS * scale;
  const rBoard = DARTS_DIMENSIONS.BOARD_RADIUS_METERS * scale;

  // Background black outer board zone (clean sisal black)
  ctx.fillStyle = '#121316';
  ctx.beginPath();
  ctx.arc(cx, cy, rBoard, 0, Math.PI * 2);
  ctx.fill();

  const numSegments = 20;
  const segAngle = (Math.PI * 2) / numSegments;
  const offset = -Math.PI / 2 - segAngle / 2;

  // Tournament Sisal Palette
  const colorBlack = '#141518';
  const colorCream = '#f5ebd2'; // authentic natural sisal cream
  const colorRed = '#c82323';   // tournament rich red
  const colorGreen = '#1b803a'; // tournament emerald green

  // Draw 20 segments
  for (let i = 0; i < numSegments; i++) {
    const startAngle = offset + i * segAngle;
    const endAngle = startAngle + segAngle;
    const isEven = i % 2 === 0;

    const singleColor = isEven ? colorBlack : colorCream;
    const ringColor = isEven ? colorRed : colorGreen;

    // Outer single (between treble and double)
    drawArcSegment(ctx, cx, cy, rTrebleOut, rDoubleIn, startAngle, endAngle, singleColor);
    // Inner single (between bull and treble)
    drawArcSegment(ctx, cx, cy, rOuterBull, rTrebleIn, startAngle, endAngle, singleColor);
    // Double ring
    drawArcSegment(ctx, cx, cy, rDoubleIn, rDoubleOut, startAngle, endAngle, ringColor);
    // Treble ring
    drawArcSegment(ctx, cx, cy, rTrebleIn, rTrebleOut, startAngle, endAngle, ringColor);
  }

  // Outer bull (25 - green)
  ctx.fillStyle = colorGreen;
  ctx.beginPath();
  ctx.arc(cx, cy, rOuterBull, 0, Math.PI * 2);
  ctx.fill();

  // Inner bull (50 - red)
  ctx.fillStyle = colorRed;
  ctx.beginPath();
  ctx.arc(cx, cy, rInnerBull, 0, Math.PI * 2);
  ctx.fill();

  // Sisal micro-grain procedural overlay (organic compacted sisal fibers)
  applySisalGrain(ctx, size);

  // Subtle ambient occlusion lines right beneath wire locations
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.lineWidth = 2.5;

  for (let i = 0; i < numSegments; i++) {
    const angle = offset + i * segAngle;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * rOuterBull, cy + Math.sin(angle) * rOuterBull);
    ctx.lineTo(cx + Math.cos(angle) * rDoubleOut, cy + Math.sin(angle) * rDoubleOut);
    ctx.stroke();
  }

  [rInnerBull, rOuterBull, rTrebleIn, rTrebleOut, rDoubleIn, rDoubleOut].forEach(r => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates normal/bump map for authentic tactile sisal fiber depth
 */
export function createDartboardBumpMap(): THREE.Texture {
  if (typeof document === 'undefined') {
    return new THREE.Texture();
  }

  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  // Add micro-noise
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 40;
    const val = Math.min(255, Math.max(0, 128 + noise));
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function applySisalGrain(ctx: CanvasRenderingContext2D, size: number): void {
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = 512;
  noiseCanvas.height = 512;
  const nCtx = noiseCanvas.getContext('2d');
  if (!nCtx) return;

  const nImg = nCtx.createImageData(512, 512);
  const nData = nImg.data;
  for (let i = 0; i < nData.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    nData[i] = v;
    nData[i + 1] = v;
    nData[i + 2] = v;
    nData[i + 3] = 28; // subtle 11% opacity
  }
  nCtx.putImageData(nImg, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(noiseCanvas, 'repeat')!;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();
}

function drawArcSegment(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number,
  fillColor: string
): void {
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.arc(cx, cy, rOuter, startAngle, endAngle, false);
  ctx.arc(cx, cy, rInner, endAngle, startAngle, true);
  ctx.closePath();
  ctx.fill();
}
