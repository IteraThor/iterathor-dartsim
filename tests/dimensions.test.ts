import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createDimensionGuidesGroup } from '../src/scene/DimensionGuides';

describe('Dimension Guides Component', () => {
  it('creates dimension guides group with 3 measurement lines', () => {
    const guides = createDimensionGuidesGroup();
    expect(guides).toBeInstanceOf(THREE.Group);
    expect(guides.getObjectByName('dim-vertical-height')).toBeDefined();
    expect(guides.getObjectByName('dim-horizontal-distance')).toBeDefined();
    expect(guides.getObjectByName('dim-diagonal-hypotenuse')).toBeDefined();
  });
});
