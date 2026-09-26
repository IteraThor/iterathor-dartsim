import * as THREE from 'three';

/**
 * Procedurally generates high-resolution architectural wall texture
 * with tactile micro-plaster grain, acoustic panel seams, and bump depth.
 */
export function createWallTexture(): THREE.Texture {
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

  // Base deep charcoal architectural wall color
  ctx.fillStyle = '#161920';
  ctx.fillRect(0, 0, width, height);

  // 1. Vertical Architectural Panel Seams (every 256px -> ~60cm wide wall panels)
  const panelWidth = 256;
  const numPanels = width / panelWidth;

  for (let p = 0; p < numPanels; p++) {
    const x = p * panelWidth;

    // Subtle per-panel tone variation (architectural acoustic panel effect)
    const panelToneVariation = ((p * 37) % 5 - 2) * 2;
    const r = Math.min(255, Math.max(0, 22 + panelToneVariation));
    const g = Math.min(255, Math.max(0, 25 + panelToneVariation));
    const b = Math.min(255, Math.max(0, 32 + panelToneVariation));
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(x, 0, panelWidth, height);

    // Deep shadow groove between panels
    ctx.fillStyle = '#0a0c10';
    ctx.fillRect(x, 0, 3, height);

    // Subtle highlight on the right edge of the seam
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.fillRect(x + 3, 0, 1.5, height);

    // Vertical acoustic micro-grooves inside each panel
    const subGrooves = 4;
    const subWidth = panelWidth / subGrooves;
    for (let s = 1; s < subGrooves; s++) {
      const sx = x + s * subWidth;
      ctx.fillStyle = 'rgba(10, 12, 16, 0.45)';
      ctx.fillRect(sx, 0, 1.5, height);
    }
  }

  // 2. Micro-Plaster / Stucco Aggregate Noise Overlay
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = 512;
  noiseCanvas.height = 512;
  const nCtx = noiseCanvas.getContext('2d');
  if (nCtx) {
    const imgData = nCtx.createImageData(512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 30; // 12% opacity
    }
    nCtx.putImageData(imgData, 0, 0);

    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(noiseCanvas, 'repeat')!;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates normal/bump map for wall panel seams and tactile stucco relief
 */
export function createWallBumpMap(): THREE.Texture {
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

  // Random micro-relief across the stucco wall
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 55;
    const v = Math.min(255, Math.max(0, 128 + n));
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
  }
  ctx.putImageData(imgData, 0, 0);

  // Recessed panel grooves in the bump map
  const panelWidth = 128;
  const numPanels = size / panelWidth;
  for (let p = 0; p < numPanels; p++) {
    const x = p * panelWidth;
    ctx.fillStyle = '#202020';
    ctx.fillRect(x - 1, 0, 4, size);

    // Sub-grooves
    const subWidth = panelWidth / 4;
    for (let s = 1; s < 4; s++) {
      ctx.fillStyle = '#454545';
      ctx.fillRect(x + s * subWidth, 0, 2, size);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}
