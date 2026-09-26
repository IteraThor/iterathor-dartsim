import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createOcheGroup } from '../src/scene/Oche';
import { createDartRoomGroup } from '../src/scene/DartRoom';
import { DARTS_DIMENSIONS } from '../src/constants/dartsDimensions';

describe('Oche & Room Components', () => {
  it('creates oche group with darts throw mat runner', () => {
    const oche = createOcheGroup();
    expect(oche).toBeInstanceOf(THREE.Group);
    const mat = oche.getObjectByName('darts-mat');
    expect(mat).toBeDefined();
    expect(mat!.position.z).toBeCloseTo(DARTS_DIMENSIONS.MAT_LENGTH_METERS / 2, 3);
  });

  it('creates dart room group with floor, feature wall, right side wall, and lighting', () => {
    const room = createDartRoomGroup();
    expect(room).toBeInstanceOf(THREE.Group);
    expect(room.getObjectByName('floor')).toBeDefined();
    expect(room.getObjectByName('back-wall')).toBeDefined();
    expect(room.getObjectByName('right-wall')).toBeDefined();
    expect(room.getObjectByName('side-baseboard')).toBeDefined();
  });
});
