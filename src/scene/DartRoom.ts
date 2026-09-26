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
    color: 0x181a20, // dark studio floor
    roughness: 0.75,
    metalness: 0.12
  });
  const floorMesh = new THREE.Mesh(floorGeom, floorMat);
  floorMesh.name = 'floor';
  floorMesh.position.set(0, 0, roomDepth / 2 - 1.0);
  floorMesh.receiveShadow = true;
  room.add(floorMesh);

  // Floor grid for spatial reference (subtle dark grid)
  const gridHelper = new THREE.GridHelper(roomDepth, 24, 0x333846, 0x222630);
  gridHelper.position.set(0, 0.001, roomDepth / 2 - 1.0);
  room.add(gridHelper);

  // 2. Feature Wall behind dartboard (Z = -0.038m)
  const wallGeom = new THREE.PlaneGeometry(roomWidth, roomHeight);
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x0f1115, // deep matte charcoal
    roughness: 0.92,
    metalness: 0.05
  });
  const wallMesh = new THREE.Mesh(wallGeom, wallMat);
  wallMesh.name = 'back-wall';
  wallMesh.position.set(0, roomHeight / 2, -0.038);
  wallMesh.receiveShadow = true;
  room.add(wallMesh);

  // 3. Lighting Setup
  // Ambient fill light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  room.add(ambientLight);

  // Dartboard Accent Spotlight (simulates modern surround ring lighting / overhead dartboard lights)
  const spotLight = new THREE.SpotLight(0xfff5e6, 2.8);
  spotLight.position.set(0, 2.5, 0.7);
  spotLight.target.position.set(0, 1.727, 0);
  spotLight.angle = Math.PI / 3.2;
  spotLight.penumbra = 0.4;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  room.add(spotLight);
  room.add(spotLight.target);

  // Player area directional fill light
  const playerLight = new THREE.DirectionalLight(0xe0e7ff, 0.75);
  playerLight.position.set(2, 3, 3.5);
  room.add(playerLight);

  // Tournament 360 Light Ring (Target Corona / Winmau Plasma style)
  // Provides shadowless illumination and crisp metallic glints on 3D wires
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
