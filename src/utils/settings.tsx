import { readTextFile, writeTextFile, exists, BaseDirectory } from '@tauri-apps/plugin-fs';

export interface MiraPosition {
  id: string;
  name: string;
  position: number;   // мм, 0..90, 1 знак после запятой
}

export interface AppSettings {
  positions: MiraPosition[];
}

const SETTINGS_FILE = 'settings.json';

const DEFAULT_SETTINGS: AppSettings = {
  positions: [
    { id: '1', name: 'НУЛЕВОЕ ПОЛОЖЕНИЕ', position: 0 },
    { id: '2', name: 'MODE 2', position: 50 },
    { id: '3', name: 'MODE 3', position: 90 },
  ],
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const fileExists = await exists(SETTINGS_FILE, { baseDir: BaseDirectory.AppConfig });
    if (!fileExists) {
      await saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    const content = await readTextFile(SETTINGS_FILE, { baseDir: BaseDirectory.AppConfig });
    return JSON.parse(content) as AppSettings;
  } catch (e) {
    console.error('[settings] load failed:', e);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await writeTextFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), {
      baseDir: BaseDirectory.AppConfig,
    });
  } catch (e) {
    console.error('[settings] save failed:', e);
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}