# 3D Regulation Dart Room Environment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-based 3D simulation environment of an official regulation darts room with precise dimensions (1.73m bull height, 2.37m oche throw distance, 451mm board diameter), smooth camera controls, dimension guides, and GitHub Pages deployment.

**Architecture:** Vite + TypeScript + Three.js application with modular scene components (`Dartboard`, `Oche`, `DartRoom`, `DimensionGuides`, `SceneManager`), sleek glassmorphic HUD controls (`ViewControls`), and Vitest for dimension verification.

**Tech Stack:** Vite, TypeScript, Three.js, Vitest, HTML5/CSS3, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-26-dart-room-environment-design.md`

## Global Constraints

- Units: 1 3D scene unit = 1.0 meter (1mm = 0.001 units).
- Center of bullseye: Exactly Y = 1.727m, front of board plane Z = 0.0m.
- Throw line front edge: Exactly Z = 2.370m from board front face.
- Target deployment: Static build in `dist/` compatible with GitHub Pages (`base: './'`).

---

### Task 1: Project Scaffolding, Build Setup & GitHub Actions

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `.github/workflows/deploy.yml`
- Create: `.gitignore`

**Interfaces:**
- Consumes: Node.js / npm environment
- Produces: Runnable Vite dev server and `npm run build` static output in `dist/` with relative base.

- [ ] **Step 1: Create package.json with dependencies**

```json
{
  "name": "darts-cam-angle-simulator",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "three": "^0.170.0"
  },
  "devDependencies": {
    "@types/three": "^0.170.0",
    "typescript": "^5.6.0",
    "vite": "^5.4.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json, vite.config.ts, and .gitignore**

```ts
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    open: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "moduleResolution": "Node",
    "strict": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "skipLibCheck": true
  },
  "include": ["src", "tests"]
}
```

```gitignore
// .gitignore
node_modules/
dist/
.DS_Store
*.local
```

- [ ] **Step 3: Create GitHub Actions workflow for GitHub Pages**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main, master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4: Install dependencies and verify build config**

Run: `npm install`
Expected: Dependencies installed successfully, `package-lock.json` generated.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts .gitignore .github/workflows/deploy.yml
git commit -m "chore: scaffold project with vite, three.js, and github actions workflow"
```

---

### Task 2: Regulation Darts Dimensions & Unit Tests

**Files:**
- Create: `src/constants/dartsDimensions.ts`
- Create: `tests/dartsDimensions.test.ts`

**Interfaces:**
- Consumes: None
- Produces: `DARTS_DIMENSIONS` typed object with all official millimetre and metre constants, plus helper conversion functions.

- [ ] **Step 1: Write the failing unit tests for dimensions**

Create `tests/dartsDimensions.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { DARTS_DIMENSIONS, calculateDiagonalOcheDistance } from '../src/constants/dartsDimensions';

describe('Regulation Darts Dimensions', () => {
  it('has exact regulation height and throw distances', () => {
    expect(DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS).toBeCloseTo(1.727, 3);
    expect(DARTS_DIMENSIONS.OCHE_DISTANCE_METERS).toBeCloseTo(2.370, 3);
    expect(DARTS_DIMENSIONS.BOARD_DIAMETER_METERS).toBeCloseTo(0.451, 3);
    expect(DARTS_DIMENSIONS.BOARD_THICKNESS_METERS).toBeCloseTo(0.038, 3);
  });

  it('calculates diagonal distance from bullseye to oche line matching Pythagorean expectation', () => {
    const diagonal = calculateDiagonalOcheDistance();
    // sqrt(1.727^2 + 2.370^2) = 2.9325m
    expect(diagonal).toBeCloseTo(2.933, 2);
  });

  it('contains regulation ring radii', () => {
    expect(DARTS_DIMENSIONS.INNER_BULL_RADIUS_METERS).toBeCloseTo(0.00635, 4);
    expect(DARTS_DIMENSIONS.OUTER_BULL_RADIUS_METERS).toBeCloseTo(0.0159, 4);
    expect(DARTS_DIMENSIONS.TREBLE_RING_INNER_METERS).toBeCloseTo(0.099, 3);
    expect(DARTS_DIMENSIONS.TREBLE_RING_OUTER_METERS).toBeCloseTo(0.107, 3);
    expect(DARTS_DIMENSIONS.DOUBLE_RING_INNER_METERS).toBeCloseTo(0.162, 3);
    expect(DARTS_DIMENSIONS.DOUBLE_RING_OUTER_METERS).toBeCloseTo(0.170, 3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/dartsDimensions.test.ts`
Expected: FAIL with "Cannot find module ../src/constants/dartsDimensions"

- [ ] **Step 3: Implement src/constants/dartsDimensions.ts**

Create `src/constants/dartsDimensions.ts`:
```ts
/**
 * Official WDF (World Darts Federation) & PDC Regulation Dimensions
 * Standard units in 3D scene: 1 unit = 1.0 meter
 */
export const DARTS_DIMENSIONS = {
  // Height from floor level to bullseye center: 1.727m (5ft 8in)
  BULLSEYE_HEIGHT_METERS: 1.727,

  // Horizontal distance from front face of board to front edge of oche: 2.37m (7ft 9.25in)
  OCHE_DISTANCE_METERS: 2.370,

  // Dartboard body
  BOARD_DIAMETER_METERS: 0.451, // 451mm
  BOARD_RADIUS_METERS: 0.2255,
  BOARD_THICKNESS_METERS: 0.038, // 38mm

  // Scoring Ring Radii (from bull center to wire centerlines/edges)
  INNER_BULL_RADIUS_METERS: 0.0127 / 2, // 12.7mm diameter -> 6.35mm radius
  OUTER_BULL_RADIUS_METERS: 0.0318 / 2, // 31.8mm diameter -> 15.9mm radius
  TREBLE_RING_INNER_METERS: 0.099,      // 99mm
  TREBLE_RING_OUTER_METERS: 0.107,      // 107mm (8mm width)
  DOUBLE_RING_INNER_METERS: 0.162,      // 162mm
  DOUBLE_RING_OUTER_METERS: 0.170,      // 170mm (8mm width)

  // Standard EVA / Rubber Wall Surround
  SURROUND_OUTER_DIAMETER_METERS: 0.680, // 680mm
  SURROUND_OUTER_RADIUS_METERS: 0.340,
  SURROUND_THICKNESS_METERS: 0.038,

  // Raised Oche Bar
  OCHE_BAR_HEIGHT_METERS: 0.038, // 38mm (1.5 in)
  OCHE_BAR_WIDTH_METERS: 0.600,  // 600mm
  OCHE_BAR_DEPTH_METERS: 0.050,  // 50mm

  // Mat Runner
  MAT_WIDTH_METERS: 0.800,
  MAT_LENGTH_METERS: 3.200,

  // Standard Segment Order clockwise starting at Top Dead Center (angle 0)
  SEGMENTS_ORDER: [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5] as const
} as const;

export function calculateDiagonalOcheDistance(): number {
  return Math.sqrt(
    Math.pow(DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 2) +
    Math.pow(DARTS_DIMENSIONS.OCHE_DISTANCE_METERS, 2)
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/dartsDimensions.test.ts`
Expected: PASS with 3 passed tests.

- [ ] **Step 5: Commit**

```bash
git add src/constants/dartsDimensions.ts tests/dartsDimensions.test.ts
git commit -m "feat: define regulation darts dimensions with unit tests"
```

---

### Task 3: Regulation 3D Dartboard Component

**Files:**
- Create: `src/scene/DartboardTexture.ts`
- Create: `src/scene/Dartboard.ts`
- Create: `tests/dartboard.test.ts`

**Interfaces:**
- Consumes: `DARTS_DIMENSIONS` from `src/constants/dartsDimensions.ts`
- Produces: `createDartboardGroup(): THREE.Group` containing the accurate 3D dartboard mesh, wire spider, bullseye, number ring, and wall surround.

- [ ] **Step 1: Write unit test for dartboard hierarchy and position**

Create `tests/dartboard.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createDartboardGroup } from '../src/scene/Dartboard';
import { DARTS_DIMENSIONS } from '../src/constants/dartsDimensions';

describe('Dartboard 3D Component', () => {
  it('creates dartboard group positioned at regulation bullseye height', () => {
    const dartboard = createDartboardGroup();
    expect(dartboard).toBeInstanceOf(THREE.Group);
    expect(dartboard.position.y).toBeCloseTo(DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 3);
    expect(dartboard.position.z).toBeCloseTo(0, 3);
  });

  it('contains board cylinder, face mesh, surround, and number ring', () => {
    const dartboard = createDartboardGroup();
    const childNames = dartboard.children.map(c => c.name);
    expect(childNames).toContain('board-cylinder');
    expect(childNames).toContain('board-face');
    expect(childNames).toContain('surround');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/dartboard.test.ts`
Expected: FAIL with "Cannot find module ../src/scene/Dartboard"

- [ ] **Step 3: Implement high-res procedural canvas texture generator**

Create `src/scene/DartboardTexture.ts`:
```ts
import * as THREE from 'three';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';

/**
 * Creates a crisp 2048x2048 canvas texture for the dartboard face
 * following official color coding and segment angles.
 */
export function createDartboardTexture(): THREE.CanvasTexture {
  const size = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

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
    const singleColor = isEven ? '#181818' : '#f5e6c8'; // Black vs Sisal Cream
    const ringColor = isEven ? '#e52521' : '#1b8a3e';   // Red vs Green

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
  ctx.fillStyle = '#1b8a3e';
  ctx.beginPath();
  ctx.arc(cx, cy, rOuterBull, 0, Math.PI * 2);
  ctx.fill();

  // Inner bull (50 - red)
  ctx.fillStyle = '#e52521';
  ctx.beginPath();
  ctx.arc(cx, cy, rInnerBull, 0, Math.PI * 2);
  ctx.fill();

  // Draw silver wire spider / segment lines
  ctx.strokeStyle = '#c0c0c8';
  ctx.lineWidth = 3;

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
  ctx.font = 'bold 54px Arial, sans-serif';
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
```

- [ ] **Step 4: Implement src/scene/Dartboard.ts**

Create `src/scene/Dartboard.ts`:
```ts
import * as THREE from 'three';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';
import { createDartboardTexture } from './DartboardTexture';

export function createDartboardGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'dartboard-assembly';

  // Position center of bullseye at regulation height Y = 1.727m, front face at Z = 0
  group.position.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 0);

  const texture = createDartboardTexture();

  // 1. Board Body Cylinder
  // Cylinder oriented along Z axis
  const boardGeom = new THREE.CylinderGeometry(
    DARTS_DIMENSIONS.BOARD_RADIUS_METERS,
    DARTS_DIMENSIONS.BOARD_RADIUS_METERS,
    DARTS_DIMENSIONS.BOARD_THICKNESS_METERS,
    64
  );
  boardGeom.rotateX(Math.PI / 2);

  // Materials: side edge black, front textured face, back black
  const sideMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
  const faceMat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.6,
    metalness: 0.1
  });
  const backMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 });

  const boardMesh = new THREE.Mesh(boardGeom, [sideMat, faceMat, backMat]);
  boardMesh.name = 'board-cylinder';
  // Position so front face is at local Z = 0 (extends backward to Z = -BOARD_THICKNESS)
  boardMesh.position.set(0, 0, -DARTS_DIMENSIONS.BOARD_THICKNESS_METERS / 2);
  boardMesh.castShadow = true;
  boardMesh.receiveShadow = true;
  group.add(boardMesh);

  // 2. Board Face planar disc for razor-sharp rendering
  const faceGeom = new THREE.CircleGeometry(DARTS_DIMENSIONS.BOARD_RADIUS_METERS, 64);
  const faceMesh = new THREE.Mesh(faceGeom, faceMat);
  faceMesh.name = 'board-face';
  faceMesh.position.set(0, 0, 0.0005); // slight offset to prevent z-fighting
  group.add(faceMesh);

  // 3. Wall Surround (EVA foam protection ring)
  const surroundGeom = new THREE.RingGeometry(
    DARTS_DIMENSIONS.BOARD_RADIUS_METERS,
    DARTS_DIMENSIONS.SURROUND_OUTER_RADIUS_METERS,
    64
  );
  const surroundMat = new THREE.MeshStandardMaterial({
    color: 0x991111, // classic red surround
    roughness: 0.85,
    metalness: 0.05,
    side: THREE.DoubleSide
  });
  const surroundMesh = new THREE.Mesh(surroundGeom, surroundMat);
  surroundMesh.name = 'surround';
  surroundMesh.position.set(0, 0, -0.001);
  group.add(surroundMesh);

  return group;
}
```

- [ ] **Step 5: Run tests to verify**

Run: `npx vitest run tests/dartboard.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/scene/DartboardTexture.ts src/scene/Dartboard.ts tests/dartboard.test.ts
git commit -m "feat: implement regulation 3D dartboard with textured face and surround"
```

---

### Task 4: Oche, Mat Runner & Dart Room Environment

**Files:**
- Create: `src/scene/Oche.ts`
- Create: `src/scene/DartRoom.ts`
- Create: `tests/oche.test.ts`

**Interfaces:**
- Consumes: `DARTS_DIMENSIONS`
- Produces: `createOcheGroup(): THREE.Group`, `createDartRoomGroup(): THREE.Group`

- [ ] **Step 1: Write unit test for oche positioning and dimensions**

Create `tests/oche.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createOcheGroup } from '../src/scene/Oche';
import { DARTS_DIMENSIONS } from '../src/constants/dartsDimensions';

describe('Oche Component', () => {
  it('creates oche group with raised bar front edge at regulation 2.37m', () => {
    const oche = createOcheGroup();
    expect(oche).toBeInstanceOf(THREE.Group);
    const bar = oche.getObjectByName('oche-raised-bar');
    expect(bar).toBeDefined();
    // Front edge of the bar should be at exactly 2.37m
    // bar center is at 2.37m + barDepth/2
    expect(bar!.position.z).toBeCloseTo(
      DARTS_DIMENSIONS.OCHE_DISTANCE_METERS + DARTS_DIMENSIONS.OCHE_BAR_DEPTH_METERS / 2,
      3
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/oche.test.ts`
Expected: FAIL with "Cannot find module ../src/scene/Oche"

- [ ] **Step 3: Implement src/scene/Oche.ts**

Create `src/scene/Oche.ts`:
```ts
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

  const matCanvas = document.createElement('canvas');
  matCanvas.width = 512;
  matCanvas.height = 2048;
  const ctx = matCanvas.getContext('2d')!;
  ctx.fillStyle = '#1c1c22';
  ctx.fillRect(0, 0, 512, 2048);

  // Border lines and distance marking
  ctx.strokeStyle = '#e5a521';
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 492, 2028);

  // 2.37m distance marker text on mat
  ctx.fillStyle = '#e5a521';
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('2.37 m / 7\' 9¼"', 256, 1500);

  const matTexture = new THREE.CanvasTexture(matCanvas);
  matTexture.colorSpace = THREE.SRGBColorSpace;

  const matMaterial = new THREE.MeshStandardMaterial({
    map: matTexture,
    roughness: 0.85,
    metalness: 0.1
  });

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
    color: 0xc88232, // rich timber color
    roughness: 0.5,
    metalness: 0.1
  });
  const barMesh = new THREE.Mesh(barGeom, barMat);
  barMesh.name = 'oche-raised-bar';
  // Front edge at Z = 2.37m
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
```

- [ ] **Step 4: Implement src/scene/DartRoom.ts**

Create `src/scene/DartRoom.ts`:
```ts
import * as THREE from 'three';

export function createDartRoomGroup(): THREE.Group {
  const room = new THREE.Group();
  room.name = 'dart-room';

  // Room Dimensions: Width = 5.0m, Height = 3.2m, Depth = 6.0m
  const roomWidth = 5.0;
  const roomHeight = 3.2;
  const roomDepth = 6.0;

  // 1. Floor
  const floorGeom = new THREE.PlaneGeometry(roomWidth, roomDepth);
  floorGeom.rotateX(-Math.PI / 2);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1e1e24, // dark wood/laminate flooring
    roughness: 0.7,
    metalness: 0.15
  });
  const floorMesh = new THREE.Mesh(floorGeom, floorMat);
  floorMesh.name = 'floor';
  floorMesh.position.set(0, 0, roomDepth / 2 - 1.0);
  floorMesh.receiveShadow = true;
  room.add(floorMesh);

  // Subtle floor grid for spatial reference
  const gridHelper = new THREE.GridHelper(roomDepth, 24, 0x3a3a48, 0x272732);
  gridHelper.position.set(0, 0.001, roomDepth / 2 - 1.0);
  room.add(gridHelper);

  // 2. Feature Wall behind dartboard (Z = -0.038m, behind the board)
  const wallGeom = new THREE.PlaneGeometry(roomWidth, roomHeight);
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x121419, // premium charcoal matte wall
    roughness: 0.9,
    metalness: 0.05
  });
  const wallMesh = new THREE.Mesh(wallGeom, wallMat);
  wallMesh.name = 'back-wall';
  wallMesh.position.set(0, roomHeight / 2, -0.038);
  wallMesh.receiveShadow = true;
  room.add(wallMesh);

  // 3. Lighting Setup
  // Ambient fill light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  room.add(ambientLight);

  // Dartboard Accent Spotlight (mimics overhead dartboard light ring)
  const spotLight = new THREE.SpotLight(0xfff7ea, 2.5);
  spotLight.position.set(0, 2.6, 0.6);
  spotLight.target.position.set(0, 1.727, 0);
  spotLight.angle = Math.PI / 3.5;
  spotLight.penumbra = 0.5;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  room.add(spotLight);
  room.add(spotLight.target);

  // Player area directional fill light
  const playerLight = new THREE.DirectionalLight(0xeef2ff, 0.8);
  playerLight.position.set(2, 3, 3);
  room.add(playerLight);

  return room;
}
```

- [ ] **Step 5: Run tests to verify**

Run: `npx vitest run tests/oche.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/scene/Oche.ts src/scene/DartRoom.ts tests/oche.test.ts
git commit -m "feat: implement oche throw line with raised bar and room lighting"
```

---

### Task 5: Toggleable 3D Dimension Guides

**Files:**
- Create: `src/scene/DimensionGuides.ts`
- Create: `tests/dimensions.test.ts`

**Interfaces:**
- Consumes: `DARTS_DIMENSIONS`, `calculateDiagonalOcheDistance`
- Produces: `createDimensionGuidesGroup(): THREE.Group` with vertical 1.73m line, horizontal 2.37m line, diagonal 2.93m line, and 3D billboard text labels.

- [ ] **Step 1: Write test for dimension lines group structure**

Create `tests/dimensions.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createDimensionGuidesGroup } from '../src/scene/DimensionGuides';

describe('Dimension Guides Component', () => {
  it('creates dimension guides group with 3 measurement lines', () => {
    const guides = createDimensionGuidesGroup();
    expect(guides).toBeInstanceOf(THREE.Group);
    expect(guides.getObjectByName('dim-vertical-height')).toBeDefined();
    expect(guides.getObjectByName('dim-horizontal-distance')).toBeDefined();
    expect(guides.getObjectByName('dim-diagonal-hypotenuse')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/dimensions.test.ts`
Expected: FAIL with "Cannot find module ../src/scene/DimensionGuides"

- [ ] **Step 3: Implement src/scene/DimensionGuides.ts**

Create `src/scene/DimensionGuides.ts`:
```ts
import * as THREE from 'three';
import { DARTS_DIMENSIONS, calculateDiagonalOcheDistance } from '../constants/dartsDimensions';

export function createDimensionGuidesGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'dimension-guides';

  const lineMatYellow = new THREE.LineDashedMaterial({
    color: 0xffd13b,
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
  // Shifted slightly to the side (X = -0.35m) for clear visibility
  const vertPoints = [
    new THREE.Vector3(-0.35, 0, 0),
    new THREE.Vector3(-0.35, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 0)
  ];
  const vertGeom = new THREE.BufferGeometry().setFromPoints(vertPoints);
  const vertLine = new THREE.Line(vertGeom, lineMatYellow);
  vertLine.computeLineDistances();
  vertLine.name = 'dim-vertical-height';
  group.add(vertLine);

  const vertLabel = createTextBillboard('Height: 1.73 m (5\' 8")', '#ffd13b');
  vertLabel.position.set(-0.45, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS / 2, 0);
  group.add(vertLabel);

  // 2. Horizontal Throw Distance Line (Board Face Z=0 to Oche Z=2.37m at floor level)
  // Shifted to the right side (X = 0.45m)
  const horizPoints = [
    new THREE.Vector3(0.45, 0.01, 0),
    new THREE.Vector3(0.45, 0.01, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS)
  ];
  const horizGeom = new THREE.BufferGeometry().setFromPoints(horizPoints);
  const horizLine = new THREE.Line(horizGeom, lineMatCyan);
  horizLine.computeLineDistances();
  horizLine.name = 'dim-horizontal-distance';
  group.add(horizLine);

  const horizLabel = createTextBillboard('Distance: 2.37 m (7\' 9¼")', '#38bdf8');
  horizLabel.position.set(0.55, 0.15, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS / 2);
  group.add(horizLabel);

  // 3. Diagonal Distance Line (Bullseye to Oche front line)
  const diagPoints = [
    new THREE.Vector3(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 0),
    new THREE.Vector3(0, 0.01, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS)
  ];
  const diagGeom = new THREE.BufferGeometry().setFromPoints(diagPoints);
  const diagLine = new THREE.Line(diagGeom, lineMatOrange);
  diagLine.computeLineDistances();
  diagLine.name = 'dim-diagonal-hypotenuse';
  group.add(diagLine);

  const diagDistance = calculateDiagonalOcheDistance();
  const diagLabel = createTextBillboard(`Diagonal: ${diagDistance.toFixed(2)} m (9\' 7½")`, '#f97316');
  diagLabel.position.set(
    0.15,
    DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS / 2 + 0.1,
    DARTS_DIMENSIONS.OCHE_DISTANCE_METERS / 2
  );
  group.add(diagLabel);

  return group;
}

function createTextBillboard(text: string, color: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.roundRect(10, 10, 492, 108, 16);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.roundRect(10, 10, 492, 108, 16);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(0.6, 0.15, 1);
  return sprite;
}
```

- [ ] **Step 4: Run tests to verify**

Run: `npx vitest run tests/dimensions.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scene/DimensionGuides.ts tests/dimensions.test.ts
git commit -m "feat: implement 3D regulation dimension guides and text billboards"
```

---

### Task 6: Scene Manager, UI HUD Controls & Main Application

**Files:**
- Create: `src/scene/SceneManager.ts`
- Create: `src/ui/ViewControls.ts`
- Create: `src/style.css`
- Create: `index.html`
- Create: `src/main.ts`

**Interfaces:**
- Consumes: All scene modules and dimension constants
- Produces: Fully interactive web app with responsive viewport, smooth OrbitControls, view presets, and toggleable dimension guides.

- [ ] **Step 1: Implement src/scene/SceneManager.ts**

Create `src/scene/SceneManager.ts`:
```ts
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createDartRoomGroup } from './DartRoom';
import { createDartboardGroup } from './Dartboard';
import { createOcheGroup } from './Oche';
import { createDimensionGuidesGroup } from './DimensionGuides';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';

export class SceneManager {
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;
  public dimensionGuides: THREE.Group;

  private isRunning = false;
  private animationFrameId = 0;

  constructor(container: HTMLElement) {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c10);

    // 2. Camera: Initial 3/4 perspective view
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.05, 50);
    this.camera.position.set(2.2, 2.0, 3.4);

    // 3. Renderer with antialiasing and shadows
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 0.8);
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // prevent going below floor
    this.controls.minDistance = 0.3;
    this.controls.maxDistance = 8.0;

    // 5. Add Scene Components
    this.scene.add(createDartRoomGroup());
    this.scene.add(createDartboardGroup());
    this.scene.add(createOcheGroup());

    this.dimensionGuides = createDimensionGuidesGroup();
    this.scene.add(this.dimensionGuides);

    // 6. Resize listener
    window.addEventListener('resize', this.onWindowResize);
  }

  public setViewPreset(preset: 'oche' | 'board' | 'side' | 'top' | 'isometric'): void {
    switch (preset) {
      case 'oche':
        // Player's perspective at the oche (eye level 1.75m looking at bullseye)
        this.camera.position.set(0, 1.75, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS);
        this.controls.target.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 0);
        break;
      case 'board':
        // Close-up view of the dartboard
        this.camera.position.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 0.7);
        this.controls.target.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 0);
        break;
      case 'side':
        // Side elevation showing distance from board to oche
        this.camera.position.set(2.8, 1.4, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS / 2);
        this.controls.target.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS / 2, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS / 2);
        break;
      case 'top':
        // Top-down bird's eye plan view
        this.camera.position.set(0, 4.2, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS / 2);
        this.controls.target.set(0, 0, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS / 2);
        break;
      case 'isometric':
        this.camera.position.set(2.2, 2.0, 3.4);
        this.controls.target.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 0.8);
        break;
    }
    this.controls.update();
  }

  public toggleDimensions(visible?: boolean): boolean {
    this.dimensionGuides.visible = visible !== undefined ? visible : !this.dimensionGuides.visible;
    return this.dimensionGuides.visible;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    const animate = () => {
      if (!this.isRunning) return;
      this.animationFrameId = requestAnimationFrame(animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  public stop(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);
  }

  private onWindowResize = (): void => {
    const parent = this.renderer.domElement.parentElement;
    if (!parent) return;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };
}
```

- [ ] **Step 2: Implement UI View Controls HUD in src/ui/ViewControls.ts**

Create `src/ui/ViewControls.ts`:
```ts
import { SceneManager } from '../scene/SceneManager';

export function setupViewControls(sceneManager: SceneManager): HTMLElement {
  const container = document.createElement('div');
  container.className = 'hud-overlay';
  container.innerHTML = `
    <header class="hud-header glass-card">
      <div class="hud-title-wrap">
        <h1 class="hud-title">Darts 3D Environment</h1>
        <span class="badge">Official Regulation</span>
      </div>
      <div class="hud-metrics">
        <div class="metric-item">
          <span class="metric-label">Bullseye Height</span>
          <span class="metric-value">1.73 m (5' 8")</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Throw Distance</span>
          <span class="metric-value">2.37 m (7' 9¼")</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Board Diameter</span>
          <span class="metric-value">451 mm</span>
        </div>
      </div>
    </header>

    <div class="hud-bottom-bar">
      <div class="view-preset-group glass-card">
        <span class="group-label">Camera Presets:</span>
        <button class="btn btn-preset" data-preset="isometric">3D Orbit</button>
        <button class="btn btn-preset active" data-preset="oche">🎯 Player Oche</button>
        <button class="btn btn-preset" data-preset="board">Board Close-up</button>
        <button class="btn btn-preset" data-preset="side">Side Elevation</button>
        <button class="btn btn-preset" data-preset="top">Top-Down Plan</button>
      </div>

      <div class="toggle-group glass-card">
        <button id="toggle-dimensions" class="btn btn-toggle active">
          <span class="icon">📏</span> Dimension Guides
        </button>
      </div>
    </div>
  `;

  // Attach button events
  const presetButtons = container.querySelectorAll<HTMLButtonElement>('.btn-preset');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = btn.dataset.preset as any;
      sceneManager.setViewPreset(preset);
    });
  });

  const toggleDimBtn = container.querySelector<HTMLButtonElement>('#toggle-dimensions')!;
  toggleDimBtn.addEventListener('click', () => {
    const isVisible = sceneManager.toggleDimensions();
    toggleDimBtn.classList.toggle('active', isVisible);
  });

  return container;
}
```

- [ ] **Step 3: Create src/style.css, index.html, and src/main.ts**

Create `src/style.css`:
```css
:root {
  --bg-dark: #090a0f;
  --panel-bg: rgba(18, 22, 34, 0.75);
  --panel-border: rgba(255, 255, 255, 0.08);
  --text-primary: #f8fafc;
  --text-muted: #94a3b8;
  --accent-primary: #38bdf8;
  --accent-gold: #f59e0b;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--bg-dark);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: var(--text-primary);
}

