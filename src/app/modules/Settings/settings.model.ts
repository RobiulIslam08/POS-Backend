import { Schema, model } from 'mongoose';
import { ISettings } from './settings.interface';

const settingsSchema = new Schema<ISettings>(
  {
    storeName: { type: String, default: 'My Store', trim: true },
    vatNumber: { type: String, default: '300000000000003', trim: true },
    invoicePrefix: { type: String, default: 'INV', trim: true },
    defaultPayment: { type: String, default: 'Cash' },
    timezone: { type: String, default: 'Asia/Riyadh' },
    supportContact: { type: String, default: '' },
    lowStockAlert: { type: Number, default: 10 },
    allowNegativeStock: { type: String, enum: ['yes', 'no'], default: 'no' },
    currency: { type: String, default: 'SAR', trim: true },
    currencySymbol: { type: String, default: 'ر.س', trim: true },
    vatPercent: { type: Number, default: 15 },
    defaultLanguage: { type: String, enum: ['en', 'ar'], default: 'en' },
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
