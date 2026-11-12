-- Unpaved road rendering classifier: PostgreSQL port of classify.ts.
-- Two base levels, paved and unpaved, plus an optional mark on unpaved roads only:
-- offroad (needs a high-clearance vehicle) or specialized (render as a path).
--
-- Base: unpaved surface > unpaved evidence > paved surface > tracktype (grade1 paved, grade2 or higher unpaved) > default (roads paved, tracks unpaved).
-- Unpaved evidence: smoothness very_bad or worse, or 4wd_only, makes a road unpaved, even with a paved surface. tracktype never overrules a surface. Reasons: see classify.ts.
-- wood, concrete:lanes and grass_paver are unpaved unless smoothness is bad or better.
-- Mark: smoothness > tracktype > surface (mud, rock), and 4wd_only sets a minimum. Only on unpaved roads.
--
-- Usage, with an hstore tags column (osm2pgsql):
--   SELECT road_surface_class(highway, tags->'surface', tags->'smoothness', tags->'tracktype', tags->'4wd_only') FROM planet_osm_line;
-- Returns 'paved', 'unpaved', 'offroad' or 'specialized'.

-- Whitelist: any surface value not listed is unpaved, including typos and local values.
-- Multiple values (e.g. 'asphalt;concrete') are paved only if every part is. cobblestone is a legacy value, mostly used for sett.
-- wood, concrete:lanes and grass_paver are paved in some places, broken or improvised in others: paved only when smoothness is good enough.
CREATE OR REPLACE FUNCTION road_surface_base(surface text, smoothness text) RETURNS text AS $$
  SELECT CASE WHEN bool_and(trim(p) IN ('paved', 'asphalt', 'chipseal', 'concrete', 'concrete:plates', 'paving_stones',
                                        'sett', 'bricks', 'metal', 'cobblestone', 'cobblestone:flattened')
                            OR (trim(p) IN ('wood', 'concrete:lanes', 'grass_paver')
                                AND coalesce(smoothness IN ('excellent', 'good', 'intermediate', 'bad'), false)))
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
      -- A city car cannot pass: the road is not paved, even with a paved surface.
      WHEN smoothness IN ('very_bad', 'horrible', 'very_horrible', 'impassable') THEN 'unpaved'
      WHEN fourwd_only IN ('recommended', 'yes', 'extreme') THEN 'unpaved'
      -- An empty surface value is no surface.
      WHEN surface <> '' THEN road_surface_base(surface, smoothness)
      -- grade6-8 are an Australian local extension (Australian Tagging Guidelines/Roads).
      WHEN tracktype IN ('grade2', 'grade3', 'grade4', 'grade5', 'grade6', 'grade7', 'grade8') THEN 'unpaved'
      WHEN tracktype = 'grade1' THEN 'paved'
      -- Missing surface: roads are assumed paved, tracks never are.
      WHEN highway = 'track' THEN 'unpaved'
      ELSE 'paved'
    END AS base,
    -- Smoothness decides the mark when it has a known value; otherwise tracktype; otherwise a mud or rock surface.
    CASE
      WHEN smoothness IN ('very_bad', 'horrible') THEN 'offroad'
      WHEN smoothness IN ('very_horrible', 'impassable') THEN 'specialized'
      WHEN smoothness IN ('excellent', 'good', 'intermediate', 'bad') THEN NULL
      WHEN tracktype IN ('grade4', 'grade5', 'grade6', 'grade7') THEN 'offroad'
      WHEN tracktype = 'grade8' THEN 'specialized'
      WHEN tracktype IN ('grade1', 'grade2', 'grade3') THEN NULL
      WHEN EXISTS (SELECT 1 FROM unnest(string_to_array(surface, ';')) AS p WHERE trim(p) IN ('mud', 'rock')) THEN 'offroad'
    END AS mark,
    CASE fourwd_only WHEN 'recommended' THEN 'offroad' WHEN 'yes' THEN 'offroad' WHEN 'extreme' THEN 'specialized' END AS fourwd
  ) levels;
$$ LANGUAGE sql IMMUTABLE;
