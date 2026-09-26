import * as THREE from 'three';

/**
 * Procedural high-resolution matte black EVA foam texture for the dartboard surround
 */
export function createSurroundTexture(): THREE.Texture | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const cx = 512;
  const cy = 512;
  const maxRadius = 500;

  // Base deep charcoal/black matte EVA foam tone
  ctx.fillStyle = '#16171a';
  ctx.fillRect(0, 0, 1024, 1024);

  // Radial tonal variation from inner board groove to outer edge
  const radialGrad = ctx.createRadialGradient(cx, cy, 310, cx, cy, maxRadius);
  radialGrad.addColorStop(0, '#101114');    // inner shadow groove at board junction
  radialGrad.addColorStop(0.12, '#191a1e'); // main front foam body
  radialGrad.addColorStop(0.5, '#1d1e23');  // subtle ambient body highlight
  radialGrad.addColorStop(0.88, '#191a1e');
  radialGrad.addColorStop(1, '#0e0f12');    // outer bevel drop shadow
  ctx.fillStyle = radialGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // High-density EVA micro-cellular foam stippling
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;

  for (let y = 0; y < 1024; y += 2) {
    for (let x = 0; x < 1024; x += 2) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Only add foam texture within the surround ring (between R=310 and R=500)
      if (dist >= 300 && dist <= 505) {
        const noise = (Math.random() - 0.5) * 16;
        const idx = (y * 1024 + x) * 4;

        data[idx] = Math.min(255, Math.max(0, data[idx] + noise));
        data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + noise));
        data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + noise));

        // Fill 2x2 block for performance
        if (x + 1 < 1024) {
          const idxRight = (y * 1024 + (x + 1)) * 4;
          data[idxRight] = data[idx];
          data[idxRight + 1] = data[idx + 1];
          data[idxRight + 2] = data[idx + 2];
        }
        if (y + 1 < 1024) {
          const idxDown = ((y + 1) * 1024 + x) * 4;
          data[idxDown] = data[idx];
          data[idxDown + 1] = data[idx + 1];
          data[idxDown + 2] = data[idx + 2];
        }
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Subtle circular debossed concentric ring groove for tournament styling
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 410, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, 412, 0, Math.PI * 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Matching tactile bump map for EVA foam texture relief
 */
export function createSurroundBumpMap(): THREE.Texture | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const cx = 512;
  const cy = 512;
  const maxRadius = 500;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 1024, 1024);

  // Radial contour height
  const grad = ctx.createRadialGradient(cx, cy, 310, cx, cy, maxRadius);
  grad.addColorStop(0, '#606060');    // recessed inner bevel
  grad.addColorStop(0.15, '#888888'); // raised face
  grad.addColorStop(0.5, '#909090');  // peak curvature
  grad.addColorStop(0.85, '#888888');
  grad.addColorStop(1, '#585858');    // recessed outer bevel
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Pebbled EVA cellular noise
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;

  for (let y = 0; y < 1024; y += 2) {
    for (let x = 0; x < 1024; x += 2) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist >= 300 && dist <= 505) {
        const noise = (Math.random() - 0.5) * 28;
        const idx = (y * 1024 + x) * 4;
        const val = Math.min(255, Math.max(0, data[idx] + noise));
        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = val;

        if (x + 1 < 1024) {
          const idxRight = (y * 1024 + (x + 1)) * 4;
          data[idxRight] = val;
          data[idxRight + 1] = val;
          data[idxRight + 2] = val;
        }
        if (y + 1 < 1024) {
          const idxDown = ((y + 1) * 1024 + x) * 4;
          data[idxDown] = val;
          data[idxDown + 1] = val;
          data[idxDown + 2] = val;
        }
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Debossed ring groove in bump map
  ctx.strokeStyle = '#484848';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 410, 0, Math.PI * 2);
  ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}
