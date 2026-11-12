// Markdown report and summary CSV from stats/results/*.json.
// Usage: node stats/report.ts > stats/report.md
// Also writes stats/summary.csv, stats/unknown-values.md and stats/key-numbers.md (the figures to quote).
// Two levels, Paved and Unpaved, plus the Off-road mark on Unpaved roads. Specialized is folded into the
// Off-road mark (near zero on road classes); raw km stay in the JSON.

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as mark from './mark-coverage.ts';

const dir = new URL('./results/', import.meta.url);
// Paved (tagged) + Untagged + Unpaved = 100%. Off-road mark is the part of Unpaved that has the mark.
const BUCKETS = ['paved_tagged', 'untagged', 'unpaved', 'offroad'];
const HEAD = ['Paved (tagged)', 'Untagged', 'Unpaved', 'of which Off-road mark'];
const columns = (raw: Record<string, number>) => {
  const mark = raw.offroad + raw.specialized;
  return { paved_tagged: raw.paved_tagged, untagged: raw.untagged, unpaved: raw.unpaved + mark, offroad: mark } as Record<string, number>;
};
const KEYS = ['surface', 'smoothness', 'tracktype', '4wd_only'];
const NOTE_KEYS = ['note', 'description', 'fixme'];
const csv: string[] = [['country', 'name', 'data_date', 'class', 'km', ...BUCKETS.map((b) => `km_${b}`), ...BUCKETS.map((b) => `pct_${b}`), 'pct_unpaved_of_tagged'].join(',')];

const pct = (v: number, t: number) => (t ? ((100 * v) / t).toFixed(1) : '0.0');
const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);
const top = (o: Record<string, number>, n: number) =>
  Object.entries(o).slice(0, n).map(([k, v]) => `\`${k}\` ${Math.round(v).toLocaleString('en')}`).join(', ');
