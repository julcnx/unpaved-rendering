// Reader test: receives the answers from reader-test/index.html and adds one row per person to this sheet.
// Setup: README.md, "Collecting answers". Paste this into Extensions > Apps Script of an empty Google Sheet.
const PLACES = ['bolivia', 'nepal', 'alberta', 'namibia', 'australia'];
const HEAD = ['received', 'id', 'version', 'mapper', 'travel', 'screen', 'viewport',
  ...PLACES.flatMap((p) => [`${p} style`, `${p} answers`, `${p} order`, `${p} ms`]),
  'strips', 'best', 'worst', 'why', 'clarity ms', 'raw'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const r = JSON.parse(e.postData.contents);
    if (r.trap) return ContentService.createTextOutput('ok'); // filled by a bot, not a person
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEAD);
    // Answers per place, in road order: U unpaved, P paved, ? not sure. A leading ' keeps the sheet from reading them as numbers.
    const byPlace = PLACES.flatMap((p) => {
      const i = r.maps.findIndex((m) => m.place === p), m = r.maps[i];
      return m ? [m.style, `'${m.answers}`, i + 1, m.ms] : ['', '', '', ''];
    });
    sheet.appendRow([new Date(), r.id, r.version, r.mapper, r.travel ?? '', r.screen, r.viewport, ...byPlace,
      r.strips, r.best, r.worst, String(r.why ?? '').slice(0, 600), r.clarityMs, JSON.stringify(r).slice(0, 5000)]);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}
