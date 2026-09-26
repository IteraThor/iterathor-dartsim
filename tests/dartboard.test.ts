import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createDartboardGroup } from '../src/scene/Dartboard';
import { DARTS_DIMENSIONS } from '../src/constants/dartsDimensions';

describe('Dartboard 3D Component', () => {
  it('creates dartboard group positioned at regulation bullseye height', () => {
    const dartboard = createDartboardGroup();
    expect(dartboard).toBeInstanceOf(THREE.Group);
    expect(dartboard.position.y).toBeCloseTo(DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 3);
    expect(dartboard.position.z).toBeCloseTo(0, 3);
  });

  it('contains board cylinder, face mesh, surround, wire spider, and number ring', () => {
    const dartboard = createDartboardGroup();
    const childNames = dartboard.children.map(c => c.name);
    expect(childNames).toContain('board-cylinder');
    expect(childNames).toContain('board-face');
    expect(childNames).toContain('surround');
    expect(childNames).toContain('wire-spider');
    expect(childNames).toContain('number-ring');
    expect(childNames).toContain('board-rim-band');
  });
});
