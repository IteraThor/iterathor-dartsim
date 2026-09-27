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

    <div class="hud-bottom-bar">
      <div class="view-preset-group glass-card">
        <span class="group-label">Camera Presets:</span>
        <button class="btn btn-preset" data-preset="oche" title="Player eye-level view at the oche">🎯 Player Oche</button>
        <button class="btn btn-preset" data-preset="board" title="Close-up board perspective">Board Close-up</button>
        <button class="btn btn-preset" data-preset="side" title="Side elevation view showing throw distance">Side Elevation</button>
        <button class="btn btn-preset" data-preset="top" title="Top-down floor plan view">Top-Down</button>
        <button class="btn btn-preset active" data-preset="isometric" title="Interactive free 3D orbit view">3D Orbit</button>
      </div>

      <div class="toggle-group glass-card">
        <button id="toggle-dimensions" class="btn btn-toggle active" title="Toggle regulation measurement lines">
          <span class="icon">📏</span> Dimension Guides
        </button>
        <button id="toggle-player" class="btn btn-toggle active" title="Toggle 3D player mannequin at the throw line">
          <span class="icon">🧍</span> Player Dummy
        </button>
        <button id="toggle-it2-rig" class="btn btn-toggle active" title="Toggle IT2 3-Camera Rig mounted around dartboard">
          <span class="icon">📷</span> IT2 Ring Rig
        </button>
        <button id="toggle-ring-light" class="btn btn-toggle active" title="Toggle 360° Shadowless LED Ring Light">
          <span class="icon">⭕</span> <span id="ring-light-toggle-label">Ring Light ON</span>
        </button>
        <button id="toggle-darts" class="btn btn-toggle active" title="Toggle tournament 180 darts in Treble 20 to test shadowless lighting">
          <span class="icon">🎯</span> 180 Darts
        </button>
        <button id="toggle-light-mode" class="btn btn-toggle" title="Toggle room lighting (Evening Lounge / Bright Daylight)">
          <span class="icon">💡</span> <span id="light-toggle-label">Daylight</span>
        </button>
      </div>
    </div>
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

  // Attach 360° Ring Light toggle event
  const toggleRingLightBtn = container.querySelector<HTMLButtonElement>('#toggle-ring-light')!;
  const ringLightLabel = toggleRingLightBtn.querySelector<HTMLSpanElement>('#ring-light-toggle-label')!;

  const updateRingLightUI = (isOn: boolean) => {
    toggleRingLightBtn.classList.toggle('active', isOn);
    ringLightLabel.textContent = isOn ? 'Ring Light ON' : 'Ring Light';
    toggleRingLightBtn.title = isOn
      ? '360° Shadowless Ring Light is ON (Click to switch to directional ceiling spotlight)'
      : '360° Shadowless Ring Light is OFF (Click to illuminate board with shadowless 360° ring light)';
  };

  toggleRingLightBtn.addEventListener('click', () => {
    sceneManager.toggleRingLight();
  });
  sceneManager.onRingLightChange(updateRingLightUI);

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

  return container;
}
