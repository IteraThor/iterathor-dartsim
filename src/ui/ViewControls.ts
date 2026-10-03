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
    <div id="hud-sidebar" class="hud-sidebar glass-card">
      <div class="sidebar-header">
        <div class="sidebar-title-wrap">
          <span class="sidebar-icon">🎮</span>
          <span class="sidebar-title">Controls</span>
        </div>
        <button id="sidebar-collapse-btn" class="sidebar-collapse-btn" title="Collapse Menu">
          <span>◀</span>
        </button>
      </div>

      <div class="sidebar-content">
        <!-- Section 1: Camera Perspectives -->
        <div class="control-section">
          <div class="section-label">Camera Views</div>
          <div class="sidebar-btn-grid">
            <button class="btn btn-preset" data-preset="oche" title="Player eye-level view at the oche">
              <span class="icon">🎯</span> Oche
            </button>
            <button class="btn btn-preset" data-preset="board" title="Close-up board perspective">
              <span class="icon">🔍</span> Board
            </button>
            <button class="btn btn-preset" data-preset="side" title="Side elevation view showing throw distance">
              <span class="icon">📐</span> Side
            </button>
            <button class="btn btn-preset" data-preset="top" title="Top-down floor plan view">
              <span class="icon">🗺️</span> Top
            </button>
            <button class="btn btn-preset active grid-span-2" data-preset="isometric" title="Interactive free 3D orbit view">
              <span class="icon">🔄</span> Free 3D Orbit
            </button>
          </div>
        </div>

        <!-- Section 2: Room Navigation (Walk / Move) -->
        <div class="control-section">
          <div class="section-label">Room Navigation</div>
          <div class="nav-control-box">
            <div class="nav-dpad-grid">
              <button class="btn btn-walk nav-btn-up" data-dir="forward" title="Move Forward (W / Up Arrow)">
                <span>▲</span> Forward
              </button>
              <div class="nav-dpad-row">
                <button class="btn btn-walk" data-dir="left" title="Strafe Left (A / Left Arrow)">
                  <span>◀</span> Left
                </button>
                <button class="btn btn-walk" data-dir="backward" title="Move Backward (S / Down Arrow)">
                  <span>▼</span> Back
                </button>
                <button class="btn btn-walk" data-dir="right" title="Strafe Right (D / Right Arrow)">
                  <span>▶</span> Right
                </button>
              </div>
              <div class="nav-dpad-elevate">
                <button class="btn btn-walk" data-dir="up" title="Elevate Up (E / Space)">
                  <span>⮝</span> Up
                </button>
                <button class="btn btn-walk" data-dir="down" title="Elevate Down (Q / C)">
                  <span>⮟</span> Down
                </button>
              </div>
            </div>
            <div class="nav-helper-text">Desktop: Hold WASD / Arrows to walk • Q/E elevate</div>
          </div>
        </div>

        <!-- Section 3: Camera Tilt & Rotation -->
        <div class="control-section">
          <div class="section-label">Camera Tilt & Rotation</div>
          <div class="nav-control-box">
            <div class="nav-dpad-grid">
              <button class="btn btn-walk nav-btn-up" data-rotate="tiltUp" title="Tilt View Up">
                <span>▲</span> Tilt Up
              </button>
              <div class="nav-dpad-row">
                <button class="btn btn-walk" data-rotate="rotateLeft" title="Rotate View Left">
                  <span>◀</span> Turn Left
                </button>
                <button class="btn btn-walk" data-rotate="tiltDown" title="Tilt View Down">
                  <span>▼</span> Tilt Down
                </button>
                <button class="btn btn-walk" data-rotate="rotateRight" title="Rotate View Right">
                  <span>▶</span> Turn Right
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 4: Lighting & Environment -->
        <div class="control-section">
          <div class="section-label">Lighting & Environment</div>
          <div class="sidebar-toggle-list">
            <button id="toggle-light-mode" class="btn btn-toggle active" title="Daylight is ON (Click to switch to Evening Lounge lighting)">
              <span class="icon">☀️</span> <span id="light-toggle-label">Daylight ON</span>
            </button>
            <button id="toggle-ring-light" class="btn btn-toggle active" title="Toggle 360° Shadowless LED Ring Light">
              <span class="icon">⭕</span> <span id="ring-light-toggle-label">Ring Light ON</span>
            </button>
            <div id="ring-dimmer-wrap" class="sidebar-dimmer-row" title="Adjust Ring Light Brightness">
              <div class="dimmer-header">
                <span class="dimmer-label">Ring Brightness</span>
                <span id="dimmer-pct" class="dimmer-pct">100%</span>
              </div>
              <div class="dimmer-slider-wrap">
                <span class="dimmer-icon">🔅</span>
                <input type="range" id="ring-light-dimmer" min="0.2" max="1.5" step="0.05" value="1.0" class="mini-slider" aria-label="Ring Light Brightness">
                <span class="dimmer-icon">🔆</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Hardware & Overlays -->
        <div class="control-section">
          <div class="section-label">Hardware & Overlays</div>
          <div class="sidebar-toggle-list">
            <button id="toggle-it2-rig" class="btn btn-toggle active" title="Toggle IT2 3-Camera Rig mounted around dartboard">
              <span class="icon">📷</span> IT2 Ring Rig
            </button>
            <button id="toggle-darts" class="btn btn-toggle active" title="Toggle tournament 180 darts in Treble 20 to test shadowless lighting">
              <span class="icon">🎯</span> 180 Darts
            </button>
            <button id="toggle-player" class="btn btn-toggle active" title="Toggle 3D player mannequin at the throw line">
              <span class="icon">🧍</span> Player Dummy
            </button>
            <button id="toggle-dimensions" class="btn btn-toggle active" title="Toggle regulation measurement lines">
              <span class="icon">📏</span> Dimension Guides
            </button>
          </div>
        </div>

        <!-- Section 4: System Reset -->
        <div class="control-section">
          <div class="sidebar-footer-row">
            <button id="btn-reset-defaults" class="btn btn-reset" title="Reset all camera views and controls to regulation defaults">
              <span class="icon">↺</span> Reset Defaults
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Pill Button when sidebar is collapsed -->
    <button id="sidebar-expand-btn" class="sidebar-floating-toggle glass-card" title="Open Controls Menu" style="display: none;">
      <span class="icon">🎮</span> Controls
    </button>

    <!-- Floating On-Screen Navigation Pad (Walk & Tilt View) -->
    <div id="floating-nav-pad" class="floating-nav-pad glass-card" title="Hold to move or tilt view">
      <div class="nav-pad-header">
        <button id="nav-mode-walk" class="nav-tab active" title="Walk & Elevate">🚶 Walk</button>
        <button id="nav-mode-look" class="nav-tab" title="Tilt & Rotate View">🔄 Tilt</button>
      </div>

      <!-- Walk Pad -->
      <div id="dpad-walk-view" class="dpad-view">
        <div class="dpad-cluster">
          <button class="dpad-btn dpad-up" data-dir="forward" aria-label="Forward" title="Walk Forward">▲</button>
          <button class="dpad-btn dpad-left" data-dir="left" aria-label="Left" title="Strafe Left">◀</button>
          <div class="dpad-center" title="Walk">🚶</div>
          <button class="dpad-btn dpad-right" data-dir="right" aria-label="Right" title="Strafe Right">▶</button>
          <button class="dpad-btn dpad-down" data-dir="backward" aria-label="Backward" title="Walk Backward">▼</button>
        </div>
        <div class="dpad-elevate-cluster">
          <button class="dpad-btn dpad-elev-up" data-dir="up" aria-label="Elevate Up" title="Move Up">⮝</button>
          <button class="dpad-btn dpad-elev-down" data-dir="down" aria-label="Elevate Down" title="Move Down">⮟</button>
        </div>
      </div>

      <!-- Tilt / Rotate Pad -->
      <div id="dpad-look-view" class="dpad-view" style="display: none;">
        <div class="dpad-cluster">
          <button class="dpad-btn dpad-up" data-rotate="tiltUp" aria-label="Tilt Up" title="Tilt View Up">▲</button>
          <button class="dpad-btn dpad-left" data-rotate="rotateLeft" aria-label="Turn Left" title="Rotate View Left">◀</button>
          <div class="dpad-center" title="Tilt View">🔄</div>
          <button class="dpad-btn dpad-right" data-rotate="rotateRight" aria-label="Turn Right" title="Rotate View Right">▶</button>
          <button class="dpad-btn dpad-down" data-rotate="tiltDown" aria-label="Tilt Down" title="Tilt View Down">▼</button>
        </div>
        <div class="dpad-elevate-cluster">
          <button class="dpad-btn dpad-elev-up" data-dir="up" aria-label="Elevate Up" title="Move Up">⮝</button>
          <button class="dpad-btn dpad-elev-down" data-dir="down" aria-label="Elevate Down" title="Move Down">⮟</button>
        </div>
      </div>
    </div>
  `;

  // Attach tab switching on floating pad
  const walkTab = container.querySelector<HTMLButtonElement>('#nav-mode-walk')!;
  const lookTab = container.querySelector<HTMLButtonElement>('#nav-mode-look')!;
  const walkView = container.querySelector<HTMLElement>('#dpad-walk-view')!;
  const lookView = container.querySelector<HTMLElement>('#dpad-look-view')!;

  walkTab.addEventListener('click', () => {
    walkTab.classList.add('active');
    lookTab.classList.remove('active');
    walkView.style.display = 'flex';
    lookView.style.display = 'none';
  });

  lookTab.addEventListener('click', () => {
    lookTab.classList.add('active');
    walkTab.classList.remove('active');
    lookView.style.display = 'flex';
    walkView.style.display = 'none';
  });

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

  // Sidebar Collapse / Expand toggle logic
  const sidebar = container.querySelector<HTMLElement>('#hud-sidebar')!;
  const collapseBtn = container.querySelector<HTMLButtonElement>('#sidebar-collapse-btn')!;
  const expandBtn = container.querySelector<HTMLButtonElement>('#sidebar-expand-btn')!;

  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebar.classList.toggle('collapsed', collapsed);
    expandBtn.style.display = collapsed ? 'inline-flex' : 'none';
  };

  collapseBtn.addEventListener('click', () => {
    setSidebarCollapsed(true);
    onStateChange?.();
  });

  expandBtn.addEventListener('click', () => {
    setSidebarCollapsed(false);
    onStateChange?.();
  });

  // Attach hardware toggle events
  const toggleMap: [string, () => boolean][] = [
    ['toggle-dimensions', () => sceneManager.toggleDimensions()],
    ['toggle-player', () => sceneManager.togglePlayerDummy()],
    ['toggle-it2-rig', () => sceneManager.toggleIT2Rig()],
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
    ringLightLabel.textContent = isOn ? 'Ring Light ON' : 'Ring Light';
    if (ringDimmerWrap) {
      ringDimmerWrap.style.opacity = isOn ? '1.0' : '0.35';
      ringDimmerWrap.style.pointerEvents = isOn ? 'auto' : 'none';
    }
    toggleRingLightBtn.title = isOn
      ? '360° Shadowless Ring Light is ON (Click to switch to directional ceiling spotlight)'
      : '360° Shadowless Ring Light is OFF (Click to illuminate board with shadowless 360° ring light)';
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

  // Attach light mode toggle event (synced with 3D physical wall switch)
  const toggleLightBtn = container.querySelector<HTMLButtonElement>('#toggle-light-mode')!;
  const lightIcon = toggleLightBtn.querySelector<HTMLSpanElement>('.icon')!;
  const lightLabel = toggleLightBtn.querySelector<HTMLSpanElement>('#light-toggle-label')!;

  const updateLightUI = (isDaylight: boolean) => {
    toggleLightBtn.classList.toggle('active', isDaylight);
    lightIcon.textContent = isDaylight ? '☀️' : '💡';
    lightLabel.textContent = isDaylight ? 'Daylight ON' : 'Daylight';
    toggleLightBtn.title = isDaylight
      ? 'Daylight is ON (Click to switch to Evening Lounge lighting)'
      : 'Daylight is OFF (Click to switch to Bright Daylight)';
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

  // Attach controller methods to container
  container.isSidebarCollapsed = () => sidebar.classList.contains('collapsed');
  container.setSidebarCollapsed = setSidebarCollapsed;

  container.applyState = (state: AppSavedState) => {
    toggleBtns.get('toggle-dimensions')?.classList.toggle('active', state.controls.isDimensionGuidesVisible);
    toggleBtns.get('toggle-player')?.classList.toggle('active', state.controls.isPlayerDummyVisible);
    toggleBtns.get('toggle-it2-rig')?.classList.toggle('active', state.controls.isIT2RigVisible);
    toggleDartsBtn.classList.toggle('active', state.controls.is180DartsVisible);
    updateRingLightUI(state.controls.isRingLight);
    updateLightUI(state.controls.isDaylight);

    if (ringDimmer) {
      ringDimmer.value = state.controls.ringLightIntensity.toString();
    }
    if (dimmerPct) {
      dimmerPct.textContent = `${Math.round(state.controls.ringLightIntensity * 100)}%`;
    }

    setSidebarCollapsed(state.controls.isSidebarCollapsed);

    presetButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.preset === state.camera.preset);
    });
  };

  return container;
}
