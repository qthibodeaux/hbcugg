# Backend Notes — 2026-10-21

**Re:** the SWAC D-line report (`999-frontendfeedback/10 21/swac_dline/`). It's built as four posters under Team Analytics > Charts > Deep Dive, drawn from `dline_report_2026_w7.json`.

### 1. Deondri Clark: split the ID
The MVSU player Deondri Clark (#92, Gr., Lakeland FL) and the MVSU assistant head coach and D-line coach of the same name are most likely father and son. Either way they are two people. Please split `PERS_00001090` into a player ID and a staff ID.

### 2. Names in the file
`team_names` and every `name` field use "J-State", "B-CU" and "Bama State". The posters print the teams.json `shortName` (JSU, BCU, ASU), so nothing is broken. Future deep-dive files should still use shortName, the same as the rest of the site.

### 3. `newcomers`: previous school
- Christ Kore (MVSU) has no `previous_school` (the report shows "—"). Is he a freshman, or is the value missing?
- Thad Parson's previous school is "Indy Cc / Point University". The posters print the last school ("Point University"). Send a single school name if that isn't right.

### 4. Garbled apostrophe in the report file
In `dline_report_2026_w7.json`, the `departed_players` name for UAPB's K'aun Green prints as "Kâ€™aun Green": UTF-8 text that was encoded twice. The people file has it right ("K’aun Green"). Please write the report file as UTF-8 once.

### 5. Asks for the next deep dive
- **Years in the program.** Each player's season count at his current school, so "players who've been in the system" (3rd- and 4th-year guys) can be told apart from 2nd-year returners. Today the file only has `newcomer` true/false.
- **Freshmen.** A `true_freshman` flag, or the full list of first-year players with any production. The top-40 leaders list has two "Fr." linemen, and one of them (Hookfin) is a Portland State transfer, so we can't tell whether freshmen aren't playing or just aren't in the list.
- **Height.** `size` has listed weight by season and team, but no height. Add the average listed D-line height (inches) by season and by team, next to the weight.
- **`is_transfer`.** It's `true` for newcomers with no `previous_school` (Kore, Clark, Wynn, North). Is that right?
