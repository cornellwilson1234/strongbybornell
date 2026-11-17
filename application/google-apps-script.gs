/**
 * Strong Program applications -> Google Sheet + email alert.
 * Paste this whole file into Extensions > Apps Script in your Google Sheet.
 * Setup steps: application/SETUP.md
 */

// ===== EDIT THESE =====
var NOTIFY_EMAIL = '';          // your email for new-application alerts (leave '' to use the sheet owner's)
var SHEET_NAME   = 'Applications';
// ======================

var COLUMNS = [
  ['Received',          function (p) { return new Date(); }],
  ['Status',            function (p) { return 'New'; }],
  ['Score',             function (p) { return score(p); }],
  ['Name',              'name'],
  ['Instagram',         'instagram'],
  ['Email',             'email'],
  ['Phone',             'phone'],
  ['1. Goal',           'goal'],
  ['2. Why now',        'why'],
  ['3. Tried before',   'tried'],
  ['4. In 6 months',    'sixmonths'],
  ['5. Ready to invest','ready'],
  ['6. Price',          'price'],
  ['7. Can commit',     'commit'],
  ['Age',               'age'],
  ['Height',            'height'],
  ['Weight',            'weight'],
  ['9. Equipment',      'equipment'],
  ['10. Experience',    'experience'],
  ['11. Injuries / pain','injuries'],
  ['12. Medical / meds','medical'],
  ['13. Doctor cleared','doctor'],
  ['18+',               'adult'],
  ['Source',            'source'],
  ['Price shown',       'priceShown'],
  ['Coach notes',       function (p) { return ''; }]
];

// Hot = said yes to investing, price works, can commit.
function score(p) {
  var pts = 0;
  if (p.ready === 'Yes') pts++;
  if (p.price === 'Works for me') pts++;
  if (p.commit === 'Yes') pts++;
  if (p.ready === 'No' || p.price === "Doesn't work") return 'Cold';
  return pts === 3 ? 'Hot' : (pts === 2 ? 'Warm' : 'Cold');
}

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.website) return ok();                 // spam honeypot
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = getSheet();
    var row = COLUMNS.map(function (c) {
      var v = typeof c[1] === 'function' ? c[1](p) : (p[c[1]] || '');
      // stop formulas being injected through answers
      if (typeof v === 'string' && /^[=+\-@]/.test(v)) v = "'" + v;
      return v;
    });
    sh.appendRow(row);
    notify(p, row[2]);
  } finally {
    lock.releaseLock();
  }
  return ok();
}

function doGet() { return ContentService.createTextOutput('Strong application endpoint is running.'); }
function ok() { return ContentService.createTextOutput('ok'); }

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) setupSheet(sh);
  return sh;
}

// Run this once from the editor (select setupSheet, press Run) to build headers, dropdowns and colors.
function setupSheet(sh) {
  sh = sh || SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) ||
       SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
  var heads = COLUMNS.map(function (c) { return c[0]; });
  sh.getRange(1, 1, 1, heads.length).setValues([heads])
    .setFontWeight('bold').setBackground('#121212').setFontColor('#D2AC55').setWrap(true);
  sh.setFrozenRows(1);
  sh.setFrozenColumns(4);
  sh.getRange('A:A').setNumberFormat('mmm d, yyyy h:mm am/pm');
  sh.getRange(2, 1, 999, heads.length).setWrap(true).setVerticalAlignment('top');
  [140, 110, 70, 150, 130, 190, 120].forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
  for (var c = 8; c <= heads.length; c++) sh.setColumnWidth(c, 180);

  var status = SpreadsheetApp.newDataValidation()
    .requireValueInList(['New', 'DM sent', 'Call booked', 'Accepted', 'Waitlist', 'Not a fit'], true).build();
  sh.getRange(2, 2, 999, 1).setDataValidation(status);

  var rules = [
    ['Hot', '#D9EAD3'], ['Warm', '#FFF2CC'], ['Cold', '#F4CCCC']
  ].map(function (r) {
    return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(r[0])
      .setBackground(r[1]).setRanges([sh.getRange(2, 3, 999, 1)]).build();
  });
  rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Accepted')
    .setBackground('#D2AC55').setRanges([sh.getRange(2, 2, 999, 1)]).build());
  sh.setConditionalFormatRules(rules);
}

function notify(p, scoreVal) {
  var to = NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
  if (!to) return;
  var lines = [
    'Score: ' + scoreVal,
    'Name: ' + (p.name || ''),
    'Instagram: ' + (p.instagram || ''),
    'Email: ' + (p.email || ''),
    'Phone: ' + (p.phone || ''),
    '',
    'Goal: ' + (p.goal || ''),
    'Why now: ' + (p.why || ''),
    'Ready to invest: ' + (p.ready || ''),
    'Price: ' + (p.price || ''),
    'Can commit: ' + (p.commit || ''),
    'Age/height/weight: ' + [p.age, p.height, p.weight].join(' / '),
    'Equipment: ' + (p.equipment || ''),
    'Doctor cleared: ' + (p.doctor || ''),
    '',
    'Full application: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  ];
  MailApp.sendEmail(to, '[' + scoreVal + '] New Strong application: ' + (p.name || 'Unknown'), lines.join('\n'));
}
