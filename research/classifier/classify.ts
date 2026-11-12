// Unpaved road rendering classifier: reference implementation.
// Two base levels, paved and unpaved, plus an optional mark on unpaved roads only:
// offroad (needs a high-clearance vehicle) or specialized (render as a path).
//
// Base: unpaved surface > unpaved evidence > paved surface > tracktype=grade1 > default (roads paved, tracks unpaved).
// Unpaved evidence: smoothness very_bad or worse, 4wd_only, or tracktype grade2 or higher makes a road unpaved, even with a paved surface.
// wood, concrete:lanes and grass_paver are unpaved unless smoothness is bad or better.
// Mark: smoothness > tracktype, and 4wd_only sets a minimum. Only on unpaved roads.

export type Base = 'paved' | 'unpaved';
export type Mark = 'offroad' | 'specialized';
export type Level = Base | Mark;
export type BaseSource = 'surface' | 'tracktype' | 'smoothness' | '4wd_only' | 'default';
export type MarkSource = 'smoothness' | 'tracktype' | '4wd_only';

export const RANK: Record<Mark, number> = { offroad: 0, specialized: 1 };

// Whitelist: any surface value not listed here is unpaved, including typos and local values.
// cobblestone is a legacy value, mostly used for sett.
export const PAVED_SURFACES = new Set([
  'paved', 'asphalt', 'chipseal', 'concrete', 'concrete:plates',
  'paving_stones', 'sett', 'bricks', 'metal', 'cobblestone', 'cobblestone:flattened',
]);

// Paved in some places, broken or improvised in others (smooth farm lanes vs washed-out strips,
// plank bridges vs log bridges, intact vs broken grass pavers): unpaved unless smoothness says the road is smooth enough.
export const MIXED_SURFACES = new Set(['wood', 'concrete:lanes', 'grass_paver']);
export const SMOOTH_ENOUGH = new Set(['excellent', 'good', 'intermediate', 'bad']);

// Smoothness only gives evidence for the mark; better values give no mark.
export const SMOOTHNESS: Record<string, Mark | null> = {
  excellent: null, good: null, intermediate: null, bad: null,
  very_bad: 'offroad', horrible: 'offroad',
  very_horrible: 'specialized', impassable: 'specialized',
};

// grade6-8 are an Australian local extension (Australian Tagging Guidelines/Roads).
export const TRACKTYPE_MARK: Record<string, Mark | null> = {
  grade1: null, grade2: null,
  grade3: 'offroad', grade4: 'offroad', grade5: 'offroad', grade6: 'offroad', grade7: 'offroad',
  grade8: 'specialized',
};

export const FOUR_WD_ONLY: Record<string, Mark> = {
  recommended: 'offroad',
  yes: 'offroad',
  extreme: 'specialized',
};

export type Tags = Record<string, string | undefined>;

// Own keys only: a tag value like "constructor" or "toString" must not match the object's built-in properties.
const has = (table: object, value: string | undefined): value is string => value !== undefined && Object.hasOwn(table, value);

// Multiple values (e.g. "asphalt;concrete") are paved only if every part is.
export function surfaceBase(surface: string, smoothness?: string): Base {
  const smooth = smoothness !== undefined && SMOOTH_ENOUGH.has(smoothness);
  return surface.split(';').every((s) => PAVED_SURFACES.has(s.trim()) || (smooth && MIXED_SURFACES.has(s.trim())))
    ? 'paved' : 'unpaved';
}

export type Result = { level: Level; base: Base; baseSource: BaseSource; mark: Mark | null; markSource: MarkSource | null };

export function classifyDetailed(tags: Tags): Result {
  let base: Base;
  let baseSource: BaseSource;
  const surface = tags.surface ? surfaceBase(tags.surface, tags.smoothness) : null;
  if (surface === 'unpaved') {
    base = 'unpaved';
    baseSource = 'surface';
  } else if (has(SMOOTHNESS, tags.smoothness) && SMOOTHNESS[tags.smoothness]) {
    // A city car cannot pass: the road is not paved, even with a paved surface.
    base = 'unpaved';
    baseSource = 'smoothness';
  } else if (has(FOUR_WD_ONLY, tags['4wd_only'])) {
    base = 'unpaved';
    baseSource = '4wd_only';
  } else if (has(TRACKTYPE_MARK, tags.tracktype) && tags.tracktype !== 'grade1') {
    base = 'unpaved';
    baseSource = 'tracktype';
  } else if (surface) {
    base = surface;
    baseSource = 'surface';
  } else if (tags.tracktype === 'grade1') {
    base = 'paved';
    baseSource = 'tracktype';
  } else {
    // Missing surface: roads are assumed paved, tracks never are.
    base = tags.highway === 'track' ? 'unpaved' : 'paved';
    baseSource = 'default';
  }
  if (base === 'paved') return { level: 'paved', base, baseSource, mark: null, markSource: null };

  let mark: Mark | null = null;
  let markSource: MarkSource | null = null;
  if (has(SMOOTHNESS, tags.smoothness)) {
    mark = SMOOTHNESS[tags.smoothness];
    markSource = mark && 'smoothness';
  } else if (has(TRACKTYPE_MARK, tags.tracktype)) {
    mark = TRACKTYPE_MARK[tags.tracktype];
    markSource = mark && 'tracktype';
  }
  const fourWd = has(FOUR_WD_ONLY, tags['4wd_only']) && FOUR_WD_ONLY[tags['4wd_only']];
  if (fourWd && (!mark || RANK[fourWd] > RANK[mark])) {
    mark = fourWd;
    markSource = '4wd_only';
  }
  return { level: mark ?? 'unpaved', base, baseSource, mark, markSource };
}

export function classify(tags: Tags): Level {
  return classifyDetailed(tags).level;
}
