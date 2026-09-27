import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createIT2RingRigGroup } from '../src/scene/IT2RingRig';
import { DARTS_DIMENSIONS } from '../src/constants/dartsDimensions';

describe('IT2 Ring Rig Component', () => {
  it('creates IT2 ring rig group positioned at the bullseye height', () => {
    const rig = createIT2RingRigGroup();
    expect(rig).toBeInstanceOf(THREE.Group);
    expect(rig.name).toBe('it2-ring-rig');
    expect(rig.position.y).toBeCloseTo(DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 3);
    expect(rig.position.z).toBeCloseTo(0.0, 3);
  });
});
