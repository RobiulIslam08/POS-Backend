import { Settings } from './settings.model';
import { ISettings } from './settings.interface';

// Get settings (upsert singleton)
const getSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

// Update settings
const updateSettings = async (payload: Partial<ISettings>) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(payload);
  } else {
    Object.assign(settings, payload);
    await settings.save();
  }
  return settings;
};

export const SettingsService = { getSettings, updateSettings };
