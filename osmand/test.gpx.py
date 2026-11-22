#!/usr/bin/env python3
"""Writes test.gpx for render-test.sh: views, zooms and settings to check."""
from pathlib import Path
V = {'cr': (20.0259, 99.678, 'Thailand_asia_2'), 'th1': (7.83617, 98.31665, 'Thailand_asia_2'), 'th3': (20.33948, 99.74487, 'Thailand_asia_2'),
     'namutoni': (-18.8067, 16.94, 'Namibia_africa_2'), 'lux': (49.611, 6.13, 'Luxembourg_europe_2')}
rows = [(v, z, '') for v in V for z in (12, 13, 14, 15)] + [('cr', 15, f'overlandHardFrom={s}') for s in ('bad', 'very_bad', 'very_horrible')] + \
       [('th1', 15, f'overlandHardFrom={s}') for s in ('bad', 'very_bad', 'very_horrible')] + [('cr', 15, 'nightMode=true'), ('th1', 15, 'overlandPower=true'), ('th1', 17, '')]
w = ''
for v, z, p in rows:
    la, lo, m = V[v]
    n = f'{v}-z{z}' + ('-' + p.split('=')[-1] if p.startswith('overlandHard') else '-night' if 'night' in p else '-power' if p else '')
    w += f'<wpt lat="{la}" lon="{lo}"><name>{n}</name><extensions><maps>{m}</maps><zoom>{z}</zoom><width>900</width><height>600</height><renderingName>overland</renderingName>' + (f'<renderingProperties>{p}</renderingProperties>' if p else '') + '</extensions></wpt>'
Path(__file__).with_name('test.gpx').write_text('<?xml version="1.0"?><gpx version="1.1" creator="overland" xmlns="http://www.topografix.com/GPX/1/1">' + w + '</gpx>\n')
