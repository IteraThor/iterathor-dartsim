import * as THREE from 'three';

/**
 * Procedurally generates high-resolution wood plank textures
 * with authentic grain, staggered joints, and satin varnish response.
 */
export function createWoodFloorTexture(): THREE.Texture {
  if (typeof document === 'undefined') {
    return new THREE.Texture();
  }

  const width = 2048;
  const height = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  // Number of planks across the texture
  const numPlanks = 12;
  const plankWidth = width / numPlanks;

  // Rich warm hardwood palette (Dark Oak / Walnut)
  const baseTones = [
    { r: 42, g: 33, b: 26 },
    { r: 48, g: 38, b: 30 },
    { r: 38, g: 29, b: 23 },
    { r: 45, g: 35, b: 28 },
    { r: 52, g: 41, b: 32 }
  ];

  for (let p = 0; p < numPlanks; p++) {
    const px = p * plankWidth;
    const tone = baseTones[p % baseTones.length];

    // Staggered plank segment joints along height
    const jointHeight = height / 3;
    const jointOffset = (p * 173) % jointHeight;

    // Fill plank base color
    ctx.fillStyle = `rgb(${tone.r}, ${tone.g}, ${tone.b})`;
    ctx.fillRect(px, 0, plankWidth, height);

    // Fine wood grain lines along length
    const numGrainLines = 36;
    for (let g = 0; g < numGrainLines; g++) {
      const gx = px + (g / numGrainLines) * plankWidth + (Math.random() - 0.5) * 3;
      const alpha = 0.04 + Math.random() * 0.07;
      const isDark = Math.random() > 0.4;
      ctx.strokeStyle = isDark
        ? `rgba(15, 12, 9, ${alpha})`
        : `rgba(85, 68, 54, ${alpha})`;
      ctx.lineWidth = 1 + Math.random() * 2;

      ctx.beginPath();
      ctx.moveTo(gx, 0);
      // Subtle organic wave along the wood grain
      const waveFreq = 0.002 + Math.random() * 0.003;
      const waveAmp = 2 + Math.random() * 4;
      for (let y = 0; y <= height; y += 40) {
        const offset = Math.sin(y * waveFreq) * waveAmp;
        ctx.lineTo(gx + offset, y);
      }
      ctx.stroke();
    }

    // Horizontal joints between planks
    for (let j = -1; j <= 3; j++) {
      const jy = j * jointHeight + jointOffset;
      if (jy >= 0 && jy <= height) {
        ctx.fillStyle = '#100c09';
        ctx.fillRect(px, jy - 1, plankWidth, 3);
      }
    }

    // Vertical seam between planks (shadow groove)
    ctx.fillStyle = '#0f0c09';
    ctx.fillRect(px, 0, 2.5, height);

    // Subtle edge highlight on opposite side of groove
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(px + plankWidth - 1.5, 0, 1.5, height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates normal/bump map for tactile wood plank seams and grain
 */
export function createWoodFloorBumpMap(): THREE.Texture {
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

  const numPlanks = 12;
  const plankWidth = size / numPlanks;

  for (let p = 0; p < numPlanks; p++) {
    const px = p * plankWidth;

    // Deep groove in bump map
    ctx.fillStyle = '#303030';
    ctx.fillRect(px - 1, 0, 3, size);

    // Staggered horizontal joints
    const jointHeight = size / 3;
    const jointOffset = (p * 173) % jointHeight;
    for (let j = -1; j <= 3; j++) {
      const jy = j * jointHeight + jointOffset;
      if (jy >= 0 && jy <= size) {
        ctx.fillStyle = '#303030';
        ctx.fillRect(px, jy - 1, plankWidth, 3);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}
