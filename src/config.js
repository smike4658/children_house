// ============================================================
// CONFIG — všechny rozměry na jednom místě
// ============================================================
const CONFIG = {
  W: 3.10,
  D: 2.42,
  H: 3.00,
  H1: 1.50,
  TD: 0.70,
  get CD() { return this.D - this.TD; },  // 1.72
  get divZ() { return -this.D / 2 + this.TD; }, // Z přední stěny kabiny ≈ -0.51
  POST: 0.12,
  WALL_T: 0.04,
  BEAM: 0.07,
  ROOF_OVERHANG: 0.15,
  ROOF_PEAK: 0.45,
  DOOR_W: 0.55,
  DOOR_H: 1.10,
  DOOR_OFFSET_X: 0.15,
  SIDE_WIN_W: 0.50,
  SIDE_WIN_H: 0.40,
  FRONT_WIN_W: 0.50,
  FRONT_WIN_H: 0.45,
  SLIDE_LEN: 2.60,
  SLIDE_W: 0.42,
  LADDER_W: 0.45,
  LADDER_H: 1.85,
  LADDER_RUNGS: 6,
  RAIL_H: 0.90,
  RAIL_T: 0.04,
};

const COLORS = {
  posts: '#C4944A',
  walls: '#B8860B',
  floor: '#A0784C',
  roof: '#6B3A2A',
  roofEdge: '#4A2818',
  railing: '#D4A056',
  slide: '#FFD700',
  ladder: '#5B8C3E',
  frame: '#f0e8d0',
  concrete: '#999999',
  grass: '#4a7a2e',
  sky: '#87CEEB',
  glass: '#a0d0e8',
};
