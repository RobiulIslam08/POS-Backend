import { Schema, model } from 'mongoose';
import { ISettings } from './settings.interface';

const settingsSchema = new Schema<ISettings>(
  {
    storeName: { type: String, default: 'POS Store', trim: true },
    currency: { type: String, default: 'SAR', trim: true },
    currencySymbol: { type: String, default: 'ر.س', trim: true },
    vatPercent: { type: Number, default: 15 },
    defaultLanguage: { type: String, enum: ['en', 'ar'], default: 'en' },
    defaultPaymentMode: { type: String, default: 'CREDIT CARD' },
    dateLocale: { type: String, default: 'en-SA', trim: true },
    timeLocale: { type: String, default: 'en-SA', trim: true },
    receiptHeader: { type: String, trim: true },
    receiptFooter: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: { transform: (doc, ret) => { delete (ret as any).__v; return ret; } },
  },
);

export const Settings = model<ISettings>('Settings', settingsSchema);