const code = (s: string) => '`' + s.replace(/`/g, "'").replace(/\|/g, '/') + '`';
const tagList = (t: Record<string, string>) => [
  ...['ref', ...KEYS].filter((k) => t[k]).map((k) => code(`${k}=${t[k]}`)),
  ...NOTE_KEYS.filter((k) => t[k]).map((k) => `${k}: "${t[k].slice(0, 80).replace(/\|/g, '/')}"`),
].join(' ');
const table = (head: string[], rows: string[][], align = '--:') =>
  [`| ${head.join(' | ')} |`, `|---|${head.slice(1).map(() => align).join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)];
const className = (c: string) => (c === 'all' ? '**All**' : c);

const out: string[] = ['# Unpaved road statistics', ''];
const overview: { row: string[]; sort: number }[] = [];
const OVERVIEW_CLASSES = ['trunk', 'primary', 'secondary', 'tertiary', 'unclassified'];
const unpavedKm = (v: Record<string, number>) => v.unpaved + v.offroad + v.specialized;
// Unpaved share of a class: of all km (a minimum, untagged counts as paved) and of tagged km only (an upper bound,
// because mappers tag surface more often when a road is not paved). NaN when there is nothing to divide by.
const unpavedShare = (v: Record<string, number>) => (sum(v) ? (100 * unpavedKm(v)) / sum(v) : NaN);
const unpavedTaggedShare = (v: Record<string, number>) => (sum(v) - v.untagged ? (100 * unpavedKm(v)) / (sum(v) - v.untagged) : NaN);
const bounds = (v: Record<string, number>) =>
  isNaN(unpavedShare(v)) ? '-' : `${unpavedShare(v).toFixed(0)}% / ${isNaN(unpavedTaggedShare(v)) ? '-' : unpavedTaggedShare(v).toFixed(0) + '%'}`;
const results: any[] = [];
// Unknown values across countries: value -> country -> km.
const unknown: Record<string, Record<string, number>> = {};
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
  const d = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
  results.push(d);
  const r = d.run;
  out.push(`## ${d.name || d.country.toUpperCase()} (${d.country}), data ${d.data_date}`, '');
  out.push(`Run ${r.generated_at.slice(0, 10)}, classifier \`${r.classifier_sha256}\`, pipeline \`${r.pipeline_sha256}\`, ${r.osmium}, extract \`${r.source_pbf}\`, data date from ${r.data_date_source}.`, '');

  const all = sum(d.km.all);
  overview.push({
    sort: unpavedShare(d.km.tertiary),
    row: [d.name || d.country, d.data_date, ...OVERVIEW_CLASSES.map((c) => bounds(d.km[c])),
      pct(d.km.all.offroad + d.km.all.specialized, all) + '%', pct(d.km.all.untagged, all) + '%', Math.round(all).toLocaleString('en')],
  });
  const kmRows = Object.entries<Record<string, number>>(d.km).map(([cls, raw]) => {
    const v = columns(raw);
    const t = sum(raw);
    const tagged = unpavedTaggedShare(raw);
    csv.push([d.country, d.name, d.data_date, cls, t.toFixed(1), ...BUCKETS.map((b) => v[b].toFixed(1)), ...BUCKETS.map((b) => pct(v[b], t)), isNaN(tagged) ? '' : tagged.toFixed(1)].join(','));
    return [className(cls), Math.round(t).toLocaleString('en'), ...BUCKETS.map((b) => pct(v[b], t) + '%')];
  });
  out.push(...table(['Class', 'km', ...HEAD], kmRows));
  out.push('', 'Untagged: no `surface` and no known `tracktype`, so the road is assumed paved. Paved (tagged) + Untagged + Unpaved = 100%. The Off-road mark is the part of Unpaved with off-road evidence (`smoothness`, `tracktype`, `4wd_only`, or `surface=mud` or `rock`).');

  const total = (cls: string) => sum(d.km[cls]);
  out.push('', '### Tag coverage (% of km with the tag, any value)', '');
  out.push(...table(['Class', ...KEYS.map((k) => `\`${k}\``)],
    Object.entries<Record<string, number>>(d.coverage_km).map(([cls, cov]) => [className(cls), ...KEYS.map((k) => pct(cov[k] ?? 0, total(cls)) + '%')])));

  const BASE = ['surface', 'tracktype', 'default'];
  const MARK = ['smoothness', 'tracktype', 'surface', '4wd_only'];
  out.push('', '### Deciding tag (% of km)', '');
  out.push(...table(['Class', ...BASE.map((k) => `Base: ${k === 'default' ? 'none' : `\`${k}\``}`), ...MARK.map((k) => `Mark: \`${k}\``)],
    Object.keys(d.base_source_km).map((cls) =>
      [className(cls), ...BASE.map((k) => pct(d.base_source_km[cls][k] ?? 0, total(cls)) + '%'), ...MARK.map((k) => pct(d.mark_source_km[cls][k] ?? 0, total(cls)) + '%')])));

  out.push('', '### Deciding values for Unpaved and the Off-road mark (km, top 3)', '');
  out.push(...table(['Class', 'Unpaved', 'Off-road mark'],
    Object.entries<Record<string, Record<string, number>>>(d.value_km).map(([cls, v]) => {
      const mark = { ...v.offroad, ...v.specialized };
      return [className(cls), top(v.unpaved, 3) || 'none', top(Object.fromEntries(Object.entries(mark).sort((a, b) => b[1] - a[1])), 3) || 'none'];
    }), '---'));

  for (const [v, k] of Object.entries<number>(d.unknown_value_km)) (unknown[v] ??= {})[d.name || d.country] = k;
  out.push('', `### Unknown values (typos, local values): ${top(d.unknown_value_km, 12) || 'none'}`);
  out.push('', `### Conflicts (km): ${top(d.conflict_km, 8) || 'none'}`);
  const titles: Record<string, string> = {
    major_unpaved: 'Longest Unpaved motorway, trunk, primary, secondary',
    offroad_mark: 'Longest ways with the Off-road mark',
    conflict: 'Longest conflicts (paved surface overruled by unpaved evidence, tracktype ignored on a paved surface, smoothness excellent or good on unpaved)',
    unknown_value: 'Longest ways with unknown values',
  };
  for (const [k, list] of Object.entries<any[]>(d.odd)) {
    out.push('', `### ${titles[k]}`, '');
    if (!list.length) out.push('None of 0.5 km or more.');
    for (const n of list.slice(0, 10)) {
      out.push(`- [${n.id}](https://www.openstreetmap.org/way/${n.id.slice(1)}) ${n.highway}, ${n.km} km, **${n.level}**: ${tagList(n.tags)}`);
    }
  }
  out.push('');
}
overview.sort((a, b) => (isNaN(b.sort) ? -1 : b.sort) - (isNaN(a.sort) ? -1 : a.sort));
out.splice(2, 0, '## Overview', '',
  'Unpaved share per class (with or without the Off-road mark), as **all km / tagged km only**, sorted by tertiary. The first number counts untagged roads as paved, so it is a minimum; the second divides by tagged km only, an upper bound because mappers tag surface more often when a road is not paved. Off-road mark and Untagged: share of all road km.', '',
  ...table(['Country', 'Data', 'Trunk', 'Primary', 'Secondary', 'Tertiary', 'Unclassified', 'Off-road mark', 'Untagged', 'km'], overview.map((o) => o.row)), '');
