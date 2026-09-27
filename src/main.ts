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
    const state: AppSavedState = {
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
        isIT2RigVisible: sceneManager.isIT2Visible(),
        is180DartsVisible: sceneManager.isDartsVisible(),
        isPlayerDummyVisible: sceneManager.isPlayerVisible(),
        isDimensionGuidesVisible: sceneManager.isDimensionsVisible(),
        isSidebarCollapsed: hudElement.isSidebarCollapsed()
      }
    };
    saveState(state);
  };

  const triggerAutoSave = (): void => {
    hudElement.flashSaveIndicator(true);
    if (saveTimeout) window.clearTimeout(saveTimeout);
    saveTimeout = window.setTimeout(() => {
      saveCurrentState();
      hudElement.flashSaveIndicator(false);
    }, 180);
  };

  const handleReset = (): void => {
    clearSavedState();
    sceneManager.setCameraState(
      DEFAULT_APP_STATE.camera.position,
      DEFAULT_APP_STATE.camera.target,
      DEFAULT_APP_STATE.camera.preset
    );
    sceneManager.toggleDaylight(DEFAULT_APP_STATE.controls.isDaylight);
    sceneManager.toggleRingLight(DEFAULT_APP_STATE.controls.isRingLight);
    sceneManager.setRingLightIntensity(DEFAULT_APP_STATE.controls.ringLightIntensity);
    sceneManager.toggleIT2Rig(DEFAULT_APP_STATE.controls.isIT2RigVisible);
    sceneManager.toggleDarts(DEFAULT_APP_STATE.controls.is180DartsVisible);
    sceneManager.togglePlayerDummy(DEFAULT_APP_STATE.controls.isPlayerDummyVisible);
    sceneManager.toggleDimensions(DEFAULT_APP_STATE.controls.isDimensionGuidesVisible);
    hudElement.applyState(DEFAULT_APP_STATE);
    saveCurrentState();
  };

  const hudElement = setupViewControls(sceneManager, triggerAutoSave, handleReset);
  appElement.appendChild(hudElement);

  // Load and restore previous session state if available
  const saved = loadSavedState();
  if (saved) {
    sceneManager.setCameraState(saved.camera.position, saved.camera.target, saved.camera.preset);
    sceneManager.toggleDaylight(saved.controls.isDaylight);
    sceneManager.toggleRingLight(saved.controls.isRingLight);
    sceneManager.setRingLightIntensity(saved.controls.ringLightIntensity);
    sceneManager.toggleIT2Rig(saved.controls.isIT2RigVisible);
    sceneManager.toggleDarts(saved.controls.is180DartsVisible);
    sceneManager.togglePlayerDummy(saved.controls.isPlayerDummyVisible);
    sceneManager.toggleDimensions(saved.controls.isDimensionGuidesVisible);
    hudElement.applyState(saved);
  } else {
    // Default view: 3D Orbit overview showing room, floor, and board
    sceneManager.setViewPreset('isometric', false);
  }

  // Hook OrbitControls interaction end to auto-save camera angle/distance
  sceneManager.controls.addEventListener('end', triggerAutoSave);

  // Guarantee state is saved when leaving or closing page
  window.addEventListener('beforeunload', saveCurrentState);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveCurrentState();
    }
  });

  sceneManager.start();
});
