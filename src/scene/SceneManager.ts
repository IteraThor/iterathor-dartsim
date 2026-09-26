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

  // Smooth camera transition state
  private isTransitioning = false;
  private transitionStart = 0;
  private transitionDuration = 700; // ms
  private cameraStartPos = new THREE.Vector3();
  private cameraTargetPos = new THREE.Vector3();
  private controlsStartTarget = new THREE.Vector3();
  private controlsTargetTarget = new THREE.Vector3();

  constructor(container: HTMLElement) {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x090a0f);

    // 2. Camera: 3/4 perspective overview showing floor, mat, and board
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.05, 50);
    this.camera.position.set(2.4, 2.2, 3.6);

    // 3. Renderer with antialiasing and soft shadows
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.target.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS * 0.6, 1.1);
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // prevent camera going below floor
    this.controls.minDistance = 0.2;
    this.controls.maxDistance = 10.0;

    // 5. Add Scene Components
    this.scene.add(createDartRoomGroup());
    this.scene.add(createDartboardGroup());
    this.scene.add(createOcheGroup());

    this.dimensionGuides = createDimensionGuidesGroup();
    this.scene.add(this.dimensionGuides);

    // 6. Resize listener
    window.addEventListener('resize', this.onWindowResize);
  }

  public setViewPreset(preset: 'oche' | 'board' | 'side' | 'top' | 'isometric', animate = true): void {
    const targetPos = new THREE.Vector3();
    const targetLook = new THREE.Vector3();

    switch (preset) {
      case 'oche':
        // Player's perspective at the oche (eye level 1.75m looking slightly down at board)
        targetPos.set(0, 1.75, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS);
        targetLook.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS * 0.9, 0);
        break;
      case 'board':
        // Close-up view of the dartboard face, filling the viewport
        targetPos.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 0.42);
        targetLook.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 0);
        break;
      case 'side':
        // Side elevation showing distance from board to oche and the floor
        targetPos.set(2.9, 1.25, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS / 2);
        targetLook.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS / 2, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS / 2);
        break;
      case 'top':
        // Top-down bird's eye floor plan view
        targetPos.set(0, 4.4, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS / 2);
        targetLook.set(0, 0, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS / 2);
        break;
      case 'isometric':
      default:
        // Full 3D room overview showing hardwood floor, runner, and board
        targetPos.set(2.4, 2.2, 3.6);
        targetLook.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS * 0.6, 1.1);
        break;
    }

    if (!animate) {
      this.camera.position.copy(targetPos);
      this.controls.target.copy(targetLook);
      this.controls.update();
      return;
    }

    // Prepare smooth interpolation
    this.cameraStartPos.copy(this.camera.position);
    this.cameraTargetPos.copy(targetPos);
    this.controlsStartTarget.copy(this.controls.target);
    this.controlsTargetTarget.copy(targetLook);
    this.transitionStart = performance.now();
    this.isTransitioning = true;
  }

  public toggleDimensions(visible?: boolean): boolean {
    this.dimensionGuides.visible = visible !== undefined ? visible : !this.dimensionGuides.visible;
    return this.dimensionGuides.visible;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    const animate = (time: number) => {
      if (!this.isRunning) return;
      this.animationFrameId = requestAnimationFrame(animate);

      if (this.isTransitioning) {
        const elapsed = time - this.transitionStart;
        const progress = Math.min(elapsed / this.transitionDuration, 1.0);
        // Smooth EaseInOutCubic
        const t = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        this.camera.position.lerpVectors(this.cameraStartPos, this.cameraTargetPos, t);
        this.controls.target.lerpVectors(this.controlsStartTarget, this.controlsTargetTarget, t);
        this.camera.lookAt(this.controls.target);

        if (progress >= 1.0) {
          this.isTransitioning = false;
          this.controls.update();
        }
      } else {
        this.controls.update();
      }

      this.renderer.render(this.scene, this.camera);
    };
    requestAnimationFrame(animate);
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
