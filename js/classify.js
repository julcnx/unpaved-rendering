// Classifier: plain-JS copy of osm-wiki/unpaved-rendering/classifier/classify.ts (same test cases in test/).
// Two levels, paved and unpaved, plus an optional mark on unpaved roads only:
// offroad (needs a high-clearance vehicle) or specialized (could be drawn as a path).
// Base: unpaved surface > unpaved evidence > paved surface > tracktype (grade1 paved, grade2 or higher unpaved) > default (roads paved, tracks unpaved).
// Unpaved evidence: smoothness very_bad or worse, or 4wd_only, makes a road unpaved, even with a paved surface. tracktype never overrules a surface. Reasons: see research/classifier/classify.ts.
// wood, concrete:lanes and grass_paver are unpaved unless smoothness is bad or better.
// Mark: smoothness > tracktype > surface (mud, rock), and 4wd_only sets a minimum. Only on unpaved roads.

const RANK = { offroad: 0, specialized: 1 };

// Whitelist: any surface value not listed here is unpaved, including typos and local values.
export const PAVED_SURFACES = new Set([
  'paved', 'asphalt', 'chipseal', 'concrete', 'concrete:plates',
  'paving_stones', 'sett', 'bricks', 'metal', 'cobblestone', 'cobblestone:flattened',
]);
export const MIXED_SURFACES = new Set(['wood', 'concrete:lanes', 'grass_paver']);
const SMOOTH_ENOUGH = new Set(['excellent', 'good', 'intermediate', 'bad']);

const SMOOTHNESS = {
  excellent: null, good: null, intermediate: null, bad: null,
  very_bad: 'offroad', horrible: 'offroad',
  very_horrible: 'specialized', impassable: 'specialized',
};
// grade6-8 are an Australian local extension.
const TRACKTYPE_MARK = {
  grade1: null, grade2: null, grade3: null,
  grade4: 'offroad', grade5: 'offroad', grade6: 'offroad', grade7: 'offroad',
  grade8: 'specialized',
};
const OFFROAD_SURFACES = new Set(['mud', 'rock']);
const FOUR_WD_ONLY = { recommended: 'offroad', yes: 'offroad', extreme: 'specialized' };
const has = (o, k) => k !== undefined && Object.prototype.hasOwnProperty.call(o, k);

export function surfaceBase(surface, smoothness) {
  const smooth = SMOOTH_ENOUGH.has(smoothness);
  return surface.split(';').every((s) => PAVED_SURFACES.has(s.trim()) || (smooth && MIXED_SURFACES.has(s.trim()))) ? 'paved' : 'unpaved';
}

export function classifyDetailed(tags) {
  let base, baseSource;
  const surface = tags.surface ? surfaceBase(tags.surface, tags.smoothness) : null;
  if (surface === 'unpaved') { base = 'unpaved'; baseSource = 'surface'; }
  else if (has(SMOOTHNESS, tags.smoothness) && SMOOTHNESS[tags.smoothness]) { base = 'unpaved'; baseSource = 'smoothness'; }
  else if (has(FOUR_WD_ONLY, tags['4wd_only'])) { base = 'unpaved'; baseSource = '4wd_only'; }
  else if (surface) { base = surface; baseSource = 'surface'; }
  else if (has(TRACKTYPE_MARK, tags.tracktype)) { base = tags.tracktype === 'grade1' ? 'paved' : 'unpaved'; baseSource = 'tracktype'; }
  else { base = tags.highway === 'track' ? 'unpaved' : 'paved'; baseSource = 'default'; }
  if (base === 'paved') return { level: 'paved', base, baseSource, mark: null, markSource: null };
  let mark = null, markSource = null;
  if (has(SMOOTHNESS, tags.smoothness)) { mark = SMOOTHNESS[tags.smoothness]; markSource = mark && 'smoothness'; }
  else if (has(TRACKTYPE_MARK, tags.tracktype)) { mark = TRACKTYPE_MARK[tags.tracktype]; markSource = mark && 'tracktype'; }
  else if (tags.surface?.split(';').some((s) => OFFROAD_SURFACES.has(s.trim()))) { mark = 'offroad'; markSource = 'surface'; }
  const fourWd = has(FOUR_WD_ONLY, tags['4wd_only']) && FOUR_WD_ONLY[tags['4wd_only']];
  if (fourWd && (!mark || RANK[fourWd] > RANK[mark])) { mark = fourWd; markSource = '4wd_only'; }
  return { level: mark ?? 'unpaved', base, baseSource, mark, markSource };
}

export const classify = (tags) => classifyDetailed(tags).level;