#app {
  width: 100%;
  height: 100%;
  position: relative;
}

#canvas-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.glass-card {
  background: var(--panel-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.hud-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
}

.hud-header {
  pointer-events: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.hud-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hud-title {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.badge {
  background: rgba(56, 189, 248, 0.15);
  color: var(--accent-primary);
  border: 1px solid rgba(56, 189, 248, 0.3);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 3px 8px;
  border-radius: 6px;
}

.hud-metrics {
  display: flex;
  gap: 20px;
}

.metric-item {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.metric-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--accent-gold);
}

.hud-bottom-bar {
  pointer-events: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.view-preset-group, .toggle-group {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}

.group-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-right: 4px;
}

.btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--panel-border);
  color: var(--text-primary);
  font-size: 0.85rem;
  padding: 7px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.18s ease;
  font-weight: 500;
}

.btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn.active {
  background: rgba(56, 189, 248, 0.22);
  border-color: var(--accent-primary);
  color: #ffffff;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
}

@media (max-width: 768px) {
  .hud-metrics {
    display: none;
  }
}
```

Create `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Darts Camera & Environment Simulator</title>
    <link rel="stylesheet" href="./src/style.css" />
  </head>
  <body>
    <div id="app">
      <div id="canvas-container"></div>
    </div>
    <script type="module" src="./src/main.ts"></script>
  </body>
