import { SceneManager } from '../scene/SceneManager';

export function setupViewControls(sceneManager: SceneManager): HTMLElement {
  const container = document.createElement('div');
  container.className = 'hud-overlay';
  container.innerHTML = `
    <header class="hud-header glass-card">
      <div class="hud-title-wrap">
        <div class="hud-logo">🎯</div>
        <div>
          <h1 class="hud-title">Darts 3D Environment</h1>
          <p class="hud-subtitle">Regulation Simulation & Room Setup</p>
        </div>
        <span class="badge">Official Specs</span>
      </div>
      <div class="hud-metrics">
        <div class="metric-item">
          <span class="metric-label">Bullseye Height</span>
          <span class="metric-value">1.73 m</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Throw Distance</span>
          <span class="metric-value">2.37 m</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Board Diameter</span>
          <span class="metric-value">451 mm</span>
        </div>
      </div>
    </header>

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

        <!-- Section 2: Lighting & Environment -->
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
      </div>
    </div>

    <!-- Floating Pill Button when sidebar is collapsed -->
    <button id="sidebar-expand-btn" class="sidebar-floating-toggle glass-card" title="Open Controls Menu" style="display: none;">
      <span class="icon">🎮</span> Controls
    </button>
  `;

  // Attach view preset events
  const presetButtons = container.querySelectorAll<HTMLButtonElement>('.btn-preset');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = btn.dataset.preset as any;
      sceneManager.setViewPreset(preset, true);
    });
  });

  // Sidebar Collapse / Expand toggle logic
  const sidebar = container.querySelector<HTMLElement>('#hud-sidebar')!;
  const collapseBtn = container.querySelector<HTMLButtonElement>('#sidebar-collapse-btn')!;
  const expandBtn = container.querySelector<HTMLButtonElement>('#sidebar-expand-btn')!;

  collapseBtn.addEventListener('click', () => {
    sidebar.classList.add('collapsed');
    expandBtn.style.display = 'inline-flex';
  });

  expandBtn.addEventListener('click', () => {
    sidebar.classList.remove('collapsed');
    expandBtn.style.display = 'none';
  });

  // Attach dimension toggle event
  const toggleDimBtn = container.querySelector<HTMLButtonElement>('#toggle-dimensions')!;
  toggleDimBtn.addEventListener('click', () => {
    const isVisible = sceneManager.toggleDimensions();
    toggleDimBtn.classList.toggle('active', isVisible);
  });

  // Attach player dummy toggle event
  const togglePlayerBtn = container.querySelector<HTMLButtonElement>('#toggle-player')!;
  togglePlayerBtn.addEventListener('click', () => {
    const isVisible = sceneManager.togglePlayerDummy();
    togglePlayerBtn.classList.toggle('active', isVisible);
  });

  // Attach IT2 rig toggle event
  const toggleRigBtn = container.querySelector<HTMLButtonElement>('#toggle-it2-rig')!;
  toggleRigBtn.addEventListener('click', () => {
    const isVisible = sceneManager.toggleIT2Rig();
    toggleRigBtn.classList.toggle('active', isVisible);
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
  });
  sceneManager.onRingLightChange(updateRingLightUI);

  if (ringDimmer) {
    ringDimmer.addEventListener('input', (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      sceneManager.setRingLightIntensity(val);
      if (dimmerPct) {
        dimmerPct.textContent = `${Math.round(val * 100)}%`;
      }
    });
  }

  // Attach Tournament Darts toggle event
  const toggleDartsBtn = container.querySelector<HTMLButtonElement>('#toggle-darts')!;
  toggleDartsBtn.addEventListener('click', () => {
    const hasDarts = sceneManager.toggleDarts();
    toggleDartsBtn.classList.toggle('active', hasDarts);
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
  });

  sceneManager.onDaylightChange(updateLightUI);
  updateLightUI(sceneManager.isDaylight);

  return container;
}
