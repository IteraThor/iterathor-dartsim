import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createDartRoomGroup } from './DartRoom';
import { createDartboardGroup } from './Dartboard';
import { createOcheGroup } from './Oche';
import { createDimensionGuidesGroup } from './DimensionGuides';
import { createPlayerDummyGroup } from './PlayerDummy';
import { createIT2RingRigGroup, IT2RingRigGroup } from './IT2RingRig';
import { createDartsGroup } from './Darts';
import { createPivotOrbGroup, createStandingMarkerGroup } from './PivotMarker';
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
  public pivotOrb: THREE.Group;
  public standingMarker: THREE.Group;

  public isDaylight = true;
  private daylightGroup: THREE.Group | null = null;
  private ambientLight: THREE.AmbientLight | null = null;
  private boardSpot: THREE.SpotLight | null = null;
  private wallLightSwitch: THREE.Group | null = null;
  private daylightCallbacks: ((isDaylight: boolean) => void)[] = [];

  public isRingLightActive = true;
  private ringLightCallbacks: ((isOn: boolean) => void)[] = [];
  private dartsCallbacks: ((hasDarts: boolean) => void)[] = [];

  public currentPreset: 'oche' | 'board' | 'side' | 'top' | 'isometric' | null = 'isometric';
  private presetCallbacks: ((preset: 'oche' | 'board' | 'side' | 'top' | 'isometric' | null) => void)[] = [];

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private pointerDownPos = new THREE.Vector2();

  private isRunning = false;
  private animationFrameId = 0;

  // Continuous Camera Walk/Fly movement state
  public moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
  };
  public moveSpeed = 1.1; // meters per second (gentle, controlled movement)

  // Camera Tilt/Rotate state
  public rotateState = {
    tiltUp: false,
    tiltDown: false,
    rotateLeft: false,
    rotateRight: false
  };
  public rotateSpeed = 1.6; // radians per second

  // Camera Zoom state (closer/further from the stationary orb)
  public zoomState = {
    zoomIn: false,
    zoomOut: false
  };
  public zoomSpeed = 2.2; // meters per second

  private lastFrameTime = performance.now();
  private moveEndCallbacks: (() => void)[] = [];
  private pivotOrbCallbacks: ((visible: boolean) => void)[] = [];

  // Direct touch/pointer dragging of the floating orb in the room
  private isDraggingOrb = false;
  private orbDragPointerId: number | null = null;
  private orbDragPlane = new THREE.Plane();
  private orbDragLastPoint = new THREE.Vector3();

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
    this.scene.background = new THREE.Color(0x222834);

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

    // 4. OrbitControls centered strictly around the Orb (controls.target)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false; // Panning disabled so background touch strictly orbits around orb
    this.controls.enableRotate = true;
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE
    };
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
    this.controls.target.set(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS * 0.6, 1.1);
    this.controls.minPolarAngle = 0.02;
    this.controls.maxPolarAngle = Math.PI - 0.02; // Full vertical range: from bottom floor to top
    this.controls.minDistance = 0.2;
    this.controls.maxDistance = 10.0;

    // Reset preset indicator when user manually orbits or zooms around the orb
    this.controls.addEventListener('start', () => {
      if (this.currentPreset !== null) {
        this.currentPreset = null;
        this.presetCallbacks.forEach(cb => cb(null));
      }
    });

    this.setupKeyboardControls();

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

    this.pivotOrb = createPivotOrbGroup();
    this.scene.add(this.pivotOrb);

    this.standingMarker = createStandingMarkerGroup();
    this.scene.add(this.standingMarker);

    this.updateBoardLighting();
    this.toggleDaylight(true);

    // 6. Interactive Direct Orb Dragging & Light Switch raycasting
    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', (e: PointerEvent) => {
      this.pointerDownPos.set(e.clientX, e.clientY);

      // Check if user touched directly on the pivot orb to drag it across the room
      if (this.pivotOrb.visible) {
        const rect = dom.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;

        // Project orb's 3D position to 2D screen coordinates
        const orbScreen = this.controls.target.clone().project(this.camera);

        // Orb must be in front of the camera
        if (orbScreen.z < 1.0) {
          const orbPixelX = ((orbScreen.x + 1) / 2) * rect.width;
          const orbPixelY = ((-orbScreen.y + 1) / 2) * rect.height;
          const touchRadius = Math.hypot(clientX - orbPixelX, clientY - orbPixelY);

          // Strictly require touching directly on the orb (within 35px radius)
          if (touchRadius <= 35) {
            this.isDraggingOrb = true;
            this.orbDragPointerId = e.pointerId;
            this.controls.enabled = false; // Suspend OrbitControls while directly dragging orb

            // Camera-facing drag plane through current orb target
            const normal = new THREE.Vector3();
            this.camera.getWorldDirection(normal).negate();
            this.orbDragPlane.setFromNormalAndCoplanarPoint(normal, this.controls.target);

            this.mouse.x = (clientX / rect.width) * 2 - 1;
            this.mouse.y = -(clientY / rect.height) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera);
            this.raycaster.ray.intersectPlane(this.orbDragPlane, this.orbDragLastPoint);
            dom.style.cursor = 'grabbing';
            return;
          }
        }
      }
    });

    dom.addEventListener('pointermove', (e: PointerEvent) => {
      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Handle direct orb dragging across the room (view position stands still)
      if (this.isDraggingOrb && e.pointerId === this.orbDragPointerId) {
        const currentPoint = new THREE.Vector3();
        if (this.raycaster.ray.intersectPlane(this.orbDragPlane, currentPoint)) {
          const delta = new THREE.Vector3().subVectors(currentPoint, this.orbDragLastPoint);
          this.controls.target.add(delta);

          // Boundaries to keep orb inside the darts room
          this.controls.target.x = THREE.MathUtils.clamp(this.controls.target.x, -2.4, 2.4);
          this.controls.target.y = THREE.MathUtils.clamp(this.controls.target.y, 0.1, 2.85);
          this.controls.target.z = THREE.MathUtils.clamp(this.controls.target.z, 0.05, 5.8);

          this.orbDragLastPoint.copy(currentPoint);
          this.camera.lookAt(this.controls.target);
          this.controls.update();

          if (this.currentPreset !== null) {
            this.currentPreset = null;
            this.presetCallbacks.forEach(cb => cb(null));
          }
        }
        return;
      }

      if (e.pointerType === 'mouse') {
        if (this.pivotOrb.visible) {
          const orbScreen = this.controls.target.clone().project(this.camera);
          if (orbScreen.z < 1.0) {
            const orbPixelX = ((orbScreen.x + 1) / 2) * rect.width;
            const orbPixelY = ((-orbScreen.y + 1) / 2) * rect.height;
            const touchRadius = Math.hypot((e.clientX - rect.left) - orbPixelX, (e.clientY - rect.top) - orbPixelY);
            if (touchRadius <= 25) {
              dom.style.cursor = 'grab';
              return;
            }
          }
        }
        if (this.wallLightSwitch && this.raycaster.intersectObjects(this.wallLightSwitch.children, true).length > 0) {
          dom.style.cursor = 'pointer';
        } else {
          dom.style.cursor = 'default';
        }
      }
    });

    const stopOrbDrag = (e: PointerEvent) => {
      if (this.isDraggingOrb && e.pointerId === this.orbDragPointerId) {
        this.isDraggingOrb = false;
        this.orbDragPointerId = null;
        this.controls.enabled = true;
        dom.style.cursor = 'default';
        this.moveEndCallbacks.forEach(cb => cb());
        return;
      }

      const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
      if (dist < 15) { // Click/tap on switch
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
    };

    dom.addEventListener('pointerup', stopOrbDrag);
    dom.addEventListener('pointercancel', stopOrbDrag);

    // 7. Resize listener
    window.addEventListener('resize', this.onWindowResize);
  }

  public setViewPreset(preset: 'oche' | 'board' | 'side' | 'top' | 'isometric', animate = true): void {
    this.currentPreset = preset;
    this.presetCallbacks.forEach(cb => cb(preset));
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
      // When ring light is active, maintain soft warm frontal fill (0.5) to preserve color depth and saturation,
      // avoiding perimeter blowout while keeping shadowless board play.
      // When ring light is off, restore 3.4 for full directional ceiling illumination.
      this.boardSpot.intensity = isRingActive ? 0.5 : 3.4;
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

  public setRingLightIntensity(factor: number): void {
    this.it2RingRig.setRingLightIntensity(factor);
  }

  public getRingLightIntensity(): number {
    return this.it2RingRig.getRingLightIntensity();
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

  public setMove(direction: keyof typeof this.moveState, active: boolean): void {
    const wasActive = this.moveState[direction];
    this.moveState[direction] = active;
    if (active) {
      this.isTransitioning = false;
      if (this.currentPreset !== null) {
        this.currentPreset = null;
        this.presetCallbacks.forEach(cb => cb(null));
      }
    } else if (wasActive && !this.isMoving()) {
      this.moveEndCallbacks.forEach(cb => cb());
    }
  }

  public isMoving(): boolean {
    return (
      this.moveState.forward ||
      this.moveState.backward ||
      this.moveState.left ||
      this.moveState.right ||
      this.moveState.up ||
      this.moveState.down
    );
  }

  public setRotate(direction: keyof typeof this.rotateState, active: boolean): void {
    const wasActive = this.rotateState[direction];
    this.rotateState[direction] = active;
    if (active) {
      this.isTransitioning = false;
      if (this.currentPreset !== null) {
        this.currentPreset = null;
        this.presetCallbacks.forEach(cb => cb(null));
      }
    } else if (wasActive && !this.isRotating()) {
      this.moveEndCallbacks.forEach(cb => cb());
    }
  }

  public isRotating(): boolean {
    return (
      this.rotateState.tiltUp ||
      this.rotateState.tiltDown ||
      this.rotateState.rotateLeft ||
      this.rotateState.rotateRight
    );
  }

  public rotateAroundOrb(deltaTheta: number, deltaPhi: number): void {
    this.isTransitioning = false;
    // Vector from target (orb) to camera
    const offset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
    if (offset.lengthSq() < 0.0001) {
      offset.set(0, 0, 1);
    }
    const spherical = new THREE.Spherical().setFromVector3(offset);

    spherical.theta += deltaTheta;
    spherical.phi += deltaPhi;

    // Allow full vertical rotation (from low floor level looking up to ceiling looking down)
    spherical.phi = THREE.MathUtils.clamp(spherical.phi, 0.02, Math.PI - 0.02);
    spherical.makeSafe();

    offset.setFromSpherical(spherical);
    this.camera.position.copy(this.controls.target).add(offset);

    // Keep camera within room boundaries
    this.camera.position.x = THREE.MathUtils.clamp(this.camera.position.x, -2.65, 2.65);
    this.camera.position.y = THREE.MathUtils.clamp(this.camera.position.y, 0.05, 3.05);
    this.camera.position.z = THREE.MathUtils.clamp(this.camera.position.z, -0.01, 6.2);

    this.camera.lookAt(this.controls.target);
    this.controls.update();

    if (this.currentPreset !== null) {
      this.currentPreset = null;
      this.presetCallbacks.forEach(cb => cb(null));
    }
  }

  public setZoom(direction: keyof typeof this.zoomState, active: boolean): void {
    const wasActive = this.zoomState[direction];
    this.zoomState[direction] = active;
    if (active) {
      this.isTransitioning = false;
      if (this.currentPreset !== null) {
        this.currentPreset = null;
        this.presetCallbacks.forEach(cb => cb(null));
      }
    } else if (wasActive && !this.isMoving() && !this.isRotating() && !this.isZooming()) {
      this.moveEndCallbacks.forEach(cb => cb());
    }
  }

  public isZooming(): boolean {
    return this.zoomState.zoomIn || this.zoomState.zoomOut;
  }

  public zoomTowardsOrb(deltaDist: number): void {
    this.isTransitioning = false;
    const offset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
    const curDist = offset.length();
    if (curDist < 0.0001) return;

    // deltaDist < 0 moves closer to orb, deltaDist > 0 moves further
    const newDist = THREE.MathUtils.clamp(curDist + deltaDist, this.controls.minDistance, this.controls.maxDistance);
    offset.setLength(newDist);

    this.camera.position.copy(this.controls.target).add(offset);

    // Keep camera within room boundaries
    this.camera.position.x = THREE.MathUtils.clamp(this.camera.position.x, -2.65, 2.65);
    this.camera.position.y = THREE.MathUtils.clamp(this.camera.position.y, 0.05, 3.05);
    this.camera.position.z = THREE.MathUtils.clamp(this.camera.position.z, -0.01, 6.2);

    this.controls.update();

    if (this.currentPreset !== null) {
      this.currentPreset = null;
      this.presetCallbacks.forEach(cb => cb(null));
    }
  }

  public onMoveEnd(callback: () => void): void {
    this.moveEndCallbacks.push(callback);
  }

  private setupKeyboardControls(): void {
    const keyMap: Record<string, keyof typeof this.moveState> = {
      KeyW: 'forward',
      ArrowUp: 'forward',
      KeyS: 'backward',
      ArrowDown: 'backward',
      KeyA: 'left',
      ArrowLeft: 'left',
      KeyD: 'right',
      ArrowRight: 'right',
      KeyE: 'up',
      Space: 'up',
      KeyQ: 'down',
      KeyC: 'down'
    };

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const action = keyMap[e.code];
      if (action) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
          e.preventDefault();
        }
        this.setMove(action, true);
      }
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      const action = keyMap[e.code];
      if (action) {
        this.setMove(action, false);
      }
    });

    window.addEventListener('blur', () => {
      for (const k of Object.keys(this.moveState) as (keyof typeof this.moveState)[]) {
        this.moveState[k] = false;
      }
    });
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();

    const animate = (time: number) => {
      if (!this.isRunning) return;
      this.animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const deltaTime = Math.min((now - this.lastFrameTime) / 1000, 0.1);
      this.lastFrameTime = now;

      // Handle continuous walking/flying movement through the room
      if (this.isMoving()) {
        const distance = this.moveSpeed * deltaTime;
        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        if (forward.lengthSq() < 0.0001) {
          forward.set(0, 0, -1);
        } else {
          forward.normalize();
        }

        const right = new THREE.Vector3();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        const delta = new THREE.Vector3();
        if (this.moveState.forward) delta.addScaledVector(forward, distance);
        if (this.moveState.backward) delta.addScaledVector(forward, -distance);
        if (this.moveState.right) delta.addScaledVector(right, distance);
        if (this.moveState.left) delta.addScaledVector(right, -distance);
        if (this.moveState.up) delta.y += distance;
        if (this.moveState.down) delta.y -= distance;

        if (delta.lengthSq() > 0) {
          this.camera.position.add(delta);
          this.controls.target.add(delta);

          // Boundaries to keep the camera within the darts room
          this.camera.position.x = THREE.MathUtils.clamp(this.camera.position.x, -2.65, 2.65);
          this.camera.position.y = THREE.MathUtils.clamp(this.camera.position.y, 0.15, 3.05);
          this.camera.position.z = THREE.MathUtils.clamp(this.camera.position.z, -0.01, 6.2);

          this.controls.update();
        }
      }

      // Handle camera tilt and rotation buttons (orbits camera around the stationary orb)
      if (this.isRotating()) {
        const rotAngle = this.rotateSpeed * deltaTime;
        let deltaTheta = 0;
        let deltaPhi = 0;

        if (this.rotateState.rotateLeft) deltaTheta -= rotAngle;
        if (this.rotateState.rotateRight) deltaTheta += rotAngle;
        if (this.rotateState.tiltUp) deltaPhi -= rotAngle;
        if (this.rotateState.tiltDown) deltaPhi += rotAngle;

        this.rotateAroundOrb(deltaTheta, deltaPhi);
      }

      // Handle camera zoom buttons (closer or further from the stationary orb)
      if (this.isZooming()) {
        const zoomDelta = this.zoomSpeed * deltaTime;
        let deltaDist = 0;
        if (this.zoomState.zoomIn) deltaDist -= zoomDelta;
        if (this.zoomState.zoomOut) deltaDist += zoomDelta;
        this.zoomTowardsOrb(deltaDist);
      }

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
      } else if (!this.isMoving() && !this.isRotating() && !this.isZooming()) {
        this.controls.update();
      }

      // Update floating pivot orb position to match rotation center
      if (this.pivotOrb.visible) {
        this.pivotOrb.position.copy(this.controls.target);
        const floorSpot = this.pivotOrb.getObjectByName('pivot-orb-floor');
        if (floorSpot) {
          floorSpot.position.y = -this.controls.target.y + 0.002;
        }

        const line = this.pivotOrb.getObjectByName('pivot-orb-line') as THREE.Line;
        if (line && line.geometry.attributes.position) {
          const posAttr = line.geometry.attributes.position;
          posAttr.setXYZ(1, 0, -this.controls.target.y, 0);
          posAttr.needsUpdate = true;
        }

        const sphere = this.pivotOrb.getObjectByName('pivot-orb-sphere') as THREE.Mesh;
        if (sphere) {
          const targetScale = this.isDraggingOrb ? 1.35 : 1.0;
          sphere.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.25);
        }
      }

      // Update standing floor marker to match camera position and facing direction
      if (this.standingMarker.visible) {
        this.standingMarker.position.set(this.camera.position.x, 0, this.camera.position.z);
        const forwardDir = new THREE.Vector3();
        this.camera.getWorldDirection(forwardDir);
        this.standingMarker.rotation.y = Math.atan2(forwardDir.x, forwardDir.z);

        const diamond = this.standingMarker.getObjectByName('standing-diamond');
        if (diamond) {
          diamond.rotation.y = time * 0.002;
        }
      }

      this.renderer.render(this.scene, this.camera);
    };
    requestAnimationFrame(animate);
  }

  public togglePivotOrb(visible?: boolean): boolean {
    const isVisible = visible !== undefined ? visible : !this.pivotOrb.visible;
    this.pivotOrb.visible = isVisible;
    this.standingMarker.visible = isVisible;
    this.pivotOrbCallbacks.forEach(cb => cb(isVisible));
    return isVisible;
  }

  public onPivotOrbChange(callback: (visible: boolean) => void): void {
    this.pivotOrbCallbacks.push(callback);
  }

  public stop(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);
  }

  public onPresetChange(callback: (preset: 'oche' | 'board' | 'side' | 'top' | 'isometric' | null) => void): void {
    this.presetCallbacks.push(callback);
  }

  public getCameraState(): {
    position: { x: number; y: number; z: number };
    target: { x: number; y: number; z: number };
    preset: 'oche' | 'board' | 'side' | 'top' | 'isometric' | null;
  } {
    return {
      position: {
        x: Number(this.camera.position.x.toFixed(4)),
        y: Number(this.camera.position.y.toFixed(4)),
        z: Number(this.camera.position.z.toFixed(4))
      },
      target: {
        x: Number(this.controls.target.x.toFixed(4)),
        y: Number(this.controls.target.y.toFixed(4)),
        z: Number(this.controls.target.z.toFixed(4))
      },
      preset: this.currentPreset
    };
  }

  public setCameraState(
    position: { x: number; y: number; z: number },
    target: { x: number; y: number; z: number },
    preset: 'oche' | 'board' | 'side' | 'top' | 'isometric' | null = null
  ): void {
    this.isTransitioning = false;
    this.camera.position.set(position.x, position.y, position.z);
    this.controls.target.set(target.x, target.y, target.z);
    this.camera.lookAt(this.controls.target);
    this.controls.update();
    this.currentPreset = preset;
    this.presetCallbacks.forEach(cb => cb(preset));
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
