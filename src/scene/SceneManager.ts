import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createDartRoomGroup } from './DartRoom';
import { createDartboardGroup } from './Dartboard';
import { createOcheGroup } from './Oche';
import { createDimensionGuidesGroup } from './DimensionGuides';
import { createPlayerDummyGroup } from './PlayerDummy';
import { createIT2RingRigGroup, IT2RingRigGroup } from './IT2RingRig';
import { createDartsGroup } from './Darts';
import { DARTS_DIMENSIONS } from '../constants/dartsDimensions';

export class SceneManager {
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;
  public dimensionGuides: THREE.Group;
  public playerDummy: THREE.Group;
  public it2RingRig: IT2RingRigGroup;
  public darts: THREE.Group;

  public isDaylight = false;
  private daylightGroup: THREE.Group | null = null;
  private ambientLight: THREE.AmbientLight | null = null;
  private boardSpot: THREE.SpotLight | null = null;
  private wallLightSwitch: THREE.Group | null = null;
  private daylightCallbacks: ((isDaylight: boolean) => void)[] = [];

  public isRingLightActive = true;
  private ringLightCallbacks: ((isOn: boolean) => void)[] = [];
  private dartsCallbacks: ((hasDarts: boolean) => void)[] = [];

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private pointerDownPos = new THREE.Vector2();

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
    this.camera.position.set(-2.4, 2.2, 3.6);

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
    const room = createDartRoomGroup();
    this.scene.add(room);
    this.daylightGroup = room.getObjectByName('daylight-group') as THREE.Group;
    this.ambientLight = room.getObjectByName('ambient-light') as THREE.AmbientLight;
    this.boardSpot = room.getObjectByName('dartboard-spotlight') as THREE.SpotLight;
    this.wallLightSwitch = room.getObjectByName('wall-light-switch') as THREE.Group;

    this.scene.add(createDartboardGroup());
    this.scene.add(createOcheGroup());

    this.dimensionGuides = createDimensionGuidesGroup();
    this.scene.add(this.dimensionGuides);

    this.playerDummy = createPlayerDummyGroup();
    this.scene.add(this.playerDummy);

    this.it2RingRig = createIT2RingRigGroup();
    this.scene.add(this.it2RingRig);

    this.darts = createDartsGroup();
    this.scene.add(this.darts);

    this.updateBoardLighting();

    // 6. Interactive Physical Light Switch raycasting on the right wall
    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', (e: PointerEvent) => {
      this.pointerDownPos.set(e.clientX, e.clientY);
    });

    dom.addEventListener('pointerup', (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
      if (dist < 6) { // Click, not orbit drag
        const rect = dom.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        if (this.wallLightSwitch) {
          const intersects = this.raycaster.intersectObjects(this.wallLightSwitch.children, true);
          if (intersects.length > 0) {
            this.toggleDaylight();
          }
        }
      }
    });

    dom.addEventListener('pointermove', (e: PointerEvent) => {
      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      if (this.wallLightSwitch) {
        const intersects = this.raycaster.intersectObjects(this.wallLightSwitch.children, true);
        if (intersects.length > 0) {
          dom.style.cursor = 'pointer';
        } else if (dom.style.cursor === 'pointer') {
          dom.style.cursor = 'grab';
        }
      }
    });

    // 7. Resize listener
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
        // Side elevation showing distance from board to oche, floor, and side wall
        targetPos.set(-2.9, 1.25, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS / 2);
        targetLook.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS / 2, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS / 2);
        break;
      case 'top':
        // Top-down bird's eye floor plan view
        targetPos.set(0, 4.4, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS / 2);
        targetLook.set(0, 0, DARTS_DIMENSIONS.OCHE_DISTANCE_METERS / 2);
        break;
      case 'isometric':
      default:
        // Full 3D room overview showing hardwood floor, runner, board, and right side wall
        targetPos.set(-2.4, 2.2, 3.6);
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

  public togglePlayerDummy(visible?: boolean): boolean {
    this.playerDummy.visible = visible !== undefined ? visible : !this.playerDummy.visible;
    return this.playerDummy.visible;
  }

  public toggleIT2Rig(visible?: boolean): boolean {
    this.it2RingRig.visible = visible !== undefined ? visible : !this.it2RingRig.visible;
    this.updateBoardLighting();
    return this.it2RingRig.visible;
  }

  private updateBoardLighting(): void {
    const isRingActive = this.it2RingRig.visible && this.isRingLightActive;
    this.it2RingRig.setRingLightEnabled(isRingActive);

    if (this.boardSpot) {
      // When the 360° shadowless ring light is active, dim down the ceiling task spot
      // to 0.35 (soft ambient fill) so the board is illuminated from all 360° with no downward shadows.
      // When ring light is off, restore 3.4 for standard directional ceiling spotlight.
      this.boardSpot.intensity = isRingActive ? 0.35 : 3.4;
    }

    this.ringLightCallbacks.forEach(cb => cb(isRingActive));
  }

  public toggleRingLight(enable?: boolean): boolean {
    this.isRingLightActive = enable !== undefined ? enable : !this.isRingLightActive;
    this.updateBoardLighting();
    return this.isRingLightActive;
  }

  public isRingLightOn(): boolean {
    return this.it2RingRig.visible && this.isRingLightActive;
  }

  public onRingLightChange(callback: (isOn: boolean) => void): void {
    this.ringLightCallbacks.push(callback);
  }

  public toggleDarts(visible?: boolean): boolean {
    this.darts.visible = visible !== undefined ? visible : !this.darts.visible;
    this.dartsCallbacks.forEach(cb => cb(this.darts.visible));
    return this.darts.visible;
  }

  public onDartsChange(callback: (hasDarts: boolean) => void): void {
    this.dartsCallbacks.push(callback);
  }

  public toggleDaylight(enable?: boolean): boolean {
    this.isDaylight = enable !== undefined ? enable : !this.isDaylight;

    if (this.daylightGroup) {
      this.daylightGroup.visible = this.isDaylight;
    }

    if (this.ambientLight) {
      this.ambientLight.intensity = this.isDaylight ? 0.75 : 0.35;
    }

    if (this.scene) {
      this.scene.background = new THREE.Color(this.isDaylight ? 0x222834 : 0x090a0f);
    }

    if (this.wallLightSwitch) {
      const rocker = this.wallLightSwitch.getObjectByName('switch-rocker');
      if (rocker) {
        rocker.rotation.z = this.isDaylight ? 0.09 : -0.09;
      }
      const indicator = this.wallLightSwitch.getObjectByName('switch-indicator') as THREE.Mesh;
      if (indicator && indicator.material instanceof THREE.MeshStandardMaterial) {
        if (this.isDaylight) {
          indicator.material.color.setHex(0x00ff88);
          indicator.material.emissive.setHex(0x00ff88);
          indicator.material.emissiveIntensity = 2.0;
        } else {
          indicator.material.color.setHex(0xffaa00);
          indicator.material.emissive.setHex(0xff8800);
          indicator.material.emissiveIntensity = 1.5;
        }
      }
    }

    this.daylightCallbacks.forEach(cb => cb(this.isDaylight));
    return this.isDaylight;
  }

  public onDaylightChange(callback: (isDaylight: boolean) => void): void {
    this.daylightCallbacks.push(callback);
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