// Official figures: CIA World Factbook roadways (stats/official/factbook.py).
const officialFile = new URL('./official/factbook-roadways.json', import.meta.url);
const official = existsSync(officialFile) ? JSON.parse(readFileSync(officialFile, 'utf8')) : null;
const comparison = official ? results.filter((d) => official.countries[d.country]?.paved_km && official.countries[d.country]?.total_km).map((d) => {
  const o = official.countries[d.country];
  const off = 100 * (1 - o.paved_km / o.total_km);
  const min = unpavedShare(d.km.all), max = unpavedTaggedShare(d.km.all);
  return { name: d.name, year: o.year ?? '', off, min, max, within: off >= min - 0.5 && off <= max + 0.5, km: sum(d.km.all), offKm: o.total_km };
}).sort((a, b) => b.off - a.off) : [];
if (comparison.length) {
  const i = out.indexOf('', out.indexOf('## Overview') + 4 + overview.length);
  out.splice(i + 1, 0, '## Official figures', '',
    `CIA World Factbook, last snapshot with road data (${official.snapshot_date}, [stats/official/factbook-roadways.json](official/factbook-roadways.json)); survey years vary from country to country. OSM: all seven road classes (no tracks, no service roads), all km / tagged km only. Definitions differ (Factbook "unpaved" usually includes tracks and rural roads that OSM may map as \`highway=track\`), so compare orders of magnitude, not exact values.`, '',
    ...table(['Country', 'Official unpaved', 'Year', 'OSM unpaved (all / tagged)', 'Official inside OSM range', 'OSM km / official km'],
      comparison.map((c) => [c.name, c.off.toFixed(0) + '%', c.year, `${c.min.toFixed(0)}% / ${isNaN(c.max) ? '-' : c.max.toFixed(0) + '%'}`, c.within ? 'yes' : c.off > c.max ? 'higher' : 'lower', (c.km / c.offKm).toFixed(2)])), '');
}
console.log(out.join('\n'));
writeFileSync(new URL('./summary.csv', import.meta.url), csv.join('\n') + '\n');

const MIN_UNKNOWN_KM = 1;
const unknownRows = Object.entries(unknown)
  .map(([v, byCountry]) => ({ v, byCountry, km: sum(byCountry) }))
  .filter((r) => r.km >= MIN_UNKNOWN_KM)
  .sort((a, b) => b.km - a.km)
  .map((r) => [code(r.v), Math.round(r.km).toLocaleString('en'),
    Object.entries(r.byCountry).sort((a, b) => b[1] - a[1]).map(([c, k]) => `${c} ${Math.round(k)}`).join(', ')]);
writeFileSync(new URL('./unknown-values.md', import.meta.url), [
  '# Unknown tag values', '',
  'Generated by `stats/report.ts`. Values the classifier does not know, on road classes, 1 km or more in total.',
  'Unknown `surface` values count as Unpaved; unknown `smoothness`, `tracktype` and `4wd_only` values are ignored.',
  'Kept as found for now: no whitelist change, no retagging (decided 2026-11-02).', '',
  ...table(['Value', 'km', 'Countries (km)'], unknownRows, '---'), '',
].join('\n'));

// Key numbers: one generated list of the figures to quote in the wiki page and posts, so they never drift apart.
const countries = results.filter((d) => d.country !== 'aq');
const agg = (cls: string, key: string) => countries.reduce((a, d) => a + (d.km[cls][key] ?? 0), 0);
const totalOf = (cls: string) => countries.reduce((a, d) => a + sum(d.km[cls]), 0);
const allKm = totalOf('all');
const unpavedAll = agg('all', 'unpaved') + agg('all', 'offroad') + agg('all', 'specialized');
const markAll = agg('all', 'offroad') + agg('all', 'specialized');
const values: Record<string, number> = {};
for (const d of countries) for (const [k, v] of Object.entries<number>(d.value_km.all.unpaved)) values[k] = (values[k] ?? 0) + v;
const valuesTotal = sum(values);
const share = (v: number) => ((100 * v) / valuesTotal).toFixed(1) + '%';
const byShare = (cls: string, n: number) => countries.map((d) => ({ name: d.name, v: unpavedShare(d.km[cls]) })).filter((x) => !isNaN(x.v))
  .sort((a, b) => b.v - a.v).slice(0, n).map((x) => `${x.name} ${x.v.toFixed(0)}%`).join(', ');
