export {};

interface UpdateStatus {
  state: 'idle' | 'checking' | 'available' | 'uptodate' | 'downloading' | 'downloaded' | 'error';
  info?: { version: string; releaseDate: string; releaseNotes?: string } | null;
  progress?: { percent: number; bytesPerSecond: number; transferred: number; total: number } | null;
  error?: string | null;
}

interface GameUpdateInfo {
  gameId: string;
  name: string;
  currentVersion: string;
  latestVersion: string;
  changelog?: string;
}

declare global {
  interface Window {
    platformAPI?: {
      getGames: () => Promise<import('./types').GameEntry[]>;
      openGame: (gameId: string) => Promise<{ success: boolean; error?: string }>;
      addGame: () => Promise<{ success: boolean; error?: string; games?: import('./types').GameEntry[] }>;
      removeGame: (gameId: string) => Promise<{ success: boolean; error?: string; games?: import('./types').GameEntry[] }>;
      getGamesPath: () => Promise<string>;
      checkForUpdates: () => Promise<UpdateStatus>;
      downloadUpdate: () => Promise<void>;
      installUpdate: () => Promise<void>;
      getUpdateStatus: () => Promise<UpdateStatus>;
      onUpdateStatusChanged: (callback: (status: UpdateStatus) => void) => () => void;
      checkGameUpdates: () => Promise<{ updates: GameUpdateInfo[]; registryUrl: string }>;
      updateGame: (gameId: string) => Promise<{ success: boolean; error?: string }>;
      onGameUpdateProgress: (callback: (data: { gameId: string; phase: string; progress?: number; error?: string }) => void) => () => void;
      minimizeWindow: () => Promise<void>;
      toggleMaximize: () => Promise<void>;
      closeWindow: () => Promise<void>;
      isMaximized: () => Promise<boolean>;
      onMaximizeChange: (callback: () => void) => () => void;
    };
  }
}
