import { useCallback, useEffect, useRef, useState } from 'react';

export default function TitleBar() {
  const [maximized, setMaximized] = useState(false);
  const checkRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!window.platformAPI) return;
    window.platformAPI.isMaximized().then(setMaximized);
    checkRef.current = setInterval(() => {
      window.platformAPI?.isMaximized().then(setMaximized);
    }, 800);
    return () => { if (checkRef.current) clearInterval(checkRef.current); };
  }, []);

  const handleMinimize = useCallback(() => {
    window.platformAPI?.minimizeWindow();
  }, []);

  const handleToggleMaximize = useCallback(() => {
    window.platformAPI?.toggleMaximize();
  }, []);

  const handleClose = useCallback(() => {
    window.platformAPI?.closeWindow();
  }, []);

  const handleDoubleClick = useCallback(() => {
    window.platformAPI?.toggleMaximize();
  }, []);

  if (!window.platformAPI) return null;

  return (
    <div className="titlebar" onDoubleClick={handleDoubleClick}>
      <span className="titlebar-label">游戏平台</span>
      <div className="titlebar-actions">
        <button className="titlebar-btn" onClick={handleMinimize} title="最小化">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="1" y1="5.5" x2="9" y2="5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
        <button className="titlebar-btn" onClick={handleToggleMaximize} title={maximized ? '还原' : '最大化'}>
          {maximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="0.5" y="2.5" width="7" height="7" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <line x1="2.5" y1="0.5" x2="9.5" y2="0.5" stroke="currentColor" strokeWidth="1.2" />
              <line x1="9.5" y1="0.5" x2="9.5" y2="2.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="1" y="1" width="8" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          )}
        </button>
        <button className="titlebar-btn titlebar-btn-close" onClick={handleClose} title="关闭">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
