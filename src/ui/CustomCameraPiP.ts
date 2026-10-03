import { SceneManager } from '../scene/SceneManager';
import { BullseyeCoordsMm } from '../scene/CustomCameraRig';

export class CustomCameraPiP {
  private container: HTMLElement;
  private windowEl: HTMLElement;
  private viewportFrame: HTMLElement;
  private sceneManager: SceneManager;
  private isCollapsed = false;

  private inputX!: HTMLInputElement;
  private inputY!: HTMLInputElement;
  private inputZ!: HTMLInputElement;
  private coordBadge!: HTMLElement;

  // Window dragging state
  private isDragging = false;
  private dragStart = { x: 0, y: 0 };

  constructor(container: HTMLElement, sceneManager: SceneManager) {
    this.container = container;
    this.sceneManager = sceneManager;

    this.windowEl = document.createElement('div');
    this.windowEl.className = 'pip-window glass-panel';
    this.windowEl.id = 'custom-camera-pip';

    this.viewportFrame = document.createElement('div');
    this.buildUI();
    this.setupDragging();
    this.setupEvents();

    this.container.appendChild(this.windowEl);
    this.sceneManager.setPipViewportElement(this.viewportFrame);

    // Initial sync
    this.syncFromRig();

    // Listen to scene manager custom camera visibility changes
    this.sceneManager.onCustomCameraChange((visible) => {
      this.windowEl.classList.toggle('hidden', !visible);
    });
  }

