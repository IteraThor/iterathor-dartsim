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

  // 4. Realistic Two-Source Lighting Setup
  // Indirect ambient bounce
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
  room.add(ambientLight);

  // Fixture canister material for physical ceiling mounts
  const fixtureMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.5,
    metalness: 0.8
  });
  const fixtureGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16);

  // SOURCE 1: Dartboard Task Spotlight (Ceiling mount angled down at board)
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

  const boardFixture = new THREE.Mesh(fixtureGeom, fixtureMat);
  boardFixture.position.set(0, 2.78, 0.65);
  room.add(boardFixture);

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

  const playerFixture = new THREE.Mesh(fixtureGeom, fixtureMat);
  playerFixture.position.set(0, 2.78, 2.65);
  room.add(playerFixture);

  return room;
}
