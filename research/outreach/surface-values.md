# Draft: undocumented paved `surface` values (not sent)

Status: forum reply posted by Julien on 2026-11-12 as post 10, https://community.openstreetmap.org/t/proposed-bot-edit-automatic-replacement-of-surface-values-where-it-is-safe/105361/10. Nepal topic posted by Julien on 2026-11-12, https://community.openstreetmap.org/t/surface-values-ottaseal-and-blacktopped-in-nepal/150053. Wiki and OSM not edited. Order: forum reply first, Nepal cross-post, then the wiki lines once the thread agrees, then the edits.

Counts are worldwide, all objects, from taginfo (data until 2026-11-12). Km are main roads only, from [../stats/unknown-values.md](../stats/unknown-values.md).

| Value                                 | Objects | Km (main roads)                         | Proposed                                      |
| ------------------------------------- | ------- | --------------------------------------- | --------------------------------------------- |
| `dbst`                                | 25      | 132 (Cambodia)                          | `chipseal`                                    |
| `DBST`                                | 3       | 9 (Cambodia)                            | `chipseal`                                    |
| `dbst_pavement`                       | 4       | 15 (Cambodia)                           | `chipseal`                                    |
| `double_bitumenous_surface_treatment` | 1       | 7 (Cambodia)                            | `chipseal`                                    |
| `ottaseal`                            | 16      | 63 (Nepal)                              | `chipseal`                                    |
| `Blacktopped`                         | 85      | 36 (Nepal)                              | `asphalt`                                     |
| `blacktop`                            | 4       | 1 (Nepal)                               | `asphalt`                                     |
| `tarmac`                              | 318     | 26 (Malaysia, Sri Lanka, Uganda, Kenya) | `asphalt`                                     |
| `dbst_and_concreate`                  | 1       | 14 (Cambodia)                           | by hand: split into `chipseal` and `concrete` |
| `dbst_and_gravek`                     | 1       | 1 (Cambodia)                            | by hand: split into `chipseal` and `gravel`   |

## 1. Forum reply

Where: reply in "Proposed bot edit: automatic replacement of surface values where it is safe" (Mateusz_Konieczny, 2023, General talk), https://community.openstreetmap.org/t/proposed-bot-edit-automatic-replacement-of-surface-values-where-it-is-safe/105361. It has been quiet since 2023-11-04, but it is the thread about exactly this, and it already maps `bitumen` to `asphalt`.

Paste as is (Discourse markdown).

[quote="Mateusz_Konieczny, post:1, topic:105361"]
Only low use obvious mistakes would be changed.
[/quote]

While checking surface tags on main roads in about 50 countries, I found a few paved values that are not documented, so most maps and routers treat them as unknown (often as unpaved). They are low use, but are they obvious enough for this list, or should they be fixed by hand with the local communities?

- `surface = dbst`, `surface = DBST`, `surface = dbst_pavement`, `surface = double_bitumenous_surface_treatment` to `surface = chipseal` (33 ways, Cambodia). Double Bituminous Surface Treatment is a two-layer chip seal.
- `surface = ottaseal` to `surface = chipseal` (16 ways, Nepal). Otta seal is a sprayed bitumen seal laid with graded natural gravel instead of single-size chips.
- `surface = Blacktopped`, `surface = blacktop` to `surface = asphalt` (89 ways, mostly Nepal). The local word for any bitumen-surfaced road, asphalt concrete or surface dressing.
- `surface = tarmac` to `surface = asphalt` (318 objects, worldwide), like `bitumen` in the list above.

Two Cambodian ways (`dbst_and_concreate`, `dbst_and_gravek`) mix two surfaces: I would split those by hand, not by bot.

Questions:

1. Is `chipseal` right for DBST and Otta seal, or is `asphalt` the safer target, given that most chip seal roads are tagged `asphalt` anyway?
2. Is `Blacktopped` to `asphalt` safe enough for a bot, or should someone in Nepal check first?
3. Should the wiki list these as possible mistakes (`{{PossibleSynonym2}}` on the chipseal and asphalt pages), so mappers and validators find them?

I can do the edits by hand if a bot run is not planned.

## 2. Nepal cross-post

Where: Communities, Nepal, https://community.openstreetmap.org/c/communities/np/151. Post after the reply above, linking to it.

Paste as is. Discourse turns a link alone on its line into a preview card of the reply.

```markdown
Hello! Some roads in Nepal use `surface=ottaseal` (16 ways) and `surface=Blacktopped` (85). These values are not documented on the wiki, so many maps and routers do not recognise them as paved. I suggested `surface=chipseal` for Otta seal and `surface=asphalt` for blacktopped roads here:

https://community.openstreetmap.org/t/proposed-bot-edit-automatic-replacement-of-surface-values-where-it-is-safe/105361/10

Do local mappers agree, or do you prefer another value? You know these roads best, so if you agree, it would be great if you could retag them yourselves. Taginfo lists them: https://taginfo.openstreetmap.org/tags/surface=ottaseal and https://taginfo.openstreetmap.org/tags/surface=Blacktopped
```

## 3. Wiki lines

After the forum agrees. Same template and placement as the existing `asphaltq` line on Tag:surface=asphalt (after "See also").

Tag:surface=chipseal:

```
{{PossibleSynonym2|surface|dbst|Double Bituminous Surface Treatment, a two-layer chip seal (Cambodia)}}
{{PossibleSynonym2|surface|DBST|see dbst}}
{{PossibleSynonym2|surface|dbst_pavement|see dbst}}
{{PossibleSynonym2|surface|double_bitumenous_surface_treatment|see dbst}}
{{PossibleSynonym2|surface|ottaseal|Otta seal, a sprayed bitumen seal with graded gravel (Nepal)}}
```

Tag:surface=asphalt:

```
{{PossibleSynonym2|surface|tarmac|common word for a sealed road; use chipseal if it is a chip seal}}
{{PossibleSynonym2|surface|Blacktopped|local word for a bitumen-surfaced road (Nepal); use chipseal if it is a surface dressing}}
{{PossibleSynonym2|surface|blacktop|see Blacktopped}}
```

Optional, one sentence in the prose of Tag:surface=chipseal: "Also known as bituminous surface treatment (BST, or DBST when double) and surface dressing."
