import { describe, it, expect } from 'vitest';
import { DARTS_DIMENSIONS, calculateDiagonalOcheDistance } from '../src/constants/dartsDimensions';

describe('Regulation Darts Dimensions', () => {
  it('has exact regulation height and throw distances', () => {
    expect(DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS).toBeCloseTo(1.727, 3);
    expect(DARTS_DIMENSIONS.OCHE_DISTANCE_METERS).toBeCloseTo(2.370, 3);
    expect(DARTS_DIMENSIONS.BOARD_DIAMETER_METERS).toBeCloseTo(0.451, 3);
    expect(DARTS_DIMENSIONS.BOARD_THICKNESS_METERS).toBeCloseTo(0.038, 3);
  });

  it('calculates diagonal distance from bullseye to oche line matching Pythagorean expectation', () => {
    const diagonal = calculateDiagonalOcheDistance();
    // sqrt(1.727^2 + 2.370^2) = 2.9325m
    expect(diagonal).toBeCloseTo(2.933, 2);
  });

  it('contains regulation ring radii', () => {
    expect(DARTS_DIMENSIONS.INNER_BULL_RADIUS_METERS).toBeCloseTo(0.00635, 4);
    expect(DARTS_DIMENSIONS.OUTER_BULL_RADIUS_METERS).toBeCloseTo(0.0159, 4);
    expect(DARTS_DIMENSIONS.TREBLE_RING_INNER_METERS).toBeCloseTo(0.099, 3);
    expect(DARTS_DIMENSIONS.TREBLE_RING_OUTER_METERS).toBeCloseTo(0.107, 3);
    expect(DARTS_DIMENSIONS.DOUBLE_RING_INNER_METERS).toBeCloseTo(0.162, 3);
    expect(DARTS_DIMENSIONS.DOUBLE_RING_OUTER_METERS).toBeCloseTo(0.170, 3);
  });
});
