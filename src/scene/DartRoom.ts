import * as THREE from 'three';
import { createWoodFloorTexture, createWoodFloorBumpMap } from './FloorTexture';
import { createWallTexture, createWallBumpMap } from './WallTexture';

export function createDartRoomGroup(): THREE.Group {
  const room = new THREE.Group();
  room.name = 'dart-room';

  // Room Dimensions: Width = 5.5m, Height = 3.2m, Depth = 6.5m
  const roomWidth = 5.5;
  const roomHeight = 3.2;
  const roomDepth = 6.5;

  // 1. Realistic Hardwood Floor
  const floorGeom = new THREE.PlaneGeometry(roomWidth, roomDepth);
  floorGeom.rotateX(-Math.PI / 2);

  const floorTexture = createWoodFloorTexture();
  const floorBump = createWoodFloorBumpMap();

  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTexture,
    bumpMap: floorBump,
    bumpScale: 0.001,
    roughness: 0.38, // warm satin varnish finish
    metalness: 0.06
  });
  const floorMesh = new THREE.Mesh(floorGeom, floorMat);
  floorMesh.name = 'floor';
  // Position so floor extends from back wall (Z = -0.038) forward to Z = 6.4m
  floorMesh.position.set(0, 0, roomDepth / 2 - 0.038);
  floorMesh.receiveShadow = true;
  room.add(floorMesh);

  // 2. Baseboard / Skirting Trim along the bottom of the wall
  const baseboardGeom = new THREE.BoxGeometry(roomWidth, 0.09, 0.02);
  const baseboardMat = new THREE.MeshStandardMaterial({
    color: 0x241d18, // matching dark wood skirting
    roughness: 0.5,
    metalness: 0.1
  });
  const baseboardMesh = new THREE.Mesh(baseboardGeom, baseboardMat);
  baseboardMesh.name = 'baseboard';
  baseboardMesh.position.set(0, 0.045, -0.028);
  baseboardMesh.receiveShadow = true;
  baseboardMesh.castShadow = true;
  room.add(baseboardMesh);

  // 3. Feature Wall behind dartboard (Z = -0.038m)
  const wallTexture = createWallTexture();
  const wallBump = createWallBumpMap();

  const wallGeom = new THREE.PlaneGeometry(roomWidth, roomHeight);
  const wallMat = new THREE.MeshStandardMaterial({
    map: wallTexture,
    bumpMap: wallBump,
    bumpScale: 0.0018,
    roughness: 0.82,
    metalness: 0.04
  });
  const wallMesh = new THREE.Mesh(wallGeom, wallMat);
  wallMesh.name = 'back-wall';
  wallMesh.position.set(0, roomHeight / 2, -0.038);
  wallMesh.receiveShadow = true;
  room.add(wallMesh);

  // 4. Ceiling Crown Trim along the top of the wall
  const crownGeom = new THREE.BoxGeometry(roomWidth, 0.08, 0.03);
  const crownMat = new THREE.MeshStandardMaterial({
    color: 0x181a20,
    roughness: 0.6,
    metalness: 0.08
  });
  const crownMesh = new THREE.Mesh(crownGeom, crownMat);
  crownMesh.name = 'crown-trim';
  crownMesh.position.set(0, roomHeight - 0.04, -0.028);
  crownMesh.receiveShadow = true;
  room.add(crownMesh);

  // 5. Side Wall to the right of the player (X = +2.75m)
  const sideWallTexture = createWallTexture();
  sideWallTexture.repeat.set(2.5, 1);
  const sideWallBump = createWallBumpMap();
  sideWallBump.repeat.set(2.5, 1);

  const sideWallGeom = new THREE.PlaneGeometry(roomDepth, roomHeight);
  sideWallGeom.rotateY(-Math.PI / 2);

  const sideWallMat = new THREE.MeshStandardMaterial({
    map: sideWallTexture,
    bumpMap: sideWallBump,
    bumpScale: 0.0018,
    roughness: 0.82,
    metalness: 0.04,
    side: THREE.FrontSide
  });
  const sideWallMesh = new THREE.Mesh(sideWallGeom, sideWallMat);
  sideWallMesh.name = 'right-wall';
  // Positioned at X = +roomWidth / 2 (+2.75m), spanning from back wall (Z = -0.038) forward
  sideWallMesh.position.set(roomWidth / 2, roomHeight / 2, roomDepth / 2 - 0.038);
  sideWallMesh.receiveShadow = true;
  room.add(sideWallMesh);

  // Side Wall Baseboard / Skirting Trim along the floor edge
  const sideBaseboardGeom = new THREE.BoxGeometry(0.02, 0.09, roomDepth);
  const sideBaseboardMesh = new THREE.Mesh(sideBaseboardGeom, baseboardMat);
  sideBaseboardMesh.name = 'side-baseboard';
  sideBaseboardMesh.position.set(roomWidth / 2 - 0.01, 0.045, roomDepth / 2 - 0.038);
  sideBaseboardMesh.receiveShadow = true;
  sideBaseboardMesh.castShadow = true;
  room.add(sideBaseboardMesh);

  // Side Wall Crown Trim along the ceiling edge
  const sideCrownGeom = new THREE.BoxGeometry(0.03, 0.08, roomDepth);
  const sideCrownMesh = new THREE.Mesh(sideCrownGeom, crownMat);
  sideCrownMesh.name = 'side-crown-trim';
  sideCrownMesh.position.set(roomWidth / 2 - 0.015, roomHeight - 0.04, roomDepth / 2 - 0.038);
  sideCrownMesh.receiveShadow = true;
  room.add(sideCrownMesh);

  // 6. Decorative Wall-Mounted Lights on Right Wall (Sconces with up/down wash)
  const sconceZPositions = [1.15, 2.75, 4.35];
  const sconceHeight = 1.95;
  const wallX = roomWidth / 2; // 2.75m

  sconceZPositions.forEach((z, idx) => {
    const sconceGroup = createWallSconce(wallX, sconceHeight, z, idx + 1);
    room.add(sconceGroup);
  });

  // 7. Physical Wall Light Switch on Right Wall (near oche at Z = 2.45m, Y = 1.25m)
  const lightSwitch = createWallLightSwitch(wallX, 1.25, 2.45);
  room.add(lightSwitch);

  // 8. Daylight Lighting Group (Bright sun + sky hemisphere light, toggled via light switch)
  const daylightGroup = new THREE.Group();
  daylightGroup.name = 'daylight-group';
  daylightGroup.visible = true; // default daylight mode

  const daylightHemi = new THREE.HemisphereLight(0xe2f0fc, 0xd8c8b4, 1.5);
  daylightHemi.name = 'daylight-hemi';
  daylightGroup.add(daylightHemi);

  const sunLight = new THREE.DirectionalLight(0xfffbf2, 2.2);
  sunLight.name = 'daylight-sun';
  sunLight.position.set(-3.2, 4.2, 3.2);
  sunLight.target.position.set(0.4, 0.4, 1.4);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 14;
  sunLight.shadow.camera.left = -4;
  sunLight.shadow.camera.right = 4;
  sunLight.shadow.camera.top = 4;
  sunLight.shadow.camera.bottom = -4;
  sunLight.shadow.bias = -0.0004;
  daylightGroup.add(sunLight);
  daylightGroup.add(sunLight.target);

  room.add(daylightGroup);

  // 9. Realistic Ambient & Physical Fixture Lighting Setup
  // Indirect ambient bounce (0.75 for daylight mode)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
  ambientLight.name = 'ambient-light';
  room.add(ambientLight);

  // SOURCE 1: Dartboard Task Spotlight (Angled down at board)
  const boardSpot = new THREE.SpotLight(0xfff6eb, 3.4);
  boardSpot.name = 'dartboard-spotlight';
  boardSpot.position.set(0, 2.75, 0.65);
  boardSpot.target.position.set(0, 1.727, 0);
  boardSpot.angle = Math.PI / 3.4;
  boardSpot.penumbra = 0.45;
  boardSpot.castShadow = true;
  boardSpot.shadow.mapSize.width = 2048;
  boardSpot.shadow.mapSize.height = 2048;
  boardSpot.shadow.bias = -0.0001;
  room.add(boardSpot);
  room.add(boardSpot.target);

  // SOURCE 2: Player Ceiling Light (Mounted overhead close to player at throw line)
  // Brighter wide-cone downlight to illuminate the floor and player area naturally
  const playerCeilingLight = new THREE.SpotLight(0xfff2e0, 4.2);
  playerCeilingLight.name = 'player-ceiling-light';
  playerCeilingLight.position.set(0, 2.75, 2.5);
  playerCeilingLight.target.position.set(0, 0, 2.0);
  playerCeilingLight.angle = Math.PI / 2.2;
  playerCeilingLight.penumbra = 0.65;
  playerCeilingLight.castShadow = true;
  playerCeilingLight.shadow.mapSize.width = 1024;
  playerCeilingLight.shadow.mapSize.height = 1024;
  playerCeilingLight.shadow.bias = -0.0001;
  room.add(playerCeilingLight);
  room.add(playerCeilingLight.target);

  return room;
}

