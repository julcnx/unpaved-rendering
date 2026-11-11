// Sample spots: the screenshot spots, where one road changes from paved to unpaved.
export const SPOTS = {
  namibia: { name: 'Namibia, C38 near Etosha', center: [-18.81068, 16.9415] },
  bolivia: { name: 'Bolivia, RN3 near Trinidad', center: [-14.87824, -64.99758] },
  nepal: { name: 'Nepal, NH48 in Mustang', center: [28.80567, 83.76673] },
  iceland: { name: 'Iceland, road 54', center: [64.99903, -22.7612] },
  australia: { name: 'Australia, Burke Developmental Road', center: [-17.15373, 144.51059] },
  alberta: { name: 'Canada, Alberta Hwy 40', center: [51.30019, -114.94517] },
  // Facebook post spot (research/todo.md item 29), not a continent spot.
  // radius: cached area in degrees of latitude (default 0.06), wider here for portrait shots at zoom 13.
  pai: { name: 'Thailand, MS.4014 Pai to Wiang Haeng', center: [19.540403, 98.548539], radius: 0.12 },
  // Article hero (2026-11-11): C48 (primary) changes from asphalt to gravel here, photo pair transition-na-9.
  c48: { name: 'Namibia, C48 asphalt to gravel', center: [-18.12805, 21.64435] },
};
