import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameEntry, GameUpdateInfo } from '../types';
import { GameCardGrid } from '../components/GameCard';
import { AddGameDialog } from '../components/AddGameDialog';
import UpdateDialog from '../components/UpdateDialog';

export default function Home() {
  const [games, setGames] = useState<GameEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [gameUpdates, setGameUpdates] = useState<GameUpdateInfo[]>([]);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const updateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadGames = useCallback(async () => {
    try {
      if (window.platformAPI) {
        const gameList = await window.platformAPI.getGames();
        setGames(gameList.filter((g) => g.enabled));
      }
    } catch {
      setError('无法加载游戏列表');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkGameUpdates = useCallback(async () => {
    if (!window.platformAPI) return;
    try {
      const result = await window.platformAPI.checkGameUpdates();
      if (result.updates.length > 0) {
        setGameUpdates(result.updates);
        setUpdateAvailable(true);
      }
    } catch {
      // 静默失败，不影响主要功能
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  useEffect(() => {
    checkGameUpdates();
    updateTimerRef.current = setInterval(checkGameUpdates, 6 * 60 * 60 * 1000);
    return () => {
      if (updateTimerRef.current) clearInterval(updateTimerRef.current);
    };
  }, [checkGameUpdates]);

  const handleUpdateGame = useCallback(async (gameId: string) => {
    if (!window.platformAPI) return;
    const result = await window.platformAPI.updateGame(gameId);
    if (result.success) {
      setGameUpdates((prev) => prev.filter((u) => u.gameId !== gameId));
      if (gameUpdates.length <= 1) setUpdateAvailable(false);
      setDialogMessage('游戏更新成功！');
      setTimeout(() => setDialogMessage(null), 2000);
    } else {
      setDialogMessage(result.error || '更新失败');
      setTimeout(() => setDialogMessage(null), 3000);
    }
  }, [gameUpdates]);

  const handleOpenGame = useCallback(async (gameId: string) => {
    if (window.platformAPI) {
      const result = await window.platformAPI.openGame(gameId);
      if (!result.success) {
        setError(result.error || '无法启动游戏');
      }
    }
  }, []);

  const handleAddGame = useCallback(async () => {
    if (!window.platformAPI) return;
    const result = await window.platformAPI.addGame();
    if (result.success && result.games) {
      setGames(result.games.filter((g) => g.enabled));
      setDialogMessage('游戏添加成功！');
      setTimeout(() => setDialogMessage(null), 2000);
    } else if (result.error && result.error !== '已取消') {
      setDialogMessage(result.error);
      setTimeout(() => setDialogMessage(null), 3000);
    }
  }, []);

  const handleRemoveGame = useCallback(
    (gameId: string) => {
      setDeleteConfirm(gameId);
    },
    []
  );

  const confirmRemove = useCallback(async () => {
    if (!deleteConfirm || !window.platformAPI) return;
    const result = await window.platformAPI.removeGame(deleteConfirm);
    if (result.success && result.games) {
      setGames(result.games.filter((g) => g.enabled));
    }
    setDeleteConfirm(null);
  }, [deleteConfirm]);

  const cancelRemove = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  const gameToDelete = deleteConfirm ? games.find((g) => g.id === deleteConfirm) : null;

  return (
    <div className="home">
      <header className="home-header">
        <h1 className="home-title">游戏平台</h1>
        <p className="home-subtitle">选择一个游戏开始游玩</p>
        <p className="home-credit">develop by csy</p>
        <button
          className="home-update-btn"
          onClick={() => setShowUpdateDialog(true)}
          title="检查更新"
        >
          {updateAvailable ? (
            <span className="home-update-dot" />
          ) : null}
          检查更新
        </button>
      </header>

      {updateAvailable && gameUpdates.length > 0 && (
        <div className="home-update-bar">
          <span>
            {gameUpdates.length} 个游戏有可用更新：
            {gameUpdates.map((u) => u.name).join('、')}
          </span>
          <button
            className="home-update-bar-btn"
            onClick={() => handleUpdateGame(gameUpdates[0].gameId)}
          >
            更新 {gameUpdates[0].name}
          </button>
        </div>
      )}

      {error && (
        <div className="home-error">
          <span>{error}</span>
          <button className="home-error-close" onClick={() => setError(null)}>
            &times;
          </button>
        </div>
      )}

      <div className="home-content">
        {loading ? (
          <div className="home-loading">加载中...</div>
        ) : games.length === 0 ? (
          <div className="home-empty">
            <p>还没有添加游戏</p>
            <button className="home-empty-btn" onClick={() => setShowAddDialog(true)}>
              添加第一款游戏
            </button>
          </div>
        ) : (
          <GameCardGrid
            games={games}
            onPlay={handleOpenGame}
            onDelete={handleRemoveGame}
            onAdd={() => setShowAddDialog(true)}
          />
        )}
      </div>

      {showAddDialog && (
        <AddGameDialog
          onAdd={handleAddGame}
          onClose={() => setShowAddDialog(false)}
        />
      )}

      {dialogMessage && (
        <div className="home-toast">{dialogMessage}</div>
      )}

      {deleteConfirm && gameToDelete && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>确认删除</h3>
            <p>
              确定要删除游戏 <strong>「{gameToDelete.name}」</strong> 吗？
            </p>
            <p className="dialog-warning">此操作不可恢复</p>
            <div className="dialog-actions">
              <button className="dialog-btn dialog-btn-cancel" onClick={cancelRemove}>
                取消
              </button>
              <button className="dialog-btn dialog-btn-delete" onClick={confirmRemove}>
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpdateDialog && (
        <UpdateDialog onClose={() => setShowUpdateDialog(false)} />
      )}
    </div>
  );
}
