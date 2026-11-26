(() => {
  const $ = id => document.getElementById(id);
  const code = sessionStorage.getItem('cs_admin_code');
  if (!code) { location.replace('index.html'); return; }
  function send(payload) {
    return new Promise((resolve,reject) => {
      const url = window.CS_CONFIG?.SCRIPT_URL || '';
      if (!url || url.includes('PASTE_YOUR_')) return reject(new Error('config.js ගොනුවේ Apps Script URL එක සකස් කරන්න.'));
      const nonce = 'cs_' + Date.now() + '_' + Math.random().toString(36).slice(2), name = 'cs_admin_frame_' + nonce;
      const iframe = document.createElement('iframe'); iframe.name=name; iframe.hidden=true;
      const form=document.createElement('form'); form.method='POST'; form.action=url; form.target=name; form.hidden=true;
      Object.entries({...payload,nonce}).forEach(([k,v])=>{const i=document.createElement('input');i.name=k;i.value=String(v??'');form.appendChild(i)});
      const clean=()=>{removeEventListener('message',listener);iframe.remove();form.remove()};
      const timer=setTimeout(()=>{clean();reject(new Error('Server response timeout.'))},18000);
      const listener=e=>{if(e.data?.source!=='CS_SECURE_LOGIN'||e.data?.nonce!==nonce)return;clearTimeout(timer);clean();e.data.ok?resolve(e.data):reject(new Error(e.data.error||'Request failed'))};
      addEventListener('message',listener);document.body.append(iframe,form);form.submit();
    });
  }
  function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  async function load(){
    $('refreshBtn').disabled=true;$('adminStatus').textContent='Loading…';
    try{
      const result=await send({action:'get_logs',admin_code:code}); const rows=result.logs||[];
      $('totalCount').textContent=rows.length;
      $('adminCount').textContent=rows.filter(r=>String(r[3]).toLowerCase().includes('admin')).length;
      $('userCount').textContent=rows.filter(r=>!String(r[3]).toLowerCase().includes('admin')).length;
      $('logRows').innerHTML=rows.length?rows.slice().reverse().map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td><td><span class="status-pill ${String(r[4]).toLowerCase().includes('failed')?'bad':''}">${esc(r[4])}</span></td></tr>`).join(''):'<tr><td colspan="5" class="empty">No records yet.</td></tr>';
      $('updatedAt').textContent='Updated: '+new Date().toLocaleString();$('adminStatus').textContent='';
    }catch(e){$('adminStatus').textContent=e.message;$('logRows').innerHTML='<tr><td colspan="5" class="empty">Could not load records.</td></tr>'}
    finally{$('refreshBtn').disabled=false}
  }
  $('refreshBtn').addEventListener('click',load);load();
})();
