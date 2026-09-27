import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadSavedState,
  saveState,
  clearSavedState,
  DEFAULT_APP_STATE,
  STORAGE_KEY,
  AppSavedState
} from '../src/state/AppState';

describe('AppState Persistence Module', () => {
  const storageMap = new Map<string, string>();

  beforeEach(() => {
    storageMap.clear();
    const mockStorage = {
      getItem: (key: string) => storageMap.get(key) || null,
      setItem: (key: string, val: string) => storageMap.set(key, val),
      removeItem: (key: string) => storageMap.delete(key),
      clear: () => storageMap.clear(),
      get length() { return storageMap.size; },
      key: (i: number) => Array.from(storageMap.keys())[i] || null
    };

    (globalThis as any).window = {
      localStorage: mockStorage
    };
  });

  it('returns null when no saved state exists', () => {
    const loaded = loadSavedState();
    expect(loaded).toBeNull();
  });

  it('saves and loads valid app state', () => {
    const customState: AppSavedState = {
      version: 1,
      camera: {
        position: { x: 1.2, y: 1.73, z: 2.5 },
        target: { x: 0, y: 1.73, z: 0 },
        preset: 'oche'
      },
      controls: {
        isDaylight: false,
        isRingLight: true,
        ringLightIntensity: 0.8,
        isIT2RigVisible: true,
        is180DartsVisible: false,
        isPlayerDummyVisible: false,
        isDimensionGuidesVisible: true,
        isSidebarCollapsed: true
      }
    };

    const saved = saveState(customState);
    expect(saved).toBe(true);

    const loaded = loadSavedState();
    expect(loaded).not.toBeNull();
    expect(loaded?.camera.position.x).toBe(1.2);
    expect(loaded?.camera.preset).toBe('oche');
    expect(loaded?.controls.isDaylight).toBe(false);
    expect(loaded?.controls.ringLightIntensity).toBe(0.8);
    expect(loaded?.controls.isSidebarCollapsed).toBe(true);
  });

  it('recovers with fallback defaults for missing partial fields', () => {
    const partialJson = JSON.stringify({
      version: 1,
      camera: {
        position: { x: 5.0 }, // missing y and z
        target: {}
      },
      controls: {
        isDaylight: false
      }
    });
    window.localStorage.setItem(STORAGE_KEY, partialJson);

    const loaded = loadSavedState();
    expect(loaded).not.toBeNull();
    expect(loaded?.camera.position.x).toBe(5.0);
    expect(loaded?.camera.position.y).toBe(DEFAULT_APP_STATE.camera.position.y);
    expect(loaded?.controls.isDaylight).toBe(false);
    expect(loaded?.controls.isRingLight).toBe(DEFAULT_APP_STATE.controls.isRingLight);
  });

  it('clears saved state cleanly', () => {
    saveState(DEFAULT_APP_STATE);
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull();

    clearSavedState();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
