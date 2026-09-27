import * as THREE from 'three';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';

export interface IT2RingRigOptions {
  modelUrl?: string;
  onLoaded?: (group: THREE.Group) => void;
}

export interface IT2RingRigGroup extends THREE.Group {
  setRingLightEnabled: (enabled: boolean) => void;
  isRingLightEnabled: () => boolean;
  toggleRingLight: () => boolean;
  setRingLightIntensity: (factor: number) => void;
  getRingLightIntensity: () => number;
}

/**
 * Creates a high-fidelity stainless steel hex socket-head cap screw.
 */
function createHexScrew(
  headRadius: number,
  headHeight: number,
  metalMaterial: THREE.Material
): THREE.Group {
  const screw = new THREE.Group();

  // Cylindrical cap head
  const headGeom = new THREE.CylinderGeometry(headRadius, headRadius * 0.96, headHeight, 20);
  headGeom.rotateX(Math.PI / 2);
  const headMesh = new THREE.Mesh(headGeom, metalMaterial);
  headMesh.castShadow = true;
  screw.add(headMesh);

  // Hex socket recess in cap head
  const socketMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.6,
    metalness: 0.8
  });
  const socketGeom = new THREE.CylinderGeometry(headRadius * 0.52, headRadius * 0.52, headHeight * 0.5, 6);
  socketGeom.rotateX(Math.PI / 2);
  const socketMesh = new THREE.Mesh(socketGeom, socketMat);
  socketMesh.position.set(0, 0, headHeight * 0.3);
  screw.add(socketMesh);

  return screw;
}

/**
 * Creates one of the 3 standoff mounting legs and wall shoe assemblies.
 * Sourced directly from IT2 Assembly CAD geometry (00_Baseline_Rev3_Foot_Final_Shoe + 00_Leg_HI).
 * Extends from the back wall (Z = 0) forward to the ring outer circumference (Z = 167mm).
 */
function createStandoffLeg(
  angle: number,
  legIndex: number,
  petgMat: THREE.Material,
  accentMat: THREE.Material,
  metalMat: THREE.Material
): THREE.Group {
  const legGroup = new THREE.Group();
  legGroup.name = `it2-leg-${legIndex}`;

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // 1. Wall Mounting Foot Shoe (flush against back wall at Z = 0 to 0.016m)
  // Sits at radius 370mm to 415mm, just outside the 680mm surround
  const shoeWidth = 0.044;
  const shoeLength = 0.052;
  const shoeDepth = 0.015;
  const shoeR = 0.392;

  const shoeShape = new THREE.Shape();
  const halfW = shoeWidth / 2;
  const halfL = shoeLength / 2;
  const rCorner = 0.005;

  shoeShape.moveTo(-halfW + rCorner, -halfL);
  shoeShape.lineTo(halfW - rCorner, -halfL);
  shoeShape.quadraticCurveTo(halfW, -halfL, halfW, -halfL + rCorner);
  shoeShape.lineTo(halfW, halfL - rCorner);
  shoeShape.quadraticCurveTo(halfW, halfL, halfW - rCorner, halfL);
  shoeShape.lineTo(-halfW + rCorner, halfL);
  shoeShape.quadraticCurveTo(-halfW, halfL, -halfW, halfL - rCorner);
  shoeShape.lineTo(-halfW, -halfL + rCorner);
  shoeShape.quadraticCurveTo(-halfW, -halfL, -halfW + rCorner, -halfL);

  const shoeGeom = new THREE.ExtrudeGeometry(shoeShape, {
    depth: shoeDepth,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.002,
    bevelThickness: 0.002
  });

  const shoeMesh = new THREE.Mesh(shoeGeom, accentMat);
  shoeMesh.name = `it2-shoe-${legIndex}`;
  shoeMesh.position.set(shoeR * cos, shoeR * sin, 0.001);
  shoeMesh.rotation.z = angle - Math.PI / 2;
  shoeMesh.castShadow = true;
  shoeMesh.receiveShadow = true;
  legGroup.add(shoeMesh);

  // Counterbored stainless steel wall mounting screws in shoe
  const screw1 = createHexScrew(0.0035, 0.004, metalMat);
  screw1.position.set(shoeR * cos + 0.012 * sin, shoeR * sin - 0.012 * cos, shoeDepth + 0.001);
  legGroup.add(screw1);

  const screw2 = createHexScrew(0.0035, 0.004, metalMat);
  screw2.position.set(shoeR * cos - 0.012 * sin, shoeR * sin + 0.012 * cos, shoeDepth + 0.001);
  legGroup.add(screw2);

  // 2. Structural Standoff Strut (arches forward from wall shoe to ring clamp at Z = 0.167m)
  const ringR = 0.3675;
  const startPt = new THREE.Vector3(shoeR * cos, shoeR * sin, shoeDepth);
  const endPt = new THREE.Vector3(ringR * cos, ringR * sin, 0.167);
  const midPt = new THREE.Vector3(
    (shoeR * 0.45 + ringR * 0.55) * cos,
    (shoeR * 0.45 + ringR * 0.55) * sin,
    0.088
  );

  const curve = new THREE.QuadraticBezierCurve3(startPt, midPt, endPt);
  const strutGeom = new THREE.TubeGeometry(curve, 32, 0.012, 16, false);
  const strutMesh = new THREE.Mesh(strutGeom, petgMat);
  strutMesh.name = `it2-strut-${legIndex}`;
  strutMesh.castShadow = true;
  strutMesh.receiveShadow = true;
  legGroup.add(strutMesh);

  // Aerodynamic side stiffener ribs
  const ribGeom = new THREE.BoxGeometry(0.004, 0.022, 0.14);
  const ribMesh = new THREE.Mesh(ribGeom, accentMat);
  ribMesh.position.set(midPt.x, midPt.y, midPt.z);
  ribMesh.rotation.z = angle;
  ribMesh.rotation.x = Math.PI / 16;
  ribMesh.castShadow = true;
  legGroup.add(ribMesh);

  // Hex clamping bolt connecting strut to ring outer circumference
  const clampBolt = createHexScrew(0.004, 0.005, metalMat);
  clampBolt.position.set(ringR * cos, ringR * sin, 0.167);
  clampBolt.rotation.z = angle;
  legGroup.add(clampBolt);

  return legGroup;
}

