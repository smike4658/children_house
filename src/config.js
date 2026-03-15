// ============================================================
// CONFIG — všechny rozměry na jednom místě (přízemní verze)
// ============================================================
const CONFIG = {
  W: 3.10,
  D: 2.42,
  H_FRONT: 2.00,    // výška přední stěny (vyšší)
  H_BACK: 1.90,     // výška zadní stěny (nižší — sklon střechy dozadu)
  H_ROOF_FRONT: 2.20, // výška přední hrany střechy (s přesahem nad stěnou)
  get H_ROOF_BACK() { return this.H_BACK; }, // zadní hrana střechy = výška zadní stěny
  get ROOF_DROP() { return this.H_ROOF_FRONT - this.H_ROOF_BACK; }, // sklon střechy (30 cm)
  POST: 0.12,
  WALL_T: 0.04,
  BEAM: 0.10,       // nosníky 10×10 cm
  ROOF_OVERHANG: 0.15,

  // Posuvné dveře (přední stěna, vlevo)
  DOOR_W: 0.80,
  DOOR_H: 1.60,
  DOOR_OFFSET_X: -0.55,  // posun vlevo od středu

  // Boční okna (levá, pravá stěna)
  SIDE_WIN_W: 0.50,
  SIDE_WIN_H: 0.40,

  // Prodejní okno — California styl (přední stěna, vpravo)
  SERVE_WIN_W: 0.80,
  SERVE_WIN_H: 0.50,
  SERVE_WIN_X: 0.55,       // offset vpravo od středu
  SERVE_WIN_BOTTOM: 0.80,  // spodní hrana = výška pultu
  SERVE_COUNTER_D: 0.20,   // hloubka pultu (ven ze stěny)
  SERVE_AWNING_D: 0.20,    // hloubka stříšky

  // Klouzačka s plošinou (+X strana = vlevo na obrazovce)
  PLATFORM_W: 1.00,        // šířka plošiny (X, od stěny ven)
  PLATFORM_D: 1.00,        // hloubka plošiny (Z)
  PLATFORM_H: 1.00,        // výška plošiny
  PLATFORM_POST: 0.10,     // sloupky plošiny
  PLATFORM_Z: -0.30,       // střed plošiny v Z
  PLATFORM_RAIL_H: 0.70,   // výška zábradlí nad deskou
  SLIDE_LEN: 2.00,         // délka klouzačky
  SLIDE_W: 0.42,           // šířka klouzačky
  STAIR_DEPTH: 0.30,       // hloubka jednoho schodu
  STAIR_COUNT: 3,          // počet schodů

  HOUSE_X: -3.5,
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
