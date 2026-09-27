export interface CameraState {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  preset: 'oche' | 'board' | 'side' | 'top' | 'isometric' | null;
}

export interface ControlsState {
  isDaylight: boolean;
  isRingLight: boolean;
  ringLightIntensity: number;
  isIT2RigVisible: boolean;
  is180DartsVisible: boolean;
  isPlayerDummyVisible: boolean;
  isDimensionGuidesVisible: boolean;
  isSidebarCollapsed: boolean;
}

export interface AppSavedState {
  version: 1;
  camera: CameraState;
  controls: ControlsState;
}

export const STORAGE_KEY = 'darts_sim_saved_state_v1';

export const DEFAULT_APP_STATE: AppSavedState = {
  version: 1,
  camera: {
    position: { x: -2.4, y: 2.2, z: 3.6 },
    target: { x: 0, y: 1.038, z: 1.1 },
    preset: 'isometric'
  },
  controls: {
    isDaylight: true,
    isRingLight: true,
    ringLightIntensity: 1.0,
    isIT2RigVisible: true,
    is180DartsVisible: true,
    isPlayerDummyVisible: true,
    isDimensionGuidesVisible: true,
    isSidebarCollapsed: false
  }
};

/**
 * Safely loads saved state from localStorage with fallback to defaults.
 */
export function loadSavedState(): AppSavedState | null {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppSavedState>;
    if (!parsed || parsed.version !== 1 || !parsed.camera || !parsed.controls) {
      return null;
    }

    // Merge with defaults to ensure all fields are guaranteed
    return {
      version: 1,
      camera: {
        position: {
          x: typeof parsed.camera.position?.x === 'number' ? parsed.camera.position.x : DEFAULT_APP_STATE.camera.position.x,
          y: typeof parsed.camera.position?.y === 'number' ? parsed.camera.position.y : DEFAULT_APP_STATE.camera.position.y,
          z: typeof parsed.camera.position?.z === 'number' ? parsed.camera.position.z : DEFAULT_APP_STATE.camera.position.z
        },
        target: {
          x: typeof parsed.camera.target?.x === 'number' ? parsed.camera.target.x : DEFAULT_APP_STATE.camera.target.x,
          y: typeof parsed.camera.target?.y === 'number' ? parsed.camera.target.y : DEFAULT_APP_STATE.camera.target.y,
          z: typeof parsed.camera.target?.z === 'number' ? parsed.camera.target.z : DEFAULT_APP_STATE.camera.target.z
        },
        preset: parsed.camera.preset !== undefined ? parsed.camera.preset : DEFAULT_APP_STATE.camera.preset
      },
      controls: {
        isDaylight: typeof parsed.controls.isDaylight === 'boolean' ? parsed.controls.isDaylight : DEFAULT_APP_STATE.controls.isDaylight,
        isRingLight: typeof parsed.controls.isRingLight === 'boolean' ? parsed.controls.isRingLight : DEFAULT_APP_STATE.controls.isRingLight,
        ringLightIntensity: typeof parsed.controls.ringLightIntensity === 'number' ? parsed.controls.ringLightIntensity : DEFAULT_APP_STATE.controls.ringLightIntensity,
        isIT2RigVisible: typeof parsed.controls.isIT2RigVisible === 'boolean' ? parsed.controls.isIT2RigVisible : DEFAULT_APP_STATE.controls.isIT2RigVisible,
        is180DartsVisible: typeof parsed.controls.is180DartsVisible === 'boolean' ? parsed.controls.is180DartsVisible : DEFAULT_APP_STATE.controls.is180DartsVisible,
        isPlayerDummyVisible: typeof parsed.controls.isPlayerDummyVisible === 'boolean' ? parsed.controls.isPlayerDummyVisible : DEFAULT_APP_STATE.controls.isPlayerDummyVisible,
        isDimensionGuidesVisible: typeof parsed.controls.isDimensionGuidesVisible === 'boolean' ? parsed.controls.isDimensionGuidesVisible : DEFAULT_APP_STATE.controls.isDimensionGuidesVisible,
        isSidebarCollapsed: typeof parsed.controls.isSidebarCollapsed === 'boolean' ? parsed.controls.isSidebarCollapsed : DEFAULT_APP_STATE.controls.isSidebarCollapsed
      }
    };
  } catch (err) {
    console.warn('Failed to parse saved state from localStorage:', err);
    return null;
  }
}

/**
 * Safely saves state to localStorage.
 */
export function saveState(state: AppSavedState): boolean {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.warn('Failed to save state to localStorage:', err);
    return false;
  }
}

/**
 * Clears saved state from localStorage.
 */
export function clearSavedState(): boolean {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false;
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.warn('Failed to clear state from localStorage:', err);
    return false;
  }
}
