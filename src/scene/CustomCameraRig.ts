import * as THREE from 'three';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';

export interface BullseyeCoordsMm {
  x: number; // mm relative to bullseye center (+ right, - left)
  y: number; // mm relative to bullseye center (+ up, - down)
  z: number; // mm out in front of dartboard (+ into room)
}

/**
 * Converts millimeter coordinates relative to the Bullseye (0, 0, 0)
 * into Three.js 3D world coordinates (meters).
 */
export function bullseyeMmToWorld(coords: BullseyeCoordsMm): THREE.Vector3 {
  return new THREE.Vector3(
    coords.x / 1000,
    DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS + coords.y / 1000,
    coords.z / 1000
  );
}

/**
 * Converts Three.js 3D world coordinates (meters) into millimeter
 * coordinates relative to the Bullseye (0, 0, 0).
 */
export function worldToBullseyeMm(worldPos: THREE.Vector3): BullseyeCoordsMm {
  return {
    x: Math.round(worldPos.x * 1000),
    y: Math.round((worldPos.y - DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS) * 1000),
    z: Math.round(worldPos.z * 1000)
  };
}

export class CustomCameraRig {
  public camera: THREE.PerspectiveCamera;
  public group: THREE.Group;
  private aimTarget: THREE.Vector3;
  private coordsMm: BullseyeCoordsMm;

  constructor(initialCoordsMm: BullseyeCoordsMm = { x: 350, y: 150, z: 1200 }) {
    this.coordsMm = { ...initialCoordsMm };
    this.aimTarget = new THREE.Vector3(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 0);

    // 1. Secondary Perspective Camera for Live PiP Feed
    // 16:9 aspect ratio, 55° field of view (typical wide webcam/action cam lens)
    this.camera = new THREE.PerspectiveCamera(55, 16 / 9, 0.04, 30);
    // Custom camera only sees layer 0 (default scene objects), omitting layer 1 (its own physical body)
    this.camera.layers.set(0);

    // 2. 3D Camera Model in the Room (Layer 1 so it's visible in main view but invisible to itself)
    this.group = new THREE.Group();
    this.group.name = 'custom-camera-rig';
    this.buildCameraModel();

    this.updatePositionAndAim();
  }

  private buildCameraModel(): void {
    // Camera Housing Body (compact professional high-speed camera aesthetic)
    const bodyGeom = new THREE.BoxGeometry(0.07, 0.05, 0.09);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.8
    });
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.layers.set(1);
    this.group.add(bodyMesh);

    // Front Lens Barrel
    const lensGeom = new THREE.CylinderGeometry(0.02, 0.024, 0.035, 24);
    lensGeom.rotateX(Math.PI / 2);
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.95
    });
    const lensMesh = new THREE.Mesh(lensGeom, lensMat);
    lensMesh.position.set(0, 0, -0.055);
    lensMesh.castShadow = true;
    lensMesh.layers.set(1);
    this.group.add(lensMesh);

    // Glass Optical Aperture (Cyan reflection)
    const glassGeom = new THREE.CircleGeometry(0.017, 24);
    const glassMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      side: THREE.DoubleSide
    });
    const glassMesh = new THREE.Mesh(glassGeom, glassMat);
    glassMesh.position.set(0, 0, -0.073);
    glassMesh.layers.set(1);
    this.group.add(glassMesh);

    // Status Tally Indicator (Amber/Red recording LED)
    const ledGeom = new THREE.SphereGeometry(0.005, 12, 12);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const ledMesh = new THREE.Mesh(ledGeom, ledMat);
    ledMesh.position.set(0.024, 0.016, -0.046);
    ledMesh.layers.set(1);
    this.group.add(ledMesh);

    // Subtle Sightline toward Bullseye
    const sightlineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -0.45)
    ]);
    const sightlineMat = new THREE.LineDashedMaterial({
      color: 0x00e5ff,
      dashSize: 0.04,
      gapSize: 0.02,
      transparent: true,
      opacity: 0.6
    });
    const sightline = new THREE.Line(sightlineGeom, sightlineMat);
    sightline.computeLineDistances();
    sightline.layers.set(1);
    this.group.add(sightline);
  }

  public getCoordsMm(): BullseyeCoordsMm {
    return { ...this.coordsMm };
  }

  public setCoordsMm(coords: Partial<BullseyeCoordsMm>): void {
    if (coords.x !== undefined) this.coordsMm.x = Math.round(coords.x);
    if (coords.y !== undefined) this.coordsMm.y = Math.round(coords.y);
    if (coords.z !== undefined) this.coordsMm.z = Math.round(coords.z);

    this.updatePositionAndAim();
  }

  public setWorldPosition(worldPos: THREE.Vector3): void {
    this.coordsMm = worldToBullseyeMm(worldPos);
    this.updatePositionAndAim();
  }

  public setAimTarget(targetWorld: THREE.Vector3): void {
    this.aimTarget.copy(targetWorld);
    this.updatePositionAndAim();
  }

  private updatePositionAndAim(): void {
    const worldPos = bullseyeMmToWorld(this.coordsMm);

    // Position camera
    this.camera.position.copy(worldPos);
    this.camera.lookAt(this.aimTarget);

    // Position 3D model
    this.group.position.copy(worldPos);
    this.group.lookAt(this.aimTarget);
  }

  public setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  public isVisible(): boolean {
    return this.group.visible;
  }
}
