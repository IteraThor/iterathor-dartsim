import * as THREE from 'three';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';

/**
 * Creates a crisp 2048x2048 canvas texture for the dartboard face
 * following official color coding and segment angles.
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

  // Background black board edge
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.arc(cx, cy, rBoard, 0, Math.PI * 2);
  ctx.fill();

  const numSegments = 20;
  const segAngle = (Math.PI * 2) / numSegments;
  // Segment 20 is at top: angle centered at -PI/2
  const offset = -Math.PI / 2 - segAngle / 2;

  // Draw 20 segments
  for (let i = 0; i < numSegments; i++) {
    const startAngle = offset + i * segAngle;
    const endAngle = startAngle + segAngle;
    const isEven = i % 2 === 0;

    // Single areas
    const singleColor = isEven ? '#1a1a1a' : '#f4e5c3'; // Black vs Sisal Cream
    const ringColor = isEven ? '#dc2626' : '#16a34a';   // Red vs Green

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
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.arc(cx, cy, rOuterBull, 0, Math.PI * 2);
  ctx.fill();

  // Inner bull (50 - red)
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(cx, cy, rInnerBull, 0, Math.PI * 2);
  ctx.fill();

  // Draw silver wire spider / segment lines
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 3.5;

  for (let i = 0; i < numSegments; i++) {
    const angle = offset + i * segAngle;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * rOuterBull, cy + Math.sin(angle) * rOuterBull);
    ctx.lineTo(cx + Math.cos(angle) * rDoubleOut, cy + Math.sin(angle) * rDoubleOut);
    ctx.stroke();
  }

  // Circular wire rings
  [rInnerBull, rOuterBull, rTrebleIn, rTrebleOut, rDoubleIn, rDoubleOut].forEach(r => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Numbers ring
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 58px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const rNumbers = (rDoubleOut + rBoard) / 2;

  DARTS_DIMENSIONS.SEGMENTS_ORDER.forEach((num, i) => {
    const angle = -Math.PI / 2 + i * segAngle;
    const nx = cx + Math.cos(angle) * rNumbers;
    const ny = cy + Math.sin(angle) * rNumbers;
    ctx.save();
    ctx.translate(nx, ny);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(num.toString(), 0, 0);
    ctx.restore();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
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
) {
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.arc(cx, cy, rOuter, startAngle, endAngle, false);
  ctx.arc(cx, cy, rInner, endAngle, startAngle, true);
  ctx.closePath();
  ctx.fill();
}
