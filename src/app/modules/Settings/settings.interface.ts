export interface ISettings {
  storeName: string;
  currency: string;
  currencySymbol: string;
  vatPercent: number;
  defaultLanguage: 'en' | 'ar';
  defaultPaymentMode: string;
  dateLocale: string;
  timeLocale: string;
  receiptHeader?: string;
  receiptFooter?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
