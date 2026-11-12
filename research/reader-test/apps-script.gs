// Reader test: receives the answers from reader-test/index.html and keeps one row per person in this sheet.
// Setup: README.md, "Collecting answers". Paste this into Extensions > Apps Script of an empty Google Sheet.
// The page sends what is answered so far when someone leaves early (stage map1 ... map5 or clarity), and everything at
// the end (stage done): the same person's row is updated, never added twice.
const PLACES = ['bolivia', 'nepal', 'alberta', 'namibia', 'australia'];
const HEAD = ['received', 'id', 'stage', 'version', 'screen', 'viewport',
  ...PLACES.flatMap((p) => [`${p} style`, `${p} answers`, `${p} order`, `${p} ms`, `${p} taps`]),
  'strips', 'ranking', 'best', 'worst', 'clarity taps', 'clarity ms', 'raw'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const r = JSON.parse(e.postData.contents);
    if (r.trap || !r.id) return ContentService.createTextOutput('ok'); // filled by a bot, not a person
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEAD);
    // Answers per place, in road order: U tapped as unpaved, P not tapped. Taps in order with seconds: "3U@1.2 3-@2.5".
    // A leading ' keeps the sheet from reading them as numbers or formulas.
    const byPlace = PLACES.flatMap((p) => {
      const i = r.maps.findIndex((m) => m.place === p), m = r.maps[i];
      return m ? [m.style, `'${m.answers}`, i + 1, m.ms, `'${m.taps}`] : ['', '', '', '', ''];
    });
    const row = [new Date(), r.id, r.stage, r.version, r.screen, r.viewport, ...byPlace,
      r.strips ?? '', r.ranking ?? '', r.best ?? '', r.worst ?? '', `'${r.clarityTaps ?? ''}`,
      r.clarityMs ?? '', JSON.stringify(r).slice(0, 20000)];
    const last = sheet.getLastRow();
    const found = last > 1 && sheet.getRange(2, 2, last - 1, 1).createTextFinder(r.id).matchEntireCell(true).findNext();
    if (!found) sheet.appendRow(row);
    else if (sheet.getRange(found.getRow(), 3).getValue() !== 'done') sheet.getRange(found.getRow(), 1, 1, row.length).setValues([row]);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}
