import { SceneManager } from '../scene/SceneManager';
import { AppSavedState } from '../state/AppState';

export interface ViewControlsElement extends HTMLElement {
  isSidebarCollapsed: () => boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  applyState: (state: AppSavedState) => void;
}

export function setupViewControls(
  sceneManager: SceneManager,
  onStateChange?: () => void,
  onReset?: () => void
): ViewControlsElement {
  const container = document.createElement('div') as unknown as ViewControlsElement;
  container.className = 'hud-overlay';
  container.innerHTML = `
    <!-- Top HUD Bar: All View Presets and Toggles visible at once (No Submenu) -->
    <header class="hud-top-bar glass-card">
      <div class="hud-section hud-section-presets">
        <span class="hud-label">Views</span>
        <div class="hud-button-row">
          <button class="btn btn-preset" data-preset="oche" title="Player perspective at the oche">
            <span class="icon">🎯</span> Oche
          </button>
          <button class="btn btn-preset" data-preset="board" title="Close-up board perspective">
            <span class="icon">🔍</span> Board
          </button>
          <button class="btn btn-preset" data-preset="side" title="Side elevation view">
            <span class="icon">📐</span> Side
          </button>
          <button class="btn btn-preset" data-preset="top" title="Top-down floor plan view">
            <span class="icon">🗺️</span> Top
          </button>
          <button class="btn btn-preset active" data-preset="isometric" title="Interactive free 3D orbit view">
            <span class="icon">🔄</span> Free 3D
          </button>
        </div>
      </div>

      <div class="hud-divider"></div>

      <div class="hud-section hud-section-toggles">
        <span class="hud-label">Scene & Lights</span>
        <div class="hud-button-row">
          <button id="toggle-light-mode" class="btn btn-toggle active" title="Daylight ON/OFF">
            <span class="icon">☀️</span> <span id="light-toggle-label">Daylight</span>
          </button>
          <button id="toggle-ring-light" class="btn btn-toggle active" title="Toggle 360° Ring Light">
            <span class="icon">⭕</span> <span id="ring-light-toggle-label">Ring Light</span>
          </button>
          <div id="ring-dimmer-wrap" class="dimmer-compact" title="Adjust Ring Light Intensity">
            <span class="dimmer-icon">🔅</span>
            <input type="range" id="ring-light-dimmer" min="0.2" max="1.5" step="0.05" value="1.0" class="mini-slider" aria-label="Ring Light Brightness">
            <span id="dimmer-pct" class="dimmer-pct">100%</span>
          </div>
          <button id="toggle-it2-rig" class="btn btn-toggle active" title="Toggle IT2 3-Camera Rig">
            <span class="icon">📷</span> IT2 Rig
          </button>
          <button id="toggle-darts" class="btn btn-toggle active" title="Toggle 180 Darts">
            <span class="icon">🎯</span> 180s
          </button>
          <button id="toggle-player" class="btn btn-toggle active" title="Toggle Player Mannequin">
            <span class="icon">🧍</span> Player
          </button>
          <button id="toggle-dimensions" class="btn btn-toggle active" title="Toggle Regulation Dimension Lines">
            <span class="icon">📏</span> Guides
          </button>
          <button id="toggle-pivot-orb" class="btn btn-toggle active" title="Toggle Floating Pivot Orb & Standing Position Marker">
            <span class="icon">🔮</span> Orb
          </button>
          <button id="btn-reset-defaults" class="btn btn-reset" title="Reset all to defaults">
            <span class="icon">↺</span> Reset
          </button>
        </div>
      </div>
    </header>

    <!-- Bottom HUD Row: Both Walk and Tilt controls visible at once (No Submenu) -->
    <footer class="hud-bottom-row">
      <!-- Left Pad: Walk & Elevation -->
      <div class="hud-pad-box hud-pad-left glass-card" title="Touch & hold to walk / elevate">
        <div class="pad-title">WALK</div>
        <div class="pad-body">
          <div class="dpad-cluster">
            <button class="dpad-btn dpad-up" data-dir="forward" aria-label="Forward" title="Walk Forward">▲</button>
            <button class="dpad-btn dpad-left" data-dir="left" aria-label="Left" title="Strafe Left">◀</button>
            <div class="dpad-center" title="Walk">🚶</div>
            <button class="dpad-btn dpad-right" data-dir="right" aria-label="Right" title="Strafe Right">▶</button>
            <button class="dpad-btn dpad-down" data-dir="backward" aria-label="Backward" title="Walk Backward">▼</button>
          </div>
          <div class="dpad-elevate-cluster">
            <button class="dpad-btn dpad-elev-up" data-dir="up" aria-label="Elevate Up" title="Move Up (E / Space)">⮝</button>
            <button class="dpad-btn dpad-elev-down" data-dir="down" aria-label="Elevate Down" title="Move Down (Q / C)">⮟</button>
          </div>
        </div>
      </div>

      <!-- Right Pad: Tilt & Turn View + Zoom -->
      <div class="hud-pad-box hud-pad-right glass-card" title="Touch & hold to tilt, rotate or zoom">
        <div class="pad-title">LOOK & ZOOM</div>
        <div class="pad-body">
          <div class="dpad-zoom-cluster">
            <button class="dpad-btn dpad-zoom-in" data-zoom="zoomIn" aria-label="Zoom In" title="Zoom In (Closer to Orb)">➕</button>
            <button class="dpad-btn dpad-zoom-out" data-zoom="zoomOut" aria-label="Zoom Out" title="Zoom Out (Further from Orb)">➖</button>
          </div>
          <div class="dpad-cluster">
            <button class="dpad-btn dpad-up" data-rotate="tiltUp" aria-label="Tilt Up" title="Tilt View Up">▲</button>
            <button class="dpad-btn dpad-left" data-rotate="rotateLeft" aria-label="Turn Left" title="Rotate View Left">◀</button>
            <button class="dpad-btn dpad-center dpad-orb-toggle active" id="hud-toggle-orb" aria-label="Toggle Orb Visibility" title="Toggle Floating Orb (ON / OFF)">🔮</button>
            <button class="dpad-btn dpad-right" data-rotate="rotateRight" aria-label="Turn Right" title="Rotate View Right">▶</button>
            <button class="dpad-btn dpad-down" data-rotate="tiltDown" aria-label="Tilt Down" title="Tilt View Down">▼</button>
          </div>
        </div>
      </div>
    </footer>
  `;

  // Attach continuous walk/move events for all [data-dir] buttons
  const navButtons = container.querySelectorAll<HTMLButtonElement>('[data-dir]');
  navButtons.forEach(btn => {
    const dir = btn.dataset.dir as any;
    if (!dir) return;

    const start = (e: Event) => {
      e.preventDefault();
      btn.classList.add('active');
      sceneManager.setMove(dir, true);
    };

    const stop = () => {
      btn.classList.remove('active');
      sceneManager.setMove(dir, false);
    };

    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', stop);
    btn.addEventListener('pointercancel', stop);
    btn.addEventListener('pointerleave', stop);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  // Attach continuous tilt/rotate events for all [data-rotate] buttons
  const rotButtons = container.querySelectorAll<HTMLButtonElement>('[data-rotate]');
  rotButtons.forEach(btn => {
    const rot = btn.dataset.rotate as any;
    if (!rot) return;

    const start = (e: Event) => {
      e.preventDefault();
      btn.classList.add('active');
      sceneManager.setRotate(rot, true);
    };

    const stop = () => {
      btn.classList.remove('active');
      sceneManager.setRotate(rot, false);
    };

    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', stop);
    btn.addEventListener('pointercancel', stop);
    btn.addEventListener('pointerleave', stop);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  // Attach continuous zoom in/out events for all [data-zoom] buttons
  const zoomButtons = container.querySelectorAll<HTMLButtonElement>('[data-zoom]');
  zoomButtons.forEach(btn => {
    const zoom = btn.dataset.zoom as 'zoomIn' | 'zoomOut';
    if (!zoom) return;

    const start = (e: Event) => {
      e.preventDefault();
      btn.classList.add('active');
      sceneManager.setZoom(zoom, true);
    };

    const stop = () => {
      btn.classList.remove('active');
      sceneManager.setZoom(zoom, false);
    };

    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', stop);
    btn.addEventListener('pointercancel', stop);
    btn.addEventListener('pointerleave', stop);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  // Sync Orb visibility between HUD pad button and top-bar button
  const hudToggleOrb = container.querySelector<HTMLButtonElement>('#hud-toggle-orb');
  const topToggleOrb = container.querySelector<HTMLButtonElement>('#toggle-pivot-orb');

  const updateOrbUI = (visible: boolean) => {
    hudToggleOrb?.classList.toggle('active', visible);
    topToggleOrb?.classList.toggle('active', visible);
  };

  hudToggleOrb?.addEventListener('click', (e) => {
    e.preventDefault();
    const isVisible = sceneManager.togglePivotOrb();
    updateOrbUI(isVisible);
    onStateChange?.();
  });

  sceneManager.onPivotOrbChange(updateOrbUI);

  // Attach view preset events
  const presetButtons = container.querySelectorAll<HTMLButtonElement>('.btn-preset');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = btn.dataset.preset as any;
      sceneManager.setViewPreset(preset, true);
      onStateChange?.();
    });
  });

  // Sync preset active button when sceneManager preset changes or resets
  sceneManager.onPresetChange((preset) => {
    presetButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.preset === preset);
    });
    onStateChange?.();
  });

  // Attach hardware toggle events
  const toggleMap: [string, () => boolean][] = [
    ['toggle-dimensions', () => sceneManager.toggleDimensions()],
    ['toggle-player', () => sceneManager.togglePlayerDummy()],
    ['toggle-it2-rig', () => sceneManager.toggleIT2Rig()],
    ['toggle-pivot-orb', () => sceneManager.togglePivotOrb()],
  ];
  const toggleBtns = new Map<string, HTMLButtonElement>();
  toggleMap.forEach(([id, toggleFn]) => {
    const btn = container.querySelector<HTMLButtonElement>(`#${id}`)!;
    toggleBtns.set(id, btn);
    btn.addEventListener('click', () => {
      btn.classList.toggle('active', toggleFn());
      onStateChange?.();
    });
  });

  // Attach 360° Ring Light toggle event & dimmer
  const toggleRingLightBtn = container.querySelector<HTMLButtonElement>('#toggle-ring-light')!;
  const ringLightLabel = toggleRingLightBtn.querySelector<HTMLSpanElement>('#ring-light-toggle-label')!;
  const ringDimmerWrap = container.querySelector<HTMLElement>('#ring-dimmer-wrap');
  const ringDimmer = container.querySelector<HTMLInputElement>('#ring-light-dimmer');
  const dimmerPct = container.querySelector<HTMLSpanElement>('#dimmer-pct');

  const updateRingLightUI = (isOn: boolean) => {
    toggleRingLightBtn.classList.toggle('active', isOn);
    ringLightLabel.textContent = isOn ? 'Ring Light' : 'Ring Light OFF';
    if (ringDimmerWrap) {
      ringDimmerWrap.style.opacity = isOn ? '1.0' : '0.35';
      ringDimmerWrap.style.pointerEvents = isOn ? 'auto' : 'none';
    }
  };

  toggleRingLightBtn.addEventListener('click', () => {
    sceneManager.toggleRingLight();
    onStateChange?.();
  });
  sceneManager.onRingLightChange(updateRingLightUI);

  if (ringDimmer) {
    ringDimmer.addEventListener('input', (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      sceneManager.setRingLightIntensity(val);
      if (dimmerPct) {
        dimmerPct.textContent = `${Math.round(val * 100)}%`;
      }
      onStateChange?.();
    });
  }

  // Attach Tournament Darts toggle event
  const toggleDartsBtn = container.querySelector<HTMLButtonElement>('#toggle-darts')!;
  toggleDartsBtn.addEventListener('click', () => {
    const hasDarts = sceneManager.toggleDarts();
    toggleDartsBtn.classList.toggle('active', hasDarts);
    onStateChange?.();
  });
  sceneManager.onDartsChange((hasDarts) => {
    toggleDartsBtn.classList.toggle('active', hasDarts);
  });

  // Attach light mode toggle event
  const toggleLightBtn = container.querySelector<HTMLButtonElement>('#toggle-light-mode')!;
  const lightIcon = toggleLightBtn.querySelector<HTMLSpanElement>('.icon')!;
  const lightLabel = toggleLightBtn.querySelector<HTMLSpanElement>('#light-toggle-label')!;

  const updateLightUI = (isDaylight: boolean) => {
    toggleLightBtn.classList.toggle('active', isDaylight);
    lightIcon.textContent = isDaylight ? '☀️' : '💡';
    lightLabel.textContent = isDaylight ? 'Daylight' : 'Lounge';
  };

  toggleLightBtn.addEventListener('click', () => {
    sceneManager.toggleDaylight();
    onStateChange?.();
  });

  sceneManager.onDaylightChange(updateLightUI);
  updateLightUI(sceneManager.isDaylight);

  // Reset to Defaults Button
  const resetBtn = container.querySelector<HTMLButtonElement>('#btn-reset-defaults')!;
  resetBtn.addEventListener('click', () => {
    onReset?.();
  });

  // Container controller API
  container.isSidebarCollapsed = () => false;
  container.setSidebarCollapsed = () => {};

  container.applyState = (state: AppSavedState) => {
    toggleBtns.get('toggle-dimensions')?.classList.toggle('active', state.controls.isDimensionGuidesVisible);
    toggleBtns.get('toggle-player')?.classList.toggle('active', state.controls.isPlayerDummyVisible);
    toggleBtns.get('toggle-it2-rig')?.classList.toggle('active', state.controls.isIT2RigVisible);
    toggleBtns.get('toggle-pivot-orb')?.classList.toggle('active', sceneManager.pivotOrb.visible);
    hudToggleOrb?.classList.toggle('active', sceneManager.pivotOrb.visible);
    toggleDartsBtn.classList.toggle('active', state.controls.is180DartsVisible);
    updateRingLightUI(state.controls.isRingLight);
    updateLightUI(state.controls.isDaylight);

    if (ringDimmer) {
      ringDimmer.value = state.controls.ringLightIntensity.toString();
    }
    if (dimmerPct) {
      dimmerPct.textContent = `${Math.round(state.controls.ringLightIntensity * 100)}%`;
    }

    presetButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.preset === state.camera.preset);
    });
  };

  return container;
}
