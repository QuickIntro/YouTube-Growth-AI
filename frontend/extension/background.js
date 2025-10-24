// background.js (MV3)
// Listens for messages from content script and performs cross-origin fetches to the backend if needed.

chrome.runtime.onInstalled.addListener(() => {
  // Set some sane defaults
  chrome.storage.sync.get(['BACKEND_URL'], (res) => {
    if (!res.BACKEND_URL) {
      chrome.storage.sync.set({ BACKEND_URL: 'http://localhost:4000' });
    }
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === 'GAI_FETCH') {
    (async () => {
      try {
        const { url, method = 'GET', headers = {}, body } = msg.payload || {};
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json', ...headers },
          body: body ? JSON.stringify(body) : undefined,
        });
        const text = await res.text();
        sendResponse({ ok: res.ok, status: res.status, data: text });
      } catch (e) {
        sendResponse({ ok: false, status: 0, error: String(e) });
      }
    })();
    return true; // keep channel open for async response
  }
});