/**
 * Creates one of the 3 high-detail camera pods housing an OV2710 optical sensor.
 * Sourced directly from IT2 Assembly CAD geometry (00_Head_HI + Final_Cam_Lid + Final_Lens_Hood).
 * Oriented with mathematical precision directly aimed at the dartboard bullseye.
 */
function createCameraPod(
  angle: number,
  podIndex: number,
  petgMat: THREE.Material,
  accentMat: THREE.Material,
  metalMat: THREE.Material,
  glassMat: THREE.Material,
  ledIndicatorMat: THREE.Material
): THREE.Group {
  const podGroup = new THREE.Group();
  podGroup.name = `it2-camera-head-${podIndex}`;

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const podR = 0.355; // centered just on the ring shoulder
  const podZ = 0.220; // mid-depth of pod body

  // Target: Dartboard bullseye front face (0, 0, 0.038m in local coords)
  const targetPt = new THREE.Vector3(0, 0, 0.038);
  const podPos = new THREE.Vector3(podR * cos, podR * sin, podZ);

  // 1. Camera Housing Main Body (00_Head_HI)
  // Sleek rounded enclosure with beveled chamfers and heat dissipation grooves
  const bodyW = 0.046;
  const bodyH = 0.054;
  const bodyL = 0.068;

  const bodyShape = new THREE.Shape();
  const halfW = bodyW / 2;
  const halfH = bodyH / 2;
  const rad = 0.006;

  bodyShape.moveTo(-halfW + rad, -halfH);
  bodyShape.lineTo(halfW - rad, -halfH);
  bodyShape.quadraticCurveTo(halfW, -halfH, halfW, -halfH + rad);
  bodyShape.lineTo(halfW, halfH - rad);
  bodyShape.quadraticCurveTo(halfW, halfH, halfW - rad, halfH);
  bodyShape.lineTo(-halfW + rad, halfH);
  bodyShape.quadraticCurveTo(-halfW, halfH, -halfW, halfH - rad);
  bodyShape.lineTo(-halfW, -halfH + rad);
  bodyShape.quadraticCurveTo(-halfW, -halfH, -halfW + rad, -halfH);

  const bodyGeom = new THREE.ExtrudeGeometry(bodyShape, {
    depth: bodyL,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.003,
    bevelThickness: 0.003
  });

  const bodyMesh = new THREE.Mesh(bodyGeom, petgMat);
  bodyMesh.name = `it2-cam-body-${podIndex}`;
  bodyMesh.position.copy(podPos);

  // Orient pod so its snout looks toward bullseye
  bodyMesh.lookAt(targetPt);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  podGroup.add(bodyMesh);

  // 2. Removable Service Lid (Final_Cam_Lid) on outer face
  const lidGeom = new THREE.BoxGeometry(bodyW * 0.94, bodyH * 0.94, 0.004);
  const lidMesh = new THREE.Mesh(lidGeom, accentMat);
  lidMesh.name = `it2-cam-lid-${podIndex}`;
  lidMesh.position.copy(podPos);
  lidMesh.lookAt(targetPt);
  lidMesh.translateZ(-0.003);
  lidMesh.castShadow = true;
  podGroup.add(lidMesh);

  // 4 Miniature corner hex screws on the lid
  const screwOffsets = [
    [-bodyW * 0.38, -bodyH * 0.38],
    [bodyW * 0.38, -bodyH * 0.38],
    [-bodyW * 0.38, bodyH * 0.38],
    [bodyW * 0.38, bodyH * 0.38]
  ];
  screwOffsets.forEach(([ox, oy]) => {
    const sc = createHexScrew(0.002, 0.0025, metalMat);
    sc.position.copy(podPos);
    sc.lookAt(targetPt);
    sc.translateX(ox);
    sc.translateY(oy);
    sc.translateZ(-0.005);
    podGroup.add(sc);
  });

  // 3. Status LED indicator on the top surface
  const ledGeom = new THREE.CylinderGeometry(0.0016, 0.0016, 0.002, 16);
  ledGeom.rotateX(Math.PI / 2);
  const ledMesh = new THREE.Mesh(ledGeom, ledIndicatorMat);
  ledMesh.position.copy(podPos);
  ledMesh.lookAt(targetPt);
  ledMesh.translateY(bodyH / 2 + 0.001);
  ledMesh.translateZ(bodyL * 0.3);
  podGroup.add(ledMesh);

  // 4. Optical Lens Hood (Final_Lens_Hood) extending forward
  // Conical stepped shroud preventing stray light flare
  const hoodLength = 0.024;
  const hoodR1 = 0.016; // base radius
  const hoodR2 = 0.012; // front aperture radius
  const hoodGeom = new THREE.CylinderGeometry(hoodR2, hoodR1, hoodLength, 32, 1, true);
  hoodGeom.rotateX(Math.PI / 2);

  const hoodMesh = new THREE.Mesh(hoodGeom, accentMat);
  hoodMesh.name = `it2-lens-hood-${podIndex}`;
  hoodMesh.position.copy(podPos);
  hoodMesh.lookAt(targetPt);
  hoodMesh.translateZ(bodyL + hoodLength / 2);
  hoodMesh.castShadow = true;
  podGroup.add(hoodMesh);

  // 5. M12 Anodized Aluminum Lens Barrel (OV2710 Optics)
  const barrelGeom = new THREE.CylinderGeometry(0.0075, 0.0075, 0.018, 24);
  barrelGeom.rotateX(Math.PI / 2);
  const barrelMat = new THREE.MeshStandardMaterial({
    color: 0x141418,
    metalness: 0.85,
    roughness: 0.3
  });
  const barrelMesh = new THREE.Mesh(barrelGeom, barrelMat);
  barrelMesh.position.copy(podPos);
  barrelMesh.lookAt(targetPt);
  barrelMesh.translateZ(bodyL + 0.008);
  barrelMesh.castShadow = true;
  podGroup.add(barrelMesh);

  // 6. Multi-Coated Convex Optical Glass Element
  // Catches subtle deep-cyan anti-reflection highlights
  const glassGeom = new THREE.SphereGeometry(0.0065, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  glassGeom.rotateX(-Math.PI / 2);
  const glassMesh = new THREE.Mesh(glassGeom, glassMat);
  glassMesh.name = `it2-lens-glass-${podIndex}`;
  glassMesh.position.copy(podPos);
  glassMesh.lookAt(targetPt);
  glassMesh.translateZ(bodyL + 0.016);
  podGroup.add(glassMesh);

  // Internal Aperture Ring
  const irisGeom = new THREE.RingGeometry(0.0025, 0.0062, 24);
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x050507, roughness: 0.95 });
  const irisMesh = new THREE.Mesh(irisGeom, irisMat);
  irisMesh.position.copy(podPos);
  irisMesh.lookAt(targetPt);
  irisMesh.translateZ(bodyL + 0.014);
  podGroup.add(irisMesh);

  return podGroup;
}

