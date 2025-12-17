
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');

export interface SystemSettings {
  exchangeRate: number;
}

const DEFAULT_SETTINGS: SystemSettings = {
  exchangeRate: 120.0, // Default ETB/USD
};

export async function getSettings(): Promise<SystemSettings> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(updated, null, 2));
  return updated;
}
