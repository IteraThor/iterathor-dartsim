import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createDartsGroup } from '../src/scene/Darts';
import { DARTS_DIMENSIONS } from '../src/constants/dartsDimensions';

describe('Tournament Darts Component', () => {
  it('creates a cluster of 3 tournament darts positioned in treble 20', () => {
    const dartsGroup = createDartsGroup();
    expect(dartsGroup).toBeInstanceOf(THREE.Group);
    expect(dartsGroup.name).toBe('tournament-darts-group');

    // Should contain 3 darts
    const dart1 = dartsGroup.getObjectByName('dart-1');
    const dart2 = dartsGroup.getObjectByName('dart-2');
    const dart3 = dartsGroup.getObjectByName('dart-3');

    expect(dart1).toBeDefined();
    expect(dart2).toBeDefined();
    expect(dart3).toBeDefined();

    // Verify positioning near treble 20 (Y around 1.834m, Z around 0m)
    expect(dart1!.position.y).toBeCloseTo(DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS + 0.107, 1);
    expect(dart1!.position.z).toBeCloseTo(0, 2);
  });

  it('sets shadow casting on all barrels, stems, and flights for shadow analysis', () => {
    const dartsGroup = createDartsGroup();
    let meshCount = 0;
    dartsGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        meshCount++;
        expect(child.castShadow).toBe(true);
      }
    });
    expect(meshCount).toBeGreaterThanOrEqual(12);
  });
});
