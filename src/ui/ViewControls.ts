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
          <span class="metric-value">1.73 m <small>(5' 8")</small></span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Throw Distance</span>
          <span class="metric-value">2.37 m <small>(7' 9¼")</small></span>
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

  return container;
}