/**
 * Creates an architectural wall sconce fixture with brushed brass accents,
 * emissive diffuser caps, and warm up/down light wash along the wall surface.
 */
function createWallSconce(wallX: number, y: number, z: number, id: number): THREE.Group {
  const sconce = new THREE.Group();
  sconce.name = `wall-sconce-${id}`;

  const fixtureMat = new THREE.MeshStandardMaterial({
    color: 0x141418, // sleek matte graphite architectural metal
    roughness: 0.35,
    metalness: 0.85
  });

  const brassTrimMat = new THREE.MeshStandardMaterial({
    color: 0xc89b53, // brushed warm brass accent rings
    roughness: 0.25,
    metalness: 0.90
  });

  const lensMat = new THREE.MeshStandardMaterial({
    color: 0xfff0d8,
    emissive: 0xffc678,
    emissiveIntensity: 2.2,
    roughness: 0.2,
    metalness: 0.1
  });

  // 1. Wall Mounting Baseplate (flush against wall at wallX = 2.75)
  const baseplateGeom = new THREE.BoxGeometry(0.012, 0.16, 0.07);
  const baseplate = new THREE.Mesh(baseplateGeom, fixtureMat);
  baseplate.name = `sconce-baseplate-${id}`;
  baseplate.position.set(wallX - 0.006, y, z);
  baseplate.castShadow = true;
  sconce.add(baseplate);

  // 2. Horizontal standoff bracket arm
  const armGeom = new THREE.BoxGeometry(0.035, 0.02, 0.025);
  const arm = new THREE.Mesh(armGeom, fixtureMat);
  arm.position.set(wallX - 0.025, y, z);
  sconce.add(arm);

  // 3. Main Sconce Cylinder Body
  const cylinderRadius = 0.032;
  const cylinderHeight = 0.22;
  const cylinderGeom = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight, 24);
  const body = new THREE.Mesh(cylinderGeom, fixtureMat);
  body.name = `sconce-body-${id}`;
  const bodyX = wallX - 0.048;
  body.position.set(bodyX, y, z);
  body.castShadow = true;
  sconce.add(body);

  // 4. Brass accent trim rings
  const ringGeom = new THREE.CylinderGeometry(cylinderRadius + 0.0015, cylinderRadius + 0.0015, 0.008, 24);
  const topRing = new THREE.Mesh(ringGeom, brassTrimMat);
  topRing.position.set(bodyX, y + cylinderHeight / 2 - 0.02, z);
  sconce.add(topRing);

  const bottomRing = new THREE.Mesh(ringGeom, brassTrimMat);
  bottomRing.position.set(bodyX, y - cylinderHeight / 2 + 0.02, z);
  sconce.add(bottomRing);

  // 5. Emissive diffuser lenses (top & bottom)
  const lensGeom = new THREE.CylinderGeometry(cylinderRadius - 0.003, cylinderRadius - 0.003, 0.014, 24);
  const topLens = new THREE.Mesh(lensGeom, lensMat);
  topLens.position.set(bodyX, y + cylinderHeight / 2 + 0.006, z);
  sconce.add(topLens);

  const bottomLens = new THREE.Mesh(lensGeom, lensMat);
  bottomLens.position.set(bodyX, y - cylinderHeight / 2 - 0.006, z);
  sconce.add(bottomLens);

  // 6. Upward Light Wash against the right wall
  const upSpot = new THREE.SpotLight(0xffd59e, 1.8);
  upSpot.name = `sconce-up-${id}`;
  upSpot.position.set(bodyX, y + 0.12, z);
  upSpot.target.position.set(wallX, y + 1.1, z);
  upSpot.angle = Math.PI / 4.5;
  upSpot.penumbra = 0.8;
  upSpot.distance = 2.4;
  upSpot.decay = 2.0;
  sconce.add(upSpot);
  sconce.add(upSpot.target);

  // 7. Downward Light Wash against the right wall
  const downSpot = new THREE.SpotLight(0xffd59e, 1.8);
  downSpot.name = `sconce-down-${id}`;
  downSpot.position.set(bodyX, y - 0.12, z);
  downSpot.target.position.set(wallX, y - 1.1, z);
  downSpot.angle = Math.PI / 4.5;
  downSpot.penumbra = 0.8;
  downSpot.distance = 2.4;
  downSpot.decay = 2.0;
  sconce.add(downSpot);
  sconce.add(downSpot.target);

  // 8. Subtle warm ambient glow
  const glow = new THREE.PointLight(0xffe0b8, 0.4, 1.8, 2.0);
  glow.position.set(bodyX - 0.02, y, z);
  sconce.add(glow);

  return sconce;
}

