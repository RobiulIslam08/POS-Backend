export interface ISettings {
  storeName: string;
  vatNumber: string;
  invoicePrefix: string;
  defaultPayment: string;
  timezone: string;
  supportContact: string;
  lowStockAlert: number;
  allowNegativeStock: 'yes' | 'no';
  currency: string;
  currencySymbol: string;
  vatPercent: number;
  defaultLanguage: 'en' | 'ar';
  dateLocale: string;
  timeLocale: string;
  receiptHeader?: string;
  receiptFooter?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
