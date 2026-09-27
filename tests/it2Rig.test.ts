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
    expect(rig.position.z).toBeCloseTo(-DARTS_DIMENSIONS.BOARD_THICKNESS_METERS, 3);
  });

  it('initializes 360° LED ring light strip and 12 symmetric point light emitters', () => {
    const rig = createIT2RingRigGroup();
    const ledStrip = rig.getObjectByName('it2-led-strip');
    expect(ledStrip).toBeDefined();
    expect(ledStrip).toBeInstanceOf(THREE.Mesh);

    const lightGroup = rig.getObjectByName('it2-ring-light-group');
    expect(lightGroup).toBeDefined();

    // Verify 12 360° point lights
    for (let i = 0; i < 12; i++) {
      const light = rig.getObjectByName(`it2-led-light-${i}`) as THREE.PointLight;
      expect(light).toBeDefined();
      expect(light).toBeInstanceOf(THREE.PointLight);
      expect(light.intensity).toBeGreaterThan(0);
      expect(light.castShadow).toBe(false); // Shadowless multi-angle illumination
    }
  });

  it('toggles ring light on and off, adjusting emissive intensity and emitter intensities', () => {
    const rig = createIT2RingRigGroup();
    expect(rig.isRingLightEnabled()).toBe(true);

    // Toggle OFF
    const newState = rig.toggleRingLight();
    expect(newState).toBe(false);
    expect(rig.isRingLightEnabled()).toBe(false);

    const firstLight = rig.getObjectByName('it2-led-light-0') as THREE.PointLight;
    expect(firstLight.intensity).toBe(0);

    const ledStrip = rig.getObjectByName('it2-led-strip') as THREE.Mesh;
    const stripMat = ledStrip.material as THREE.MeshStandardMaterial;
    expect(stripMat.emissiveIntensity).toBe(0);

    // Turn back ON
    rig.setRingLightEnabled(true);
    expect(rig.isRingLightEnabled()).toBe(true);
    expect(firstLight.intensity).toBeGreaterThan(0);
    expect(stripMat.emissiveIntensity).toBeGreaterThan(0);
  });
});
