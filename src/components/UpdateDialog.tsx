import { useCallback, useEffect, useState } from 'react';

interface UpdateDialogProps {
  onClose: () => void;
}

interface UpdateStatus {
  state: 'idle' | 'checking' | 'available' | 'uptodate' | 'downloading' | 'downloaded' | 'error';
  info?: { version: string; releaseDate: string; releaseNotes?: string } | null;
  progress?: { percent: number; bytesPerSecond: number } | null;
  error?: string | null;
}

export default function UpdateDialog({ onClose }: UpdateDialogProps) {
  const [status, setStatus] = useState<UpdateStatus>({ state: 'idle' });

  useEffect(() => {
    if (!window.platformAPI) return;
    const unsub = window.platformAPI.onUpdateStatusChanged((newStatus) => {
      setStatus(newStatus);
    });
    window.platformAPI.checkForUpdates();
    return () => { unsub(); };
  }, []);

  const handleAction = useCallback(async () => {
    if (!window.platformAPI) return;
    if (status.state === 'available') {
      await window.platformAPI.downloadUpdate();
    } else if (status.state === 'downloaded') {
      await window.platformAPI.installUpdate();
    } else if (status.state === 'error' || status.state === 'idle') {
      await window.platformAPI.checkForUpdates();
    }
  }, [status.state]);

  const formatBytes = (bytesPerSecond: number | undefined) => {
    if (!bytesPerSecond) return '';
    const mb = bytesPerSecond / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB/s` : `${(bytesPerSecond / 1024).toFixed(0)} KB/s`;
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-box update-dialog">
        <h3>软件更新</h3>

        <div className="update-content">
          {status.state === 'checking' && (
            <div className="update-state">
              <div className="update-spinner" />
              <p>正在检查更新...</p>
            </div>
          )}

          {status.state === 'uptodate' && (
            <div className="update-state">
              <p className="update-success">当前已是最新版本</p>
            </div>
          )}

          {status.state === 'available' && status.info && (
            <div className="update-state">
              <p className="update-available-label">发现新版本</p>
              <p className="update-version">v{status.info.version}</p>
              {status.info.releaseDate && (
                <p className="update-date">发布时间: {new Date(status.info.releaseDate).toLocaleDateString('zh-CN')}</p>
              )}
              {status.info.releaseNotes && (
                <div className="update-notes">
                  <h4>更新内容</h4>
                  <p>{status.info.releaseNotes}</p>
                </div>
              )}
            </div>
          )}

          {status.state === 'downloading' && status.progress && (
            <div className="update-state">
              <p className="update-downloading-label">正在下载...</p>
              <div className="update-progress-bar">
                <div
                  className="update-progress-fill"
                  style={{ width: `${status.progress.percent}%` }}
                />
              </div>
              <p className="update-progress-text">
                {status.progress.percent.toFixed(0)}%
                {formatBytes(status.progress.bytesPerSecond) && (
                  <span className="update-speed"> {formatBytes(status.progress.bytesPerSecond)}</span>
                )}
              </p>
            </div>
          )}

          {status.state === 'downloaded' && (
            <div className="update-state">
              <p className="update-success">下载完成，重启后生效</p>
            </div>
          )}

          {status.state === 'error' && (
            <div className="update-state">
              <p className="update-error">{status.error || '检查更新失败'}</p>
            </div>
          )}
        </div>

        <div className="dialog-actions">
          <button className="dialog-btn dialog-btn-cancel" onClick={onClose}>
            {status.state === 'downloaded' ? '稍后' : '关闭'}
          </button>
          {(status.state === 'available' || status.state === 'downloaded' || status.state === 'error' || status.state === 'idle') && (
            <button className="dialog-btn dialog-btn-add" onClick={handleAction}>
              {status.state === 'available' ? '下载更新' : status.state === 'downloaded' ? '立即重启' : '重新检查'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
