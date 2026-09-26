/**
 * Official WDF (World Darts Federation) & PDC Regulation Dimensions
 * Standard units in 3D scene: 1 unit = 1.0 meter
 */
export const DARTS_DIMENSIONS = {
  // Height from floor level to bullseye center: 1.727m (5ft 8in)
  BULLSEYE_HEIGHT_METERS: 1.727,

  // Horizontal distance from front face of board to front edge of oche: 2.37m (7ft 9.25in)
  OCHE_DISTANCE_METERS: 2.370,

  // Dartboard body
  BOARD_DIAMETER_METERS: 0.451, // 451mm
  BOARD_RADIUS_METERS: 0.2255,
  BOARD_THICKNESS_METERS: 0.038, // 38mm

  // Scoring Ring Radii (from bull center to wire centerlines/edges)
  INNER_BULL_RADIUS_METERS: 0.0127 / 2, // 12.7mm diameter -> 6.35mm radius
  OUTER_BULL_RADIUS_METERS: 0.0318 / 2, // 31.8mm diameter -> 15.9mm radius
  TREBLE_RING_INNER_METERS: 0.099,      // 99mm
  TREBLE_RING_OUTER_METERS: 0.107,      // 107mm (8mm width)
  DOUBLE_RING_INNER_METERS: 0.162,      // 162mm
  DOUBLE_RING_OUTER_METERS: 0.170,      // 170mm (8mm width)

  // Standard EVA / Rubber Wall Surround
  SURROUND_OUTER_DIAMETER_METERS: 0.680, // 680mm
  SURROUND_OUTER_RADIUS_METERS: 0.340,
  SURROUND_THICKNESS_METERS: 0.038,

  // Raised Oche Bar
  OCHE_BAR_HEIGHT_METERS: 0.038, // 38mm (1.5 in)
  OCHE_BAR_WIDTH_METERS: 0.600,  // 600mm
  OCHE_BAR_DEPTH_METERS: 0.050,  // 50mm

  // Mat Runner
  MAT_WIDTH_METERS: 0.800,
  MAT_LENGTH_METERS: 3.200,

  // Standard Segment Order clockwise starting at Top Dead Center (angle 0)
  SEGMENTS_ORDER: [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5] as const
} as const;

export function calculateDiagonalOcheDistance(): number {
  return Math.sqrt(
    Math.pow(DARTS_DIMENSIONS.BULLSEYE_HEIGHT_METERS, 2) +
    Math.pow(DARTS_DIMENSIONS.OCHE_DISTANCE_METERS, 2)
  );
}