/**
 * Creates the complete, high-fidelity IT2 3-Camera Darts Ring Rig assembly.
 * Built with procedural precision matching the exact millimeter dimensions of IT2 Assembly CAD:
 *  - 128-segment silky-smooth circular chassis with beveled edges and modular seams
 *  - 3 standoff mounting legs with counterbored wall shoes and stainless hex hardware
 *  - 3 high-detail camera pods housing OV2710 optical lenses aimed precisely at the bullseye
 *  - Integrated 360° shadowless LED ring light with diffused silicone optic
 */
export function createIT2RingRigGroup(options: IT2RingRigOptions = {}): IT2RingRigGroup {
  const root = new THREE.Group() as IT2RingRigGroup;
  root.name = 'it2-ring-rig';

  // Mount centered at the bullseye height, flush against the back wall (Z = -0.038m)
  root.position.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, -DARTS_DIMENSIONS.BOARD_THICKNESS_METERS);

  // --------------------------------------------------------------------------
  // Core Architectural Materials
  // --------------------------------------------------------------------------
  // Realistic matte black PETG 3D print polymer (satin sheen, micro roughness)
  const petgMat = new THREE.MeshStandardMaterial({
    color: 0x181a20,
    roughness: 0.48,
    metalness: 0.12,
    envMapIntensity: 0.8
  });

  // Darker anthracite accent material for lids, clamps, and ribbing
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x121316,
    roughness: 0.42,
    metalness: 0.16
  });

  // Brushed stainless steel for socket-head screws and mounting hardware
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.92,
    roughness: 0.22
  });

  // Multi-coated optical camera glass (deep anti-reflective cyan/blue sheen)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x07111e,
    roughness: 0.03,
    metalness: 0.94,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    reflectivity: 0.9
  });

  // Active camera green status LED
  const statusLedMat = new THREE.MeshStandardMaterial({
    color: 0x00ff88,
    emissive: 0x00ff88,
    emissiveIntensity: 2.5,
    roughness: 0.2
  });

  // --------------------------------------------------------------------------
  // 1. High-Poly 360° Circular Ring Chassis (128-segment beveled extrusion)
  // --------------------------------------------------------------------------
  const outerR = 0.3675; // 735mm OD
  const innerR = 0.3415; // 683mm ID
  const bevel = 0.0016;
  const ringDepth = 0.0293 - 2 * bevel;

  const ringShape = new THREE.Shape();
  ringShape.absarc(0, 0, outerR - bevel, 0, Math.PI * 2, false);
  const ringHole = new THREE.Path();
  ringHole.absarc(0, 0, innerR + bevel, 0, Math.PI * 2, true);
  ringShape.holes.push(ringHole);

  const ringGeom = new THREE.ExtrudeGeometry(ringShape, {
    depth: ringDepth,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: bevel,
    bevelThickness: bevel,
    curveSegments: 128 // Silky smooth circular curvature
  });
  ringGeom.translate(0, 0, 0.1524);

  const ringMesh = new THREE.Mesh(ringGeom, petgMat);
  ringMesh.name = 'it2-chassis-ring';
  ringMesh.castShadow = true;
  ringMesh.receiveShadow = true;
  root.add(ringMesh);

  // 6 Modular segment joint seams with M3 socket screws (authentic DIY puzzle segments)
  const seamGroup = new THREE.Group();
  seamGroup.name = 'it2-segment-seams';
  for (let s = 0; s < 6; s++) {
    const seamAngle = s * (Math.PI / 3);
    const seamGeom = new THREE.BoxGeometry(0.027, 0.0012, 0.030);
    const seamMesh = new THREE.Mesh(seamGeom, accentMat);
    const midR = (outerR + innerR) / 2;
    seamMesh.position.set(midR * Math.cos(seamAngle), midR * Math.sin(seamAngle), 0.167);
    seamMesh.rotation.z = seamAngle;
    seamGroup.add(seamMesh);

    // M3 joint screws on outer ring lip
    const jScrew = createHexScrew(0.0022, 0.003, metalMat);
    jScrew.position.set((outerR - 0.005) * Math.cos(seamAngle), (outerR - 0.005) * Math.sin(seamAngle), 0.183);
    seamGroup.add(jScrew);
  }
  root.add(seamGroup);

  // --------------------------------------------------------------------------
  // 2. Three Standoff Mounting Legs & Wall Shoes (at 30°, 150°, 270°)
  // --------------------------------------------------------------------------
  const armAngles = [Math.PI / 6, (5 * Math.PI) / 6, (3 * Math.PI) / 2];

  armAngles.forEach((angle, i) => {
    const leg = createStandoffLeg(angle, i, petgMat, accentMat, metalMat);
    root.add(leg);
  });

  // --------------------------------------------------------------------------
  // 3. Three High-Detail Camera Pods with OV2710 Optics (at 30°, 150°, 270°)
  // --------------------------------------------------------------------------
  armAngles.forEach((angle, i) => {
    const pod = createCameraPod(angle, i, petgMat, accentMat, metalMat, glassMat, statusLedMat);
    root.add(pod);
  });

  // --------------------------------------------------------------------------
  // 4. 360° Continuous COB LED Strip & Physical Light Emitters
  // --------------------------------------------------------------------------
  const stripRadius = 0.343;
  const stripWidth = 0.007; // 7mm width inside 6.6mm channel
  const ringZ = 0.173; // CAD Z position in meters

  // Emissive High-CRI LED Core Strip
  const stripGeom = new THREE.CylinderGeometry(stripRadius, stripRadius, stripWidth, 128, 1, true);
  stripGeom.rotateX(Math.PI / 2);
  stripGeom.translate(0, 0, ringZ);

  const stripMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xf6faff,
    emissiveIntensity: 1.8,
    roughness: 0.25,
    metalness: 0.1,
    side: THREE.DoubleSide,
    toneMapped: true
  });
  const ledStripMesh = new THREE.Mesh(stripGeom, stripMat);
  ledStripMesh.name = 'it2-led-strip';
  root.add(ledStripMesh);

  // Frosted Silicone Diffuser Lip for realistic soft glow
  const diffuserRadius = 0.342;
  const diffuserWidth = 0.008;
  const diffuserGeom = new THREE.CylinderGeometry(diffuserRadius, diffuserRadius, diffuserWidth, 128, 1, true);
  diffuserGeom.rotateX(Math.PI / 2);
  diffuserGeom.translate(0, 0, ringZ);

  const diffuserMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.65,
    roughness: 0.5,
    side: THREE.DoubleSide
  });
  const diffuserMesh = new THREE.Mesh(diffuserGeom, diffuserMat);
  diffuserMesh.name = 'it2-led-diffuser';
  root.add(diffuserMesh);

  // 12 Symmetrical 360° Point Light Emitters for true shadowless illumination
  const lightGroup = new THREE.Group();
  lightGroup.name = 'it2-ring-light-group';

  const lights: THREE.PointLight[] = [];
  const lightCount = 12;
  const lightRadius = 0.338; // 338mm (just inside the LED channel)
  const lightZ = 0.170; // 170mm (132mm in front of board face)
  const baseIntensity = 0.14; // Soft, realistic, non-glaring illumination
  const lightColor = 0xf6faff; // 5700K tournament cool daylight

  for (let i = 0; i < lightCount; i++) {
    const angle = (i / lightCount) * Math.PI * 2;
    const x = lightRadius * Math.cos(angle);
    const y = lightRadius * Math.sin(angle);

    const light = new THREE.PointLight(lightColor, baseIntensity, 0.95, 2.0);
    light.name = `it2-led-light-${i}`;
    light.position.set(x, y, lightZ);
    light.castShadow = false; // Zero directional shadows; 360° light cross-cancels shadows
    lightGroup.add(light);
    lights.push(light);
  }
  root.add(lightGroup);

  // --------------------------------------------------------------------------
  // Light State & Controller Methods
  // --------------------------------------------------------------------------
  let isLightEnabled = true;
  let intensityFactor = 1.0;

  const updateLights = () => {
    const factor = isLightEnabled ? intensityFactor : 0.0;
    stripMat.emissiveIntensity = 1.8 * factor;
    diffuserMat.emissiveIntensity = 0.6 * factor;
    stripMat.needsUpdate = true;
    diffuserMat.needsUpdate = true;
    lights.forEach((l) => {
      l.intensity = baseIntensity * factor;
    });
  };

  root.setRingLightEnabled = (enabled: boolean) => {
    isLightEnabled = enabled;
    updateLights();
  };

  root.isRingLightEnabled = () => isLightEnabled;

  root.toggleRingLight = () => {
    isLightEnabled = !isLightEnabled;
    updateLights();
    return isLightEnabled;
  };

  root.setRingLightIntensity = (factor: number) => {
    intensityFactor = Math.max(0, Math.min(3, factor));
    updateLights();
  };

  root.getRingLightIntensity = () => intensityFactor;

  if (options.onLoaded) {
    options.onLoaded(root);
  }

  return root;
}
