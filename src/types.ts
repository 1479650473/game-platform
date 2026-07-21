export interface GameEntry {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  icon: string;
  iconData?: string;
  enabled: boolean;
  path?: string;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  entry?: string;
}

export interface GameRegistryAction {
  type: 'set' | 'add' | 'remove';
  payload?: GameEntry | GameEntry[] | string;
}
