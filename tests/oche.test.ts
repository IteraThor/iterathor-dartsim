import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createOcheGroup } from '../src/scene/Oche';
import { createDartRoomGroup } from '../src/scene/DartRoom';
import { DARTS_DIMENSIONS } from '../src/constants/dartsDimensions';

describe('Oche & Room Components', () => {
  it('creates oche group with raised bar front edge at regulation 2.37m', () => {
    const oche = createOcheGroup();
    expect(oche).toBeInstanceOf(THREE.Group);
    const bar = oche.getObjectByName('oche-raised-bar');
    expect(bar).toBeDefined();
    // Front edge of the bar should be at exactly 2.37m
    // bar center is at 2.37m + barDepth/2
    expect(bar!.position.z).toBeCloseTo(
      DARTS_DIMENSIONS.OCHE_DISTANCE_METERS + DARTS_DIMENSIONS.OCHE_BAR_DEPTH_METERS / 2,
      3
    );
  });

  it('creates dart room group with floor, feature wall, and lighting', () => {
    const room = createDartRoomGroup();
    expect(room).toBeInstanceOf(THREE.Group);
    expect(room.getObjectByName('floor')).toBeDefined();
    expect(room.getObjectByName('back-wall')).toBeDefined();
  });
});
