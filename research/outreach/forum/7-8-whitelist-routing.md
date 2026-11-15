# Forum posts #7 (Richard Fairhurst) and #8 (danielscott93): whitelist and routing

Posted by Julien 2026-11-15. Thread: https://community.openstreetmap.org/t/draft-for-feedback-showing-unpaved-roads-on-osm-based-maps-without-losing-the-road-class/150052/8

## What they said (2026-11-13)

**#7 Richard (cycle.travel), answering [5-cycle-travel.md](5-cycle-travel.md):**
- Tertiary turning white: cycle.travel's raster rendering has two databases, North America and Europe. The European one does not keep the road class on unpaved roads. Low priority for him (unpaved secondary and above are rare in Europe); the site will move to the vector maps of the mobile app, which keep the class.
- Whitelist vs blacklist: "no strong argument either way". A blacklist fails on `surface=laterite`, a whitelist on (say) `surface=bitmac`. Whitelisting can break routing if done carelessly: OSRM would not route through a major London road for years because of a barrier node with an unusual value. He watches taginfo for new values.

**#8 danielscott93:** supports the whitelist for rendering only. A wrong unpaved drawing is conspicuous and easy to fix (a mapper sees `bitmac` drawn unpaved and corrects it); routing should not infer passability from the same fallback. For apps: display unknown as unpaved, route unknown as unknown, until a profile handles it.

## Checks

- `surface=bitmac`: 1,348 ways on taginfo (2026-11-15). Was not in our whitelist, so drawn Unpaved (fixed below). For comparison `tarmac` 311 ways, `dbst` 25.
- Routing is already out of scope (article, "Not covered"; Limits bullet "Routing" in [../../../article.md](../../../article.md)), but the article never says the fallback must not be reused for routing.

## Done (2026-11-15)

- Whitelist (Julien: "why not simply support bitmac, or convert the tag if it should not be used"): every paved value with an in-use or de facto wiki page is now accepted: `unhewn_cobblestone`, `bitmac`, `tarmac`, `metal_grid`, `tiles`; `stone`, `paving_stones:lanes` and `grass_paver:lanes` with the `wood` rule (paved only when `smoothness` is `bad` or better). Deprecated or misspelled values (`cement` deprecated for `concrete`, `brick` a redirect to `bricks`) stay Unpaved and are listed for retagging in [../surface-values.md](../surface-values.md). C-statistics decision 17; 1,315 km of 20.0 million change, nearly all `unhewn_cobblestone` in Mexico, Brazil and Bolivia.
- Article, "Why a whitelist": the error is visible and fixed in the data; a rendering rule only, routers should treat an unknown value as unknown.

Left: App reports, cycle.travel row (Europe raster drops the class on unpaved roads, North America and the vector maps keep it; unpaved values listed, rest paved).

## Draft reply (one post, quoting both)

Paste as is (Discourse markdown).

[quote="Richard, post:7, topic:150052"]
The European one doesn’t preserve the road type.
[/quote]

Ah, that explains it, thanks. I'll mention it in the app reports, and good to hear the vector maps keep the class.

[quote="Richard, post:7, topic:150052"]
One fails on surface=laterite, the other on (say) surface=bitmac.
[/quote]

Good catch, bitmac wasn't in the list. I went through the paved values on the wiki and added the documented ones I'd missed: bitmac, tarmac, unhewn_cobblestone and metal_grid (plus stone and the :lanes values, but only when smoothness says they're OK). So what's left to fail on should be undocumented or deprecated stuff like cement or brick, which is better retagged anyway. And I still prefer failing that way on a map, for the reason Daniel gives: a paved road drawn as unpaved stands out and someone fixes the tag, while a laterite road drawn as paved just looks normal and nobody notices.

[quote="danielscott93, post:8, topic:150052"]
For apps, the cautious approach is: display unknown as unpaved, but route unknown as unknown
[/quote]

Agreed, and the article didn't really say that. I've added a line: the fallback is for drawing only, and a router should treat an unknown value as unknown. Richard, your OSRM barrier story is exactly what that line is for.
