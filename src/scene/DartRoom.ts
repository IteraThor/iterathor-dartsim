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

  // 4. Lighting Setup
  // Ambient fill light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  room.add(ambientLight);

  // Dartboard Accent Spotlight
  const spotLight = new THREE.SpotLight(0xfff5e6, 2.8);
  spotLight.position.set(0, 2.6, 0.7);
  spotLight.target.position.set(0, 1.727, 0);
  spotLight.angle = Math.PI / 3.2;
  spotLight.penumbra = 0.4;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  room.add(spotLight);
  room.add(spotLight.target);

  // Warm Overhead Room Downlight (illuminates the hardwood floor and player area)
  const roomDownlight = new THREE.PointLight(0xfff4e6, 2.2, 7.0);
  roomDownlight.position.set(0, 2.7, 1.6);
  roomDownlight.castShadow = true;
  room.add(roomDownlight);

  // Player area directional fill light
  const playerLight = new THREE.DirectionalLight(0xe0e7ff, 0.6);
  playerLight.position.set(2, 3, 3.5);
  room.add(playerLight);

  // Tournament 360 Light Ring (Target Corona / Winmau Plasma style)
  const ringLightTop = new THREE.PointLight(0xfff8ee, 1.4, 2.5);
  ringLightTop.position.set(0, 1.727 + 0.38, 0.22);
  room.add(ringLightTop);

  const ringLightLeft = new THREE.PointLight(0xfff8ee, 1.2, 2.5);
  ringLightLeft.position.set(-0.38, 1.727 - 0.1, 0.22);
  room.add(ringLightLeft);

  const ringLightRight = new THREE.PointLight(0xfff8ee, 1.2, 2.5);
  ringLightRight.position.set(0.38, 1.727 - 0.1, 0.22);
  room.add(ringLightRight);

  return room;
}
