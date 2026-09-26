import * as THREE from 'three';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';

/**
 * Procedural high-resolution wood grain texture for the oche timber bar
 */
export function createOcheWoodTexture(): THREE.Texture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Base rich dark walnut / stained oak timber (no fake flat orange!)
  const baseGrad = ctx.createLinearGradient(0, 0, 0, 512);
  baseGrad.addColorStop(0, '#422510');
  baseGrad.addColorStop(0.3, '#523118');
  baseGrad.addColorStop(0.7, '#482a13');
  baseGrad.addColorStop(1, '#3b1f0c');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Multi-layered organic wood grain fibers
  for (let y = 0; y < 512; y += 2) {
    const wave = Math.sin(y * 0.04) * 8 + Math.sin(y * 0.12) * 3;
    const tone = Math.sin(y * 0.08 + Math.sin(y * 0.02) * 4);

    if (tone > 0.2) {
      // Dark growth ring / pore streak
      ctx.fillStyle = `rgba(32, 16, 6, ${0.15 + (tone - 0.2) * 0.35})`;
      ctx.fillRect(0, y + wave, 1024, 1.8);
    } else if (tone < -0.3) {
      // Golden-amber grain highlight
      ctx.fillStyle = `rgba(130, 82, 38, ${0.12 + Math.abs(tone) * 0.25})`;
      ctx.fillRect(0, y + wave, 1024, 1.5);
    }
  }

  // Micro-pores and fine grain noise
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const length = 4 + Math.random() * 14;
    const isDark = Math.random() > 0.35;
    ctx.fillStyle = isDark ? 'rgba(20, 10, 4, 0.25)' : 'rgba(160, 105, 52, 0.15)';
    ctx.fillRect(x, y, length, 0.8);
  }

  // Side end-grain simulation (concentric ring patterns on left and right borders)
  for (const side of [0, 924]) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(side, 0, 100, 512);
    ctx.clip();
    for (let r = 10; r < 200; r += 12) {
      ctx.strokeStyle = 'rgba(26, 13, 5, 0.3)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(side + 50, 256, r * 0.8, r * 1.4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Matching tactile bump map for wood grain relief
 */
export function createOcheWoodBumpMap(): THREE.Texture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 1024, 512);

  // Growth ring depth
  for (let y = 0; y < 512; y += 2) {
    const wave = Math.sin(y * 0.04) * 8 + Math.sin(y * 0.12) * 3;
    const tone = Math.sin(y * 0.08 + Math.sin(y * 0.02) * 4);

    if (tone > 0.2) {
      ctx.fillStyle = `rgba(40, 40, 40, ${0.2 + (tone - 0.2) * 0.4})`;
      ctx.fillRect(0, y + wave, 1024, 2);
    } else if (tone < -0.3) {
      ctx.fillStyle = `rgba(200, 200, 200, ${0.15 + Math.abs(tone) * 0.3})`;
      ctx.fillRect(0, y + wave, 1024, 1.6);
    }
  }

  // Pore noise
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const length = 5 + Math.random() * 12;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(30, 30, 30, 0.35)' : 'rgba(210, 210, 210, 0.2)';
    ctx.fillRect(x, y, length, 0.9);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Creates soft contact shadow texture under the oche bar
 */
function createContactShadowTexture(): THREE.Texture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, 256, 64);
  const grad = ctx.createRadialGradient(128, 32, 10, 128, 32, 120);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 64);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Builds high-fidelity 3D Oche Raised Bar with beveled timber, metal end brackets,
 * brushed brass regulation badge, and contact shadow.
 */
