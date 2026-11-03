// Markdown report and summary CSV from stats/results/*.json.
// Usage: node stats/report.ts > stats/report.md (also writes stats/summary.csv and stats/unknown-values.md)
// Two levels, Paved and Unpaved, plus the Off-road mark on Unpaved roads. Specialized is folded into the
// Off-road mark (near zero on road classes); raw km stay in the JSON.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

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
const csv: string[] = [['country', 'name', 'data_date', 'class', 'km', ...BUCKETS.map((b) => `km_${b}`), ...BUCKETS.map((b) => `pct_${b}`)].join(',')];

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

const out: string[] = ['# Road drivability statistics', ''];
const overview: { row: string[]; sort: number }[] = [];
const OVERVIEW_CLASSES = ['trunk', 'primary', 'secondary', 'tertiary', 'unclassified'];
// Unpaved share of a class (with or without the mark), or NaN when the class has no km.
const unpavedShare = (v: Record<string, number>) => {
  const t = sum(v);
  return t ? (100 * (v.unpaved + v.offroad + v.specialized)) / t : NaN;
};
// Unknown values across countries: value -> country -> km.
const unknown: Record<string, Record<string, number>> = {};
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
  const d = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
  const r = d.run;
  out.push(`## ${d.name || d.country.toUpperCase()} (${d.country}), data ${d.data_date}`, '');
  out.push(`Run ${r.generated_at.slice(0, 10)}, classifier \`${r.classifier_sha256}\`, pipeline \`${r.pipeline_sha256}\`, ${r.osmium}, extract \`${r.source_pbf}\`, data date from ${r.data_date_source}.`, '');

  const up = OVERVIEW_CLASSES.map((c) => unpavedShare(d.km[c]));
  const all = sum(d.km.all);
  overview.push({
    sort: up[OVERVIEW_CLASSES.indexOf('tertiary')],
    row: [d.name || d.country, d.data_date, ...up.map((v) => (isNaN(v) ? '-' : v.toFixed(0) + '%')),
      pct(d.km.all.offroad + d.km.all.specialized, all) + '%', pct(d.km.all.untagged, all) + '%', Math.round(all).toLocaleString('en')],
  });
  const kmRows = Object.entries<Record<string, number>>(d.km).map(([cls, raw]) => {
    const v = columns(raw);
    const t = sum(raw);
    csv.push([d.country, d.name, d.data_date, cls, t.toFixed(1), ...BUCKETS.map((b) => v[b].toFixed(1)), ...BUCKETS.map((b) => pct(v[b], t))].join(','));
    return [className(cls), Math.round(t).toLocaleString('en'), ...BUCKETS.map((b) => pct(v[b], t) + '%')];
  });
  out.push(...table(['Class', 'km', ...HEAD], kmRows));
  out.push('', 'Untagged: no `surface` and no known `tracktype`, so the road is assumed paved. Paved (tagged) + Untagged + Unpaved = 100%. The Off-road mark is the part of Unpaved with off-road evidence (`smoothness`, `tracktype`, `4wd_only`).');

  const total = (cls: string) => sum(d.km[cls]);
  out.push('', '### Tag coverage (% of km with the tag, any value)', '');
  out.push(...table(['Class', ...KEYS.map((k) => `\`${k}\``)],
    Object.entries<Record<string, number>>(d.coverage_km).map(([cls, cov]) => [className(cls), ...KEYS.map((k) => pct(cov[k] ?? 0, total(cls)) + '%')])));

  const BASE = ['surface', 'tracktype', 'default'];
  const MARK = ['smoothness', 'tracktype', '4wd_only'];
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
    conflict: 'Longest conflicts (off-road evidence on paved roads, smoothness excellent or good on unpaved)',
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
  'Share of km that is Unpaved per class (with or without the Off-road mark), sorted by tertiary. Off-road mark and Untagged: share of all road km.', '',
  ...table(['Country', 'Data', 'Trunk', 'Primary', 'Secondary', 'Tertiary', 'Unclassified', 'Off-road mark', 'Untagged', 'km'], overview.map((o) => o.row)), '');
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
