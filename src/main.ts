import { SceneManager } from './scene/SceneManager';
import { setupViewControls } from './ui/ViewControls';
import {
  loadSavedState,
  saveState,
  clearSavedState,
  DEFAULT_APP_STATE,
  AppSavedState
} from './state/AppState';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvas-container');
  const appElement = document.getElementById('app');

  if (!container || !appElement) {
    console.error('Failed to locate app root containers');
    return;
  }

  const sceneManager = new SceneManager(container);

  // Auto-save debounce state
  let saveTimeout: number | undefined;

  const saveCurrentState = (): void => {
    const cam = sceneManager.getCameraState();
    saveState({
      version: 1,
      camera: {
        position: cam.position,
        target: cam.target,
        preset: cam.preset
      },
      controls: {
        isDaylight: sceneManager.isDaylight,
        isRingLight: sceneManager.isRingLightActive,
        ringLightIntensity: sceneManager.getRingLightIntensity(),
        isIT2RigVisible: sceneManager.it2RingRig.visible,
        is180DartsVisible: sceneManager.darts.visible,
        isPlayerDummyVisible: sceneManager.playerDummy.visible,
        isDimensionGuidesVisible: sceneManager.dimensionGuides.visible,
        isSidebarCollapsed: hudElement.isSidebarCollapsed()
      }
    });
  };

  const triggerAutoSave = (): void => {
    if (saveTimeout) window.clearTimeout(saveTimeout);
    saveTimeout = window.setTimeout(saveCurrentState, 180);
  };

  const applyStateToScene = (state: AppSavedState): void => {
    sceneManager.setCameraState(state.camera.position, state.camera.target, state.camera.preset);
    sceneManager.toggleDaylight(state.controls.isDaylight);
    sceneManager.toggleRingLight(state.controls.isRingLight);
    sceneManager.setRingLightIntensity(state.controls.ringLightIntensity);
    sceneManager.toggleIT2Rig(state.controls.isIT2RigVisible);
    sceneManager.toggleDarts(state.controls.is180DartsVisible);
    sceneManager.togglePlayerDummy(state.controls.isPlayerDummyVisible);
    sceneManager.toggleDimensions(state.controls.isDimensionGuidesVisible);
    hudElement.applyState(state);
  };

  const handleReset = (): void => {
    clearSavedState();
    applyStateToScene(DEFAULT_APP_STATE);
    saveCurrentState();
  };

  const hudElement = setupViewControls(sceneManager, triggerAutoSave, handleReset);
  appElement.appendChild(hudElement);

  // Load and restore previous session state if available
  const saved = loadSavedState();
  if (saved) {
    applyStateToScene(saved);
  } else {
    // Default view: 3D Orbit overview showing room, floor, and board
    sceneManager.setViewPreset('isometric', false);
  }

  // Hook OrbitControls interaction end to auto-save camera angle/distance
  sceneManager.controls.addEventListener('end', triggerAutoSave);
  sceneManager.onMoveEnd(triggerAutoSave);

  // Guarantee state is saved when leaving or closing page
  window.addEventListener('beforeunload', saveCurrentState);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveCurrentState();
    }
  });

  sceneManager.start();
});
