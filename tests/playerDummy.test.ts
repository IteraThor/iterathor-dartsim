import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createPlayerDummyGroup } from '../src/scene/PlayerDummy';
import { DARTS_DIMENSIONS } from '../src/constants/dartsDimensions';

describe('Player Dummy Component', () => {
  it('creates player dummy group with regulation average male height (1.78m)', () => {
    const dummy = createPlayerDummyGroup();
    expect(dummy).toBeInstanceOf(THREE.Group);
    expect(dummy.name).toBe('player-dummy');

    // Compute bounding box
    const bbox = new THREE.Box3().setFromObject(dummy);
    const height = bbox.max.y - bbox.min.y;

    // Average adult male height is approx 1.78m (within 3cm tolerance)
    expect(height).toBeGreaterThanOrEqual(1.75);
    expect(height).toBeLessThanOrEqual(1.82);
  });

  it('positions the player lead foot right at the regulation throw line (Z = 2.37m)', () => {
    const dummy = createPlayerDummyGroup();
    const leadFoot = dummy.getObjectByName('dummy-lead-foot');
    expect(leadFoot).toBeDefined();

    const footBbox = new THREE.Box3().setFromObject(leadFoot!);
    // Front edge of lead foot rests right at the regulation 2.37m oche line
    expect(footBbox.min.z).toBeCloseTo(DARTS_DIMENSIONS.OCHE_DISTANCE_METERS, 2);
  });

  it('contains anatomical segments and throwing arm pose', () => {
    const dummy = createPlayerDummyGroup();
    const head = dummy.getObjectByName('dummy-head');
    const torso = dummy.getObjectByName('dummy-torso');
    const throwingArm = dummy.getObjectByName('dummy-throwing-arm');

    expect(head).toBeDefined();
    expect(torso).toBeDefined();
    expect(throwingArm).toBeDefined();
  });
});