  private buildUI(): void {
    const rig = this.sceneManager.getCustomCameraRig();
    const coords = rig.getCoordsMm();

    this.windowEl.innerHTML = `
      <div class="pip-header" id="pip-drag-handle">
        <div class="pip-title">
          <span class="pip-live-dot"></span>
          <span class="pip-title-text">Custom Cam Feed</span>
          <span class="pip-coord-badge" id="pip-coord-badge">X: ${coords.x} Y: ${coords.y} Z: ${coords.z} mm</span>
        </div>
        <div class="pip-actions">
          <button class="pip-btn pip-btn-minimize" id="pip-btn-collapse" title="Collapse / Expand View">─</button>
          <button class="pip-btn pip-btn-close" id="pip-btn-close" title="Close Custom Cam Feed">✕</button>
        </div>
      </div>

      <div class="pip-body" id="pip-body">
        <div class="pip-viewport-wrapper">
          <div class="pip-viewport-frame" id="pip-viewport-frame">
            <div class="pip-overlay-crosshair"></div>
            <div class="pip-badge-top-left">CAM 1</div>
            <div class="pip-badge-top-right">FOV 55°</div>
            <div class="pip-badge-bottom" id="pip-aim-badge">AIM: 🔮 ORB</div>
          </div>
        </div>

        <div class="pip-controls">
          <button class="btn btn-pip-action" id="btn-snap-to-orb" title="Position camera at the current floating orb location">
            <span class="icon">📍</span> Snap to Orb Position
          </button>

          <div class="pip-coords-grid">
            <div class="coord-field">
              <div class="coord-header">
                <span class="coord-axis axis-x">X</span>
                <span class="coord-desc">Left / Right (mm)</span>
              </div>
              <div class="coord-input-row">
                <button class="coord-step-btn" data-axis="x" data-delta="-50">−50</button>
                <input type="number" id="pip-input-x" class="coord-input" value="${coords.x}" step="10">
                <button class="coord-step-btn" data-axis="x" data-delta="50">+50</button>
              </div>
            </div>

            <div class="coord-field">
              <div class="coord-header">
                <span class="coord-axis axis-y">Y</span>
                <span class="coord-desc">Elevation (mm)</span>
              </div>
              <div class="coord-input-row">
                <button class="coord-step-btn" data-axis="y" data-delta="-50">−50</button>
                <input type="number" id="pip-input-y" class="coord-input" value="${coords.y}" step="10">
                <button class="coord-step-btn" data-axis="y" data-delta="50">+50</button>
              </div>
            </div>

            <div class="coord-field">
              <div class="coord-header">
                <span class="coord-axis axis-z">Z</span>
                <span class="coord-desc">Distance from Board (mm)</span>
              </div>
              <div class="coord-input-row">
                <button class="coord-step-btn" data-axis="z" data-delta="-50">−50</button>
                <input type="number" id="pip-input-z" class="coord-input" value="${coords.z}" min="50" max="5500" step="50">
                <button class="coord-step-btn" data-axis="z" data-delta="50">+50</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.viewportFrame = this.windowEl.querySelector('#pip-viewport-frame')!;
    this.inputX = this.windowEl.querySelector('#pip-input-x')!;
    this.inputY = this.windowEl.querySelector('#pip-input-y')!;
    this.inputZ = this.windowEl.querySelector('#pip-input-z')!;
    this.coordBadge = this.windowEl.querySelector('#pip-coord-badge')!;
  }

  private setupDragging(): void {
    const handle = this.windowEl.querySelector('#pip-drag-handle') as HTMLElement;
    if (!handle) return;

    const onPointerDown = (e: PointerEvent) => {
      // Don't drag if clicking buttons
      if ((e.target as HTMLElement).closest('.pip-btn')) return;

      this.isDragging = true;
      handle.setPointerCapture(e.pointerId);
      const rect = this.windowEl.getBoundingClientRect();
      this.dragStart.x = e.clientX - rect.left;
      this.dragStart.y = e.clientY - rect.top;
      this.windowEl.classList.add('dragging');
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isDragging) return;

      let newLeft = e.clientX - this.dragStart.x;
      let newTop = e.clientY - this.dragStart.y;

      // Bounds checking within viewport
      const pad = 10;
      const maxLeft = window.innerWidth - this.windowEl.offsetWidth - pad;
      const maxTop = window.innerHeight - this.windowEl.offsetHeight - pad;

      newLeft = Math.max(pad, Math.min(newLeft, maxLeft));
      newTop = Math.max(pad, Math.min(newTop, maxTop));

      this.windowEl.style.left = `${newLeft}px`;
      this.windowEl.style.top = `${newTop}px`;
      this.windowEl.style.right = 'auto';
      this.windowEl.style.bottom = 'auto';
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.windowEl.classList.remove('dragging');
      try {
        handle.releasePointerCapture(e.pointerId);
      } catch (_) {}
    };

    handle.addEventListener('pointerdown', onPointerDown);
    handle.addEventListener('pointermove', onPointerMove);
    handle.addEventListener('pointerup', onPointerUp);
    handle.addEventListener('pointercancel', onPointerUp);
  }

  private setupEvents(): void {
    const snapBtn = this.windowEl.querySelector('#btn-snap-to-orb');
    const aimBadge = this.windowEl.querySelector('#pip-aim-badge') as HTMLElement;

    snapBtn?.addEventListener('click', () => {
      const coords = this.sceneManager.placeCustomCameraAtOrb();
      this.updateInputs(coords);
      if (aimBadge) aimBadge.textContent = 'AIM: 🎯 BULLSEYE';
    });

    // Inputs direct change
    const onInputChange = () => {
      const x = parseFloat(this.inputX.value) || 0;
      const y = parseFloat(this.inputY.value) || 0;
      const z = Math.max(50, parseFloat(this.inputZ.value) || 50);

      this.sceneManager.getCustomCameraRig().setCoordsMm({ x, y, z });
      this.updateBadge({ x, y, z });
      if (aimBadge) aimBadge.textContent = 'AIM: 🔮 ORB';
    };

    this.inputX.addEventListener('input', onInputChange);
    this.inputY.addEventListener('input', onInputChange);
    this.inputZ.addEventListener('input', onInputChange);

    // Stepper buttons
    const stepButtons = this.windowEl.querySelectorAll<HTMLButtonElement>('.coord-step-btn');
    stepButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const axis = btn.dataset.axis as 'x' | 'y' | 'z';
        const delta = parseInt(btn.dataset.delta || '0', 10);
        const input = axis === 'x' ? this.inputX : axis === 'y' ? this.inputY : this.inputZ;
        const currentVal = parseFloat(input.value) || 0;
        const newVal = currentVal + delta;
        input.value = newVal.toString();
        onInputChange();
      });
    });

    // Minimize / Collapse
    const collapseBtn = this.windowEl.querySelector('#pip-btn-collapse');
    const bodyEl = this.windowEl.querySelector('#pip-body');
    collapseBtn?.addEventListener('click', () => {
      this.isCollapsed = !this.isCollapsed;
      bodyEl?.classList.toggle('hidden', this.isCollapsed);
      collapseBtn.textContent = this.isCollapsed ? '□' : '─';
    });

    // Close
    const closeBtn = this.windowEl.querySelector('#pip-btn-close');
    closeBtn?.addEventListener('click', () => {
      this.sceneManager.toggleCustomCamera(false);
    });
  }

  public syncFromRig(): void {
    const coords = this.sceneManager.getCustomCameraRig().getCoordsMm();
    this.updateInputs(coords);
  }

  private updateInputs(coords: BullseyeCoordsMm): void {
    this.inputX.value = coords.x.toString();
    this.inputY.value = coords.y.toString();
    this.inputZ.value = coords.z.toString();
    this.updateBadge(coords);
  }

  private updateBadge(coords: BullseyeCoordsMm): void {
    if (this.coordBadge) {
      this.coordBadge.textContent = `X: ${coords.x} Y: ${coords.y} Z: ${coords.z} mm`;
    }
  }

  public setVisible(visible: boolean): void {
    this.sceneManager.toggleCustomCamera(visible);
  }
}
