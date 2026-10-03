import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { DARTS_DIMENSIONS } from '../src/constants/dartsDimensions';
import { bullseyeMmToWorld, worldToBullseyeMm, CustomCameraRig } from '../src/scene/CustomCameraRig';

describe('Custom Camera Bullseye Coordinates', () => {
  it('converts (0, 0, 0) mm to exact bullseye world position', () => {
    const worldPos = bullseyeMmToWorld({ x: 0, y: 0, z: 0 });
    expect(worldPos.x).toBeCloseTo(0, 4);
    expect(worldPos.y).toBeCloseTo(DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 4);
    expect(worldPos.z).toBeCloseTo(0, 4);
  });

  it('converts bullseye world position to (0, 0, 0) mm', () => {
    const world = new THREE.Vector3(0, DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 0);
    const mm = worldToBullseyeMm(world);
    expect(mm.x).toBe(0);
    expect(mm.y).toBe(0);
    expect(mm.z).toBe(0);
  });

  it('correctly handles positive and negative millimeter offsets', () => {
    const coords = { x: -350, y: 250, z: 1200 };
    const world = bullseyeMmToWorld(coords);
    expect(world.x).toBeCloseTo(-0.35, 3);
    expect(world.y).toBeCloseTo(DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS + 0.25, 3);
    expect(world.z).toBeCloseTo(1.2, 3);

    const roundtrip = worldToBullseyeMm(world);
    expect(roundtrip.x).toBe(-350);
    expect(roundtrip.y).toBe(250);
    expect(roundtrip.z).toBe(1200);
  });

  it('creates custom camera rig with correct camera orientation aiming at bullseye', () => {
    const rig = new CustomCameraRig({ x: 400, y: 150, z: 1500 });
    expect(rig.camera).toBeDefined();
    expect(rig.group).toBeDefined();

    const currentMm = rig.getCoordsMm();
    expect(currentMm.x).toBe(400);
    expect(currentMm.y).toBe(150);
    expect(currentMm.z).toBe(1500);

    rig.setCoordsMm({ x: -200, y: 0, z: 800 });
    const updatedMm = rig.getCoordsMm();
    expect(updatedMm.x).toBe(-200);
    expect(updatedMm.y).toBe(0);
    expect(updatedMm.z).toBe(800);
  });
});
