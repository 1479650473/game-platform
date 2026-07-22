const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (_event, action) => callback(action));
  },
  getVersion: () => ipcRenderer.invoke('get-game-version'),
});

contextBridge.exposeInMainWorld('gamePlatformAPI', {
  closeGame: () => ipcRenderer.invoke('close-game'),
});

function injectTitleBar() {
  if (window.__gpTitleBarInjected) return;
  window.__gpTitleBarInjected = true;

  const bar = document.createElement('div');
  bar.className = 'gp-titlebar';
  bar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;height:32px;padding:0 10px;background:#09090d;-webkit-app-region:drag;user-select:none;flex-shrink:0;position:fixed;top:0;left:0;right:0;z-index:99999;';

  const label = document.createElement('span');
  label.textContent = document.title || '';
  label.style.cssText = "font-family:'Outfit',sans-serif;font-size:0.73rem;font-weight:500;color:#52525b;letter-spacing:0.03em;padding-left:4px;";

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:0;-webkit-app-region:no-drag;';

  const closeBtn = document.createElement('button');
  closeBtn.title = '关闭';
  closeBtn.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 10"><line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
  closeBtn.style.cssText = 'display:flex;align-items:center;justify-content:center;width:36px;height:24px;border:none;border-radius:4px;background:transparent;color:#52525b;cursor:pointer;transition:background 0.15s,color 0.15s;';
  closeBtn.addEventListener('mouseenter', () => { closeBtn.style.background = '#ef4444'; closeBtn.style.color = '#fff'; });
  closeBtn.addEventListener('mouseleave', () => { closeBtn.style.background = 'transparent'; closeBtn.style.color = '#52525b'; });
  closeBtn.addEventListener('click', () => { ipcRenderer.invoke('close-game'); });

  actions.appendChild(closeBtn);
  bar.appendChild(label);
  bar.appendChild(actions);

  const patch = () => {
    const root = document.getElementById('root') || document.body;
    root.style.paddingTop = '32px';
    root.style.height = 'calc(100vh - 32px)';
    root.style.overflow = root.style.overflow || 'auto';
    if (!document.querySelector('.gp-titlebar')) {
      document.body.insertBefore(bar, document.body.firstChild);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patch);
  } else {
    patch();
  }
}

injectTitleBar();
