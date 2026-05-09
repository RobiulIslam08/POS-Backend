import { Schema, model } from 'mongoose';
import { IStockReturn, IStockCorrection, IStockCorrectionItem } from './stock.interface';

const stockReturnSchema = new Schema<IStockReturn>(
  {
    invoiceNo: { type: String, trim: true },
    productCode: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    returnQty: { type: Number, required: true, min: 1 },
    reason: { type: String, enum: ['Expired', 'Damaged'], required: true },
    remarks: { type: String, trim: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true, toJSON: { transform: (doc, ret) => { delete (ret as any).__v; return ret; } } },
);

const stockCorrectionItemSchema = new Schema<IStockCorrectionItem>(
  {
    code: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    batchCode: { type: String, trim: true },
    expiryDate: { type: Date },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false },
);

const stockCorrectionSchema = new Schema<IStockCorrection>(
  {
    items: { type: [stockCorrectionItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true, toJSON: { transform: (doc, ret) => { delete (ret as any).__v; return ret; } } },
);

export const StockReturn = model<IStockReturn>('StockReturn', stockReturnSchema);
export const StockCorrection = model<IStockCorrection>('StockCorrection', stockCorrectionSchema);