/**
 * Creates an interactive physical architectural wall rocker switch on the right wall.
 * Includes flush faceplate, dark accent bezel, mechanical rocker, and status LED indicator.
 */
function createWallLightSwitch(wallX: number, y: number, z: number): THREE.Group {
  const switchGroup = new THREE.Group();
  switchGroup.name = 'wall-light-switch';
  switchGroup.userData = { isInteractiveSwitch: true };

  // 1. Faceplate (flush mounted against right wall at wallX = 2.75)
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0xf4f5f7,
    roughness: 0.3,
    metalness: 0.1
  });
  const plateGeom = new THREE.BoxGeometry(0.008, 0.09, 0.09);
  const plate = new THREE.Mesh(plateGeom, plateMat);
  plate.name = 'switch-plate';
  plate.position.set(wallX - 0.004, y, z);
  plate.castShadow = true;
  switchGroup.add(plate);

  // 2. Bezel rim
  const bezelMat = new THREE.MeshStandardMaterial({
    color: 0x222428,
    roughness: 0.5,
    metalness: 0.5
  });
  const bezelGeom = new THREE.BoxGeometry(0.006, 0.094, 0.094);
  const bezel = new THREE.Mesh(bezelGeom, bezelMat);
  bezel.position.set(wallX - 0.003, y, z);
  switchGroup.add(bezel);

  // 3. Rocker switch button
  const rockerMat = new THREE.MeshStandardMaterial({
    color: 0xe8eaed,
    roughness: 0.25,
    metalness: 0.15
  });
  const rockerGeom = new THREE.BoxGeometry(0.010, 0.05, 0.04);
  const rocker = new THREE.Mesh(rockerGeom, rockerMat);
  rocker.name = 'switch-rocker';
  rocker.position.set(wallX - 0.008, y, z);
  // Default daylight tilt: tilted upward (ON)
  rocker.rotation.z = 0.09;
  switchGroup.add(rocker);

  // 4. Tiny LED indicator pip (green for active daylight)
  const indicatorMat = new THREE.MeshStandardMaterial({
    color: 0x00ff88,
    emissive: 0x00ff88,
    emissiveIntensity: 2.0,
    roughness: 0.2
  });
  const indicatorGeom = new THREE.SphereGeometry(0.0025, 8, 8);
  const indicator = new THREE.Mesh(indicatorGeom, indicatorMat);
  indicator.name = 'switch-indicator';
  indicator.position.set(wallX - 0.014, y + 0.016, z);
  switchGroup.add(indicator);

  return switchGroup;
}
