-- Road drivability classifier: Lua port of classify.ts (osm2pgsql flex, Planetiler-style pipelines).
-- Two base levels, paved and unpaved, plus an optional mark on unpaved roads only:
-- offroad (needs a high-clearance vehicle) or specialized (render as a path).
--
-- Base: surface > tracktype > default (roads paved, tracks unpaved).
-- Mark: smoothness > tracktype, and 4wd_only sets a minimum. Ignored on paved roads.
--
-- Usage: local drivability = require('classify')
--        local level, base, base_source, mark, mark_source = drivability.classify(object.tags)

local M = {}

local RANK = { offroad = 0, specialized = 1 }

-- Whitelist: any surface value not listed here is unpaved, including typos and local values.
-- cobblestone is a legacy value, mostly used for sett.
M.PAVED_SURFACES = {
  paved = true, asphalt = true, chipseal = true, concrete = true, ['concrete:plates'] = true,
  paving_stones = true, sett = true, bricks = true, metal = true, wood = true,
  cobblestone = true, ['cobblestone:flattened'] = true,
}

-- Smoothness only gives evidence for the mark; better values give no mark (false).
M.SMOOTHNESS = {
  excellent = false, good = false, intermediate = false, bad = false,
  very_bad = 'offroad', horrible = 'offroad',
  very_horrible = 'specialized', impassable = 'specialized',
}

-- grade6-8 are an Australian local extension (Australian Tagging Guidelines/Roads).
M.TRACKTYPE_MARK = {
  grade1 = false, grade2 = false,
  grade3 = 'offroad', grade4 = 'offroad', grade5 = 'offroad', grade6 = 'offroad', grade7 = 'offroad',
  grade8 = 'specialized',
}

M.FOUR_WD_ONLY = { recommended = 'offroad', yes = 'offroad', extreme = 'specialized' }

-- Multiple values (e.g. "asphalt;concrete") are paved only if every part is.
function M.surface_base(surface)
  for part in string.gmatch(surface, '[^;]+') do
    if not M.PAVED_SURFACES[part:match('^%s*(.-)%s*$')] then return 'unpaved' end
  end
  return 'paved'
end

-- Returns level, base, base_source, mark, mark_source (mark and mark_source are nil when there is no mark).
function M.classify(tags)
  local base, base_source
  if tags.surface then
    base, base_source = M.surface_base(tags.surface), 'surface'
  elseif tags.tracktype and M.TRACKTYPE_MARK[tags.tracktype] ~= nil then
    base, base_source = tags.tracktype == 'grade1' and 'paved' or 'unpaved', 'tracktype'
  else
    -- Missing surface: roads are assumed paved, tracks never are.
    base, base_source = tags.highway == 'track' and 'unpaved' or 'paved', 'default'
  end
  if base == 'paved' then return 'paved', base, base_source, nil, nil end

  local mark, mark_source
  if tags.smoothness and M.SMOOTHNESS[tags.smoothness] ~= nil then
    mark = M.SMOOTHNESS[tags.smoothness] or nil
    mark_source = mark and 'smoothness' or nil
  elseif tags.tracktype and M.TRACKTYPE_MARK[tags.tracktype] ~= nil then
    mark = M.TRACKTYPE_MARK[tags.tracktype] or nil
    mark_source = mark and 'tracktype' or nil
  end
  local four_wd = tags['4wd_only'] and M.FOUR_WD_ONLY[tags['4wd_only']]
  if four_wd and (not mark or RANK[four_wd] > RANK[mark]) then
    mark, mark_source = four_wd, '4wd_only'
  end
  return mark or 'unpaved', base, base_source, mark, mark_source
end

return M
