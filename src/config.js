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
  DOOR_W: 0.60,
  DOOR_H: 1.25,
  DOOR_OFFSET_X: 0.15,
  SIDE_WIN_W: 0.60,
  SIDE_WIN_H: 0.50,
  FRONT_WIN_W: 0.80,
  FRONT_WIN_H: 0.50,
  SLIDE_LEN: 2.60,
  SLIDE_W: 0.42,
  STAIRS_W: 0.62,
  STAIRS_RUN: 1.60,
  RAIL_H: 0.90,
  RAIL_T: 0.04,
  HOUSE_X: -3.5,  // X pozice domečku ve scéně (záporné = vpravo z pohledu kamery)
};

const COLORS = {
  posts: '#C88E4B',
  walls: '#EAEBE6',
  floor: '#C88E4B',
  roof: '#7F878C',
  roofEdge: '#C88E4B',
  railing: '#EAEBE6',
  slide: '#E2C222',
  ladder: '#EAEBE6',
  frame: '#B87A36',
  concrete: '#A4A8A4',
  grass: '#587A3E',
  sky: '#87CEEB',
  glass: '#a0d0e8',
  pebbles: '#E6E4E0',
  hornbeams: '#3A5A28',
  fenceTex: '#4c4c4c',
  swingFrame: '#222222',
  swingSeat: '#CC2222'
};
