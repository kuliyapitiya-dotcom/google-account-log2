/** CS Secure Login - Google Apps Script backend (no Firebase). */
const SHEET_NAME = 'Login Logs';

function doPost(e) {
  const p = (e && e.parameter) ? e.parameter : {};
  const nonce = String(p.nonce || '');
  try {
    const action = String(p.action || '');
    let result;
    if (action === 'record_user') {
      appendLog_(p.username, p.fullname, 'USER', 'RECORDED');
      result = { ok: true };
    } else if (action === 'admin_login') {
      const valid = secureEquals_(String(p.admin_code || ''), getAdminCode_()) &&
        String(p.username || '').toLowerCase() === 'devil' &&
        String(p.fullname || '').toLowerCase() === 'sandun ayantha';
      appendLog_(p.username, p.fullname, 'ADMIN', valid ? 'ADMIN LOGIN SUCCESS' : 'ADMIN LOGIN FAILED');
      if (!valid) throw new Error('Admin code එක වැරදියි.');
      result = { ok: true };
    } else if (action === 'get_logs') {
      if (!secureEquals_(String(p.admin_code || ''), getAdminCode_())) throw new Error('Admin verification failed.');
      result = { ok: true, logs: getLogs_() };
    } else {
      throw new Error('Unknown action.');
    }
    return response_(Object.assign({ nonce: nonce }, result));
  } catch (err) {
    return response_({ ok: false, nonce: nonce, error: String(err.message || err) });
  }
}

function response_(data) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput('<!doctype html><html><body><script>parent.postMessage(' + json + ', "*");</script></body></html>');
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('මෙම Apps Script එක Google Sheet එකෙන් Extensions > Apps Script හරහා සාදන්න.');
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(['Date & Time', 'Username', 'Full Name', 'Type', 'Status']);
  return sheet;
}
function appendLog_(username, fullname, type, status) {
  getSheet_().appendRow([new Date(), String(username || '').slice(0, 60), String(fullname || '').slice(0, 100), type, status]);
}
function getLogs_() {
  const sheet = getSheet_();
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getDisplayValues();
}
function getAdminCode_() {
  const code = PropertiesService.getScriptProperties().getProperty('ADMIN_CODE');
  if (!code) throw new Error('ADMIN_CODE එක Script Properties තුළ සකස් කර නැහැ.');
  return code;
}
function secureEquals_(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
