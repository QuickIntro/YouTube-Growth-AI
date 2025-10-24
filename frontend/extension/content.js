// content.js
// Injects a floating panel on YouTube/YouTube Studio pages with buttons to call your backend AI endpoints.

(function () {
  if (window.__growthAIInjected) return;
  window.__growthAIInjected = true;

  const root = document.createElement('div');
  root.id = 'growth-ai-panel-root';
  document.documentElement.appendChild(root);

  const style = document.createElement('style');
  style.textContent = `
    #growth-ai-panel-root { position: fixed; bottom: 16px; right: 16px; z-index: 2147483647; }
    .gai-card { background: #0f172a; color: #e2e8f0; border: 1px solid #334155; border-radius: 12px; width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,.4); overflow: hidden; font-family: Inter, ui-sans-serif, system-ui, -apple-system; }
    .gai-hd { display:flex; align-items:center; justify-content:space-between; padding: 10px 12px; border-bottom: 1px solid #334155; }
    .gai-hd strong { font-weight: 600; }
    .gai-bd { padding: 12px; }
    .gai-row { display:flex; gap:8px; margin-top:8px; }
    .gai-input, .gai-textarea { width:100%; background:#0b1220; color:#e2e8f0; border:1px solid #334155; border-radius:8px; padding:8px; }
    .gai-btn { background:#7c3aed; color:white; border:none; border-radius:8px; padding:8px 10px; cursor:pointer; font-weight:600; }
    .gai-btn:disabled { opacity:.6; cursor:not-allowed; }
    .gai-muted { font-size:12px; color:#94a3b8; margin-top:6px; }
  `;
  document.head.appendChild(style);

  root.innerHTML = `
    <div class="gai-card">
      <div class="gai-hd">
        <strong>Growth AI</strong>
        <button id="gai-close" class="gai-btn" style="background:#334155">×</button>
      </div>
      <div class="gai-bd">
        <input id="gai-title" class="gai-input" placeholder="Current title" />
        <textarea id="gai-desc" class="gai-textarea" rows="3" placeholder="Description (optional)"></textarea>
        <div class="gai-row">
          <input id="gai-keywords" class="gai-input" placeholder="keywords,comma,separated" />
          <select id="gai-lang" class="gai-input" style="max-width:92px">
            <option value="en">EN</option>
            <option value="bn">BN</option>
          </select>
        </div>
        <div class="gai-row">
          <button id="gai-generate" class="gai-btn">Generate titles</button>
          <button id="gai-tags" class="gai-btn" style="background:#10b981">Tags</button>
        </div>
        <div id="gai-output" class="gai-muted"></div>
        <div class="gai-muted">Backend: <code id="gai-backend">(auto)</code></div>
      </div>
    </div>
  `;

  const el = {
    close: root.querySelector('#gai-close'),
    title: root.querySelector('#gai-title'),
    desc: root.querySelector('#gai-desc'),
    keywords: root.querySelector('#gai-keywords'),
    lang: root.querySelector('#gai-lang'),
    generate: root.querySelector('#gai-generate'),
    tags: root.querySelector('#gai-tags'),
    out: root.querySelector('#gai-output'),
    backend: root.querySelector('#gai-backend'),
  };

  el.close.addEventListener('click', () => root.remove());

  // Load backend URL from storage
  chrome.storage.sync.get(['BACKEND_URL', 'TOKEN'], (res) => {
    el.backend.textContent = res.BACKEND_URL || 'http://localhost:4000';
  });

  async function callBackend(path, body) {
    const conf = await new Promise((resolve) => chrome.storage.sync.get(['BACKEND_URL', 'TOKEN'], resolve));
    const url = `${(conf.BACKEND_URL || 'http://localhost:4000').replace(/\/$/,'')}${path}`;
    const headers = {};
    if (conf.TOKEN) headers['Authorization'] = `Bearer ${conf.TOKEN}`;
    return await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GAI_FETCH', payload: { url, method: 'POST', headers, body } }, resolve);
    });
  }

  function parseKeywords(s){ return s ? s.split(',').map(t=>t.trim()).filter(Boolean) : []; }

  el.generate.addEventListener('click', async () => {
    el.generate.disabled = true; el.out.textContent = 'Generating...';
    const payload = {
      currentTitle: el.title.value || '',
      description: el.desc.value || '',
      keywords: parseKeywords(el.keywords.value),
      language: el.lang.value || 'en',
    };
    const res = await callBackend('/api/ai/generate-titles', payload);
    if (res?.ok) {
      try {
        const json = JSON.parse(res.data);
        el.out.textContent = (json.titles || []).join('\n');
      } catch { el.out.textContent = res.data; }
    } else {
      el.out.textContent = `Error ${res?.status}: ${res?.error || res?.data}`;
    }
    el.generate.disabled = false;
  });

  el.tags.addEventListener('click', async () => {
    el.tags.disabled = true; el.out.textContent = 'Generating tags...';
    const payload = {
      title: el.title.value || '',
      description: el.desc.value || '',
      language: el.lang.value || 'en',
    };
    const res = await callBackend('/api/ai/generate-tags', payload);
    if (res?.ok) {
      try {
        const json = JSON.parse(res.data);
        el.out.textContent = (json.tags || []).join(', ');
      } catch { el.out.textContent = res.data; }
    } else {
      el.out.textContent = `Error ${res?.status}: ${res?.error || res?.data}`;
    }
    el.tags.disabled = false;
  });
})();
