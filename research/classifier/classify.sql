-- Unpaved road rendering classifier: PostgreSQL port of classify.ts.
-- Two base levels, paved and unpaved, plus an optional mark on unpaved roads only:
-- offroad (needs a high-clearance vehicle) or specialized (render as a path).
--
-- Base: surface > tracktype > default (roads paved, tracks unpaved).
-- Mark: smoothness > tracktype, and 4wd_only sets a minimum. Ignored on paved roads.
--
-- Usage, with an hstore tags column (osm2pgsql):
--   SELECT road_surface_class(highway, tags->'surface', tags->'smoothness', tags->'tracktype', tags->'4wd_only') FROM planet_osm_line;
-- Returns 'paved', 'unpaved', 'offroad' or 'specialized'.

-- Whitelist: any surface value not listed is unpaved, including typos and local values.
-- Multiple values (e.g. 'asphalt;concrete') are paved only if every part is. cobblestone is a legacy value, mostly used for sett.
CREATE OR REPLACE FUNCTION road_surface_base(surface text) RETURNS text AS $$
  SELECT CASE WHEN bool_and(trim(p) IN ('paved', 'asphalt', 'chipseal', 'concrete', 'concrete:plates', 'paving_stones',
                                        'sett', 'bricks', 'metal', 'wood', 'cobblestone', 'cobblestone:flattened'))
    THEN 'paved' ELSE 'unpaved' END
  FROM unnest(string_to_array(surface, ';')) AS p;
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION road_surface_class(highway text, surface text, smoothness text, tracktype text, fourwd_only text)
RETURNS text AS $$
  SELECT CASE
    WHEN base = 'paved' THEN 'paved'
    WHEN fourwd = 'specialized' OR mark = 'specialized' THEN 'specialized'
    WHEN fourwd = 'offroad' OR mark = 'offroad' THEN 'offroad'
    ELSE 'unpaved'
  END
  FROM (SELECT
    CASE
      WHEN surface IS NOT NULL THEN road_surface_base(surface)
      WHEN tracktype = 'grade1' THEN 'paved'
      -- grade6-8 are an Australian local extension (Australian Tagging Guidelines/Roads).
      WHEN tracktype IN ('grade2', 'grade3', 'grade4', 'grade5', 'grade6', 'grade7', 'grade8') THEN 'unpaved'
      -- Missing surface: roads are assumed paved, tracks never are.
      WHEN highway = 'track' THEN 'unpaved'
      ELSE 'paved'
    END AS base,
    -- Smoothness decides the mark when it has a known value; otherwise tracktype.
    CASE
      WHEN smoothness IN ('very_bad', 'horrible') THEN 'offroad'
      WHEN smoothness IN ('very_horrible', 'impassable') THEN 'specialized'
      WHEN smoothness IN ('excellent', 'good', 'intermediate', 'bad') THEN NULL
      WHEN tracktype IN ('grade3', 'grade4', 'grade5', 'grade6', 'grade7') THEN 'offroad'
      WHEN tracktype = 'grade8' THEN 'specialized'
    END AS mark,
    CASE fourwd_only WHEN 'recommended' THEN 'offroad' WHEN 'yes' THEN 'offroad' WHEN 'extreme' THEN 'specialized' END AS fourwd
  ) levels;
$$ LANGUAGE sql IMMUTABLE;
