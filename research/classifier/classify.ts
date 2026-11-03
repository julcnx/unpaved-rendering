// Road drivability classifier: reference implementation.
// Two base levels, paved and unpaved, plus an optional mark on unpaved roads only:
// offroad (needs a high-clearance vehicle) or specialized (render as a path).
//
// Base: surface > tracktype > default (roads paved, tracks unpaved).
// Mark: smoothness > tracktype, and 4wd_only sets a minimum. Ignored on paved roads.

export type Base = 'paved' | 'unpaved';
export type Mark = 'offroad' | 'specialized';
export type Level = Base | Mark;
export type BaseSource = 'surface' | 'tracktype' | 'default';
export type MarkSource = 'smoothness' | 'tracktype' | '4wd_only';

export const RANK: Record<Mark, number> = { offroad: 0, specialized: 1 };

// Whitelist: any surface value not listed here is unpaved, including typos and local values.
// cobblestone is a legacy value, mostly used for sett.
export const PAVED_SURFACES = new Set([
  'paved', 'asphalt', 'chipseal', 'concrete', 'concrete:plates',
  'paving_stones', 'sett', 'bricks', 'metal', 'wood', 'cobblestone', 'cobblestone:flattened',
]);

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

// Multiple values (e.g. "asphalt;concrete") are paved only if every part is.
export function surfaceBase(surface: string): Base {
  return surface.split(';').every((s) => PAVED_SURFACES.has(s.trim())) ? 'paved' : 'unpaved';
}

export type Result = { level: Level; base: Base; baseSource: BaseSource; mark: Mark | null; markSource: MarkSource | null };

export function classifyDetailed(tags: Tags): Result {
  let base: Base;
  let baseSource: BaseSource;
  if (tags.surface) {
    base = surfaceBase(tags.surface);
    baseSource = 'surface';
  } else if (tags.tracktype && tags.tracktype in TRACKTYPE_MARK) {
    base = tags.tracktype === 'grade1' ? 'paved' : 'unpaved';
    baseSource = 'tracktype';
  } else {
    // Missing surface: roads are assumed paved, tracks never are.
    base = tags.highway === 'track' ? 'unpaved' : 'paved';
    baseSource = 'default';
  }
  if (base === 'paved') return { level: 'paved', base, baseSource, mark: null, markSource: null };

  let mark: Mark | null = null;
  let markSource: MarkSource | null = null;
  if (tags.smoothness && tags.smoothness in SMOOTHNESS) {
    mark = SMOOTHNESS[tags.smoothness];
    markSource = mark && 'smoothness';
  } else if (tags.tracktype && tags.tracktype in TRACKTYPE_MARK) {
    mark = TRACKTYPE_MARK[tags.tracktype];
    markSource = mark && 'tracktype';
  }
  const fourWd = tags['4wd_only'] && FOUR_WD_ONLY[tags['4wd_only']];
  if (fourWd && (!mark || RANK[fourWd] > RANK[mark])) {
    mark = fourWd;
    markSource = '4wd_only';
  }
  return { level: mark ?? 'unpaved', base, baseSource, mark, markSource };
}

export function classify(tags: Tags): Level {
  return classifyDetailed(tags).level;
}
