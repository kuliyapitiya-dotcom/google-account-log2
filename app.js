(() => {
  const $ = id => document.getElementById(id);
  const cards = ['loginCard','adminCodeCard','resultCard','failedCard'];
  const show = id => cards.forEach(card => $(card).classList.toggle('hidden', card !== id));
  const endpoint = () => window.CS_CONFIG?.SCRIPT_URL || '';
  $('year').textContent = new Date().getFullYear();
  let currentUser = { username: '', fullname: '' };

  function sendToSheet(payload) {
    return new Promise((resolve, reject) => {
      const url = endpoint();
      if (!url || url.includes('PASTE_YOUR_')) return reject(new Error('Google Apps Script URL එක config.js ගොනුවට දමා නැහැ.'));
      const nonce = 'cs_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      const frameName = 'cs_frame_' + nonce;
      const iframe = document.createElement('iframe'); iframe.name = frameName; iframe.hidden = true;
      const form = document.createElement('form'); form.method = 'POST'; form.action = url; form.target = frameName; form.hidden = true;
      const data = { ...payload, nonce };
      Object.entries(data).forEach(([key,value]) => { const input = document.createElement('input'); input.name = key; input.value = String(value ?? ''); form.appendChild(input); });
      const cleanup = () => { window.removeEventListener('message', onMessage); form.remove(); iframe.remove(); };
      const timer = setTimeout(() => { cleanup(); reject(new Error('Server එකෙන් පිළිතුරක් ලැබුණේ නැහැ. Apps Script URL සහ deployment access පරීක්ෂා කරන්න.')); }, 18000);
      const onMessage = event => {
        if (!event.data || event.data.source !== 'CS_SECURE_LOGIN' || event.data.nonce !== nonce) return;
        clearTimeout(timer); cleanup();
        if (event.data.ok) resolve(event.data); else reject(new Error(event.data.error || 'Request failed'));
      };
      window.addEventListener('message', onMessage); document.body.append(iframe, form); form.submit();
    });
  }

  $('loginForm').addEventListener('submit', async event => {
    event.preventDefault();
    currentUser = { username: $('username').value.trim(), fullname: $('fullname').value.trim() };
    if (!currentUser.username || !currentUser.fullname) return;
    $('continueBtn').disabled = true; $('message').textContent = 'Checking…';
    const isAdmin = currentUser.username.toLowerCase() === 'devil' && currentUser.fullname.toLowerCase() === 'sandun ayantha';
    try {
      if (isAdmin) {
        $('message').textContent = ''; show('adminCodeCard'); $('adminCode').focus();
      } else {
        await sendToSheet({ action: 'record_user', username: currentUser.username, fullname: currentUser.fullname });
        show('resultCard');
      }
    } catch (error) { $('message').textContent = error.message; }
    finally { $('continueBtn').disabled = false; }
  });

  $('adminForm').addEventListener('submit', async event => {
    event.preventDefault(); $('adminBtn').disabled = true; $('adminMessage').textContent = 'Verifying…';
    try {
      await sendToSheet({ action: 'admin_login', username: currentUser.username, fullname: currentUser.fullname, admin_code: $('adminCode').value });
      sessionStorage.setItem('cs_admin_code', $('adminCode').value);
      sessionStorage.setItem('cs_admin_user', JSON.stringify(currentUser));
      location.href = 'admin.html';
    } catch (error) {
      $('adminMessage').textContent = error.message;
      $('failedMessage').textContent = error.message || 'Server verification failed. Please try again.';
      show('failedCard');
    } finally { $('adminBtn').disabled = false; }
  });
  $('backBtn').addEventListener('click', () => { $('adminCode').value = ''; $('message').textContent = ''; show('loginCard'); });
  $('retryBtn').addEventListener('click', () => { $('adminCode').value = ''; $('adminMessage').textContent = ''; show('adminCodeCard'); $('adminCode').focus(); });
})();