</html>
```

Create `src/main.ts`:
```ts
import { SceneManager } from './scene/SceneManager';
import { setupViewControls } from './ui/ViewControls';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvas-container')!;
  const appElement = document.getElementById('app')!;

  const sceneManager = new SceneManager(container);
  const hudElement = setupViewControls(sceneManager);
  appElement.appendChild(hudElement);

  // Set default view to player oche perspective
  sceneManager.setViewPreset('oche');
  sceneManager.start();
});
```

- [ ] **Step 4: Verify build succeeds**

Run: `npm run build`
Expected: `dist/` created with `index.html` and bundled assets.

- [ ] **Step 5: Commit**

```bash
git add src/scene/SceneManager.ts src/ui/ViewControls.ts src/style.css index.html src/main.ts
git commit -m "feat: assemble 3D scene manager, HUD overlay, and view preset controls"
```

---

### Task 7: Verification, Test Suite & Browser Preview

**Files:**
- Test: All tests in `tests/`
- Build: `npm run build`

- [ ] **Step 1: Run complete test suite**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: Clean build with zero errors.

- [ ] **Step 3: Preview local dev server with browser tool**

Run: `npx vite --port 3000`
Verify in browser that:
- 3D Dartboard is mounted at exactly 1.73m.
- Oche line is at 2.37m with raised wooden stop bar.
- Dimension guides accurately connect bullseye and oche.
- View buttons switch perspectives seamlessly.

- [ ] **Step 4: Commit and finalize**

```bash
git add .
git commit -m "chore: verify build and finalize 3D regulation dart room environment"
```