const mainKm = countries.map((d) => ({ name: d.name, v: ['trunk', 'primary', 'secondary'].reduce((a, c) => a + unpavedKm(d.km[c]), 0) }))
  .sort((a, b) => b.v - a.v).slice(0, 6).map((x) => `${x.name} ${Math.round(x.v).toLocaleString('en')} km`).join(', ');
const tertiaryOverHalf = countries.filter((d) => unpavedShare(d.km.tertiary) > 50).length;
const motorwayUnpaved = agg('motorway', 'unpaved') + agg('motorway', 'offroad') + agg('motorway', 'specialized');
const reviewFile = new URL('../examples/images/review-summary.json', import.meta.url);
const review = existsSync(reviewFile) ? JSON.parse(readFileSync(reviewFile, 'utf8')) : null;
const within = comparison.filter((c) => c.within).length, higher = comparison.filter((c) => !c.within && c.off > c.max).length;
const key = [
  '# Key numbers', '',
  `Generated by \`stats/report.ts\` from ${countries.length} countries (Antarctica excluded), ${new Date().toISOString().slice(0, 10)}. Quote figures from here so the wiki page and posts stay consistent. Road classes: motorway, trunk, primary, secondary, tertiary, unclassified, residential (no tracks, no service roads, no links).`, '',
  '## Data', '',
  `- Road length: ${(allKm / 1e6).toFixed(1)} million km.`,
  `- Untagged (no \`surface\`, no known \`tracktype\`, assumed paved): ${pct(agg('all', 'untagged'), allKm)}% of km.`,
  `- Unpaved: ${pct(unpavedAll, allKm)}% of all km (minimum), ${(100 * unpavedAll / (allKm - agg('all', 'untagged'))).toFixed(1)}% of tagged km (upper bound).`,
  `- Off-road mark: ${pct(markAll, allKm)}% of all km, ${(100 * markAll / unpavedAll).toFixed(1)}% of Unpaved km (${Math.round(markAll).toLocaleString('en')} km).`,
  `- Off-road evidence (\`smoothness\`, \`tracktype\` or \`4wd_only\`) on ${(100 * mark.total.evidence / mark.total.unpaved).toFixed(1)}% of Unpaved km: the mark can only be decided there, so it stays optional (per country: [mark-coverage.md](mark-coverage.md)).`,
  `- \`surface=unpaved\` is ${share(values['surface=unpaved'] ?? 0)} of Unpaved km; then \`ground\` ${share(values['surface=ground'] ?? 0)}, \`gravel\` ${share(values['surface=gravel'] ?? 0)}, \`dirt\` ${share(values['surface=dirt'] ?? 0)}, \`compacted\` ${share(values['surface=compacted'] ?? 0)}.`,
  `- Motorways: ${Math.round(motorwayUnpaved)} km Unpaved out of ${Math.round(totalOf('motorway')).toLocaleString('en')} km.`,
  '', '## Main roads', '',
  `- Highest Unpaved share of trunk: ${byShare('trunk', 5)}.`,
  `- Highest Unpaved share of primary: ${byShare('primary', 6)}.`,
  `- Highest Unpaved share of secondary: ${byShare('secondary', 6)}.`,
  `- Tertiary more than half Unpaved in ${tertiaryOverHalf} of ${countries.length} countries; highest: ${byShare('tertiary', 6)}.`,
  `- Most Unpaved km on trunk, primary and secondary: ${mainKm}.`,
  '', '## Official figures (CIA World Factbook)', '',
  comparison.length ? `- ${comparison.length} countries compared: official unpaved share inside the OSM range (all km to tagged km) in ${within}, higher than the OSM upper bound in ${higher}, lower in ${comparison.length - within - higher}. OSM shares are conservative.` : '- not available',
];
if (review) key.push('', '## Street-level imagery', '',
  `- ${review.roads_reviewed} roads tagged unpaved checked on street-level imagery: ${review.unpaved_confirmed} confirmed Unpaved, ${review.paved_now} paved now (${(100 * review.paved_now / review.roads_reviewed).toFixed(0)}%), ${review.mixed} mixed.`,
  `- Of the ${review.paved_now} paved now: ${review.paved_after_tagging} were paved after the unpaved tag was set, ${review.tagged_unpaved_after_paving} were tagged unpaved after imagery already showed pavement.`,
  `- Untagged roads, Malaysia pilot: ${review.malaysia_untagged_visible_paved} of ${review.malaysia_untagged_visible} visible were paved, but only ${review.malaysia_untagged_with_imagery} of ${review.malaysia_untagged_tried} random untagged ways had imagery.`);
writeFileSync(new URL('./key-numbers.md', import.meta.url), key.join('\n') + '\n');
