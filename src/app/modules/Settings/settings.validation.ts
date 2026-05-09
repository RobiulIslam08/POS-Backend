import { z } from 'zod';

const updateSettingsValidationSchema = z.object({
  body: z.object({
    storeName: z.string().trim().optional(),
    currency: z.string().trim().optional(),
    currencySymbol: z.string().trim().optional(),
    vatPercent: z.number().min(0).max(100).optional(),
    defaultLanguage: z.enum(['en', 'ar']).optional(),
    defaultPaymentMode: z.string().trim().optional(),
    dateLocale: z.string().trim().optional(),
    timeLocale: z.string().trim().optional(),
    receiptHeader: z.string().trim().optional(),
    receiptFooter: z.string().trim().optional(),
  }),
});

export const SettingsValidation = { updateSettingsValidationSchema };
