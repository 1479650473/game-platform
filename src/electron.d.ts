export {};

declare global {
  interface Window {
    platformAPI?: {
      getGames: () => Promise<import('./types').GameEntry[]>;
      openGame: (gameId: string) => Promise<{ success: boolean; error?: string }>;
      addGame: () => Promise<{ success: boolean; error?: string; games?: import('./types').GameEntry[] }>;
      removeGame: (gameId: string) => Promise<{ success: boolean; error?: string; games?: import('./types').GameEntry[] }>;
      getGamesPath: () => Promise<string>;
    };
  }
}