export function createRaisedOcheBar(): THREE.Group {
  const barGroup = new THREE.Group();
  barGroup.name = 'oche-raised-bar';

  const width = DARTS_DIMENSIONS.OCHE_BAR_WIDTH_METERS;   // 0.600m
  const height = DARTS_DIMENSIONS.OCHE_BAR_HEIGHT_METERS; // 0.038m
  const depth = DARTS_DIMENSIONS.OCHE_BAR_DEPTH_METERS;   // 0.050m

  // 1. Soft Contact Shadow Plane underneath the bar
  const shadowTex = createContactShadowTexture();
  if (shadowTex) {
    const shadowGeom = new THREE.PlaneGeometry(width * 1.15, depth * 1.8);
    shadowGeom.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
    shadowMesh.name = 'oche-contact-shadow';
    shadowMesh.position.set(0, -height / 2 + 0.0005, 0);
    barGroup.add(shadowMesh);
  }

  // 2. Beveled 3D Timber Body
  // Extrude shape with 2.5mm bevel to create rich, light-catching chamfered edges
  const bevel = 0.0025;
  const innerW = width - 2 * bevel;
  const innerH = height - 2 * bevel;
  const innerD = depth - 2 * bevel;

  const shape = new THREE.Shape();
  shape.moveTo(-innerW / 2, -innerH / 2);
  shape.lineTo(innerW / 2, -innerH / 2);
  shape.lineTo(innerW / 2, innerH / 2);
  shape.lineTo(-innerW / 2, innerH / 2);
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: innerD,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel
  };

  const timberGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  timberGeom.center(); // centers geometry at local (0, 0, 0)

  const woodTexture = createOcheWoodTexture();
  const woodBump = createOcheWoodBumpMap();
  const timberMatParams: THREE.MeshStandardMaterialParameters = {
    roughness: 0.42, // satin protective timber varnish
    metalness: 0.03,
    color: 0x5a341a
  };
  if (woodTexture) timberMatParams.map = woodTexture;
  if (woodBump) {
    timberMatParams.bumpMap = woodBump;
    timberMatParams.bumpScale = 0.002;
  }

  const timberMat = new THREE.MeshStandardMaterial(timberMatParams);

  const timberMesh = new THREE.Mesh(timberGeom, timberMat);
  timberMesh.name = 'oche-timber-body';
  timberMesh.castShadow = true;
  timberMesh.receiveShadow = true;
  barGroup.add(timberMesh);

  // 3. Heavy-Duty Steel Mounting End Brackets
  // Realistic tournament floor clamp hardware at both ends
  const bracketMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // dark industrial steel
    roughness: 0.32,
    metalness: 0.85
  });

  const boltMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8, // bright galvanized hex bolts
    roughness: 0.25,
    metalness: 0.95
  });

  const bracketWidth = 0.024;
  const bracketHeight = height + 0.003;
  const bracketDepth = depth + 0.004;

  const bracketGeom = new THREE.BoxGeometry(bracketWidth, bracketHeight, bracketDepth);
  const boltGeom = new THREE.CylinderGeometry(0.003, 0.003, 0.004, 6);

  [-width / 2 + bracketWidth / 2, width / 2 - bracketWidth / 2].forEach((xPos, idx) => {
    const bracket = new THREE.Mesh(bracketGeom, bracketMat);
    bracket.name = `oche-bracket-${idx === 0 ? 'left' : 'right'}`;
    bracket.position.set(xPos, 0.001, 0);
    bracket.castShadow = true;
    bracket.receiveShadow = true;
    barGroup.add(bracket);

    // Two countersunk hex bolts on top of each bracket
    [-0.015, 0.015].forEach((zOffset, bIdx) => {
      const bolt = new THREE.Mesh(boltGeom, boltMat);
      bolt.name = `bracket-bolt-${idx}-${bIdx}`;
      bolt.position.set(xPos, height / 2 + 0.0025, zOffset);
      barGroup.add(bolt);
    });
  });

  // 4. Center Brushed Brass Tournament Badge / Toe Plate
  const plateGeom = new THREE.BoxGeometry(0.14, 0.0015, 0.02);
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37, // tournament brushed brass
    roughness: 0.25,
    metalness: 0.9
  });
  const plateMesh = new THREE.Mesh(plateGeom, plateMat);
  plateMesh.name = 'oche-brass-plate';
  plateMesh.position.set(0, height / 2 + 0.0008, -0.004);
  plateMesh.castShadow = true;
  barGroup.add(plateMesh);

  return barGroup;
}
