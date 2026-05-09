import { Schema, model } from 'mongoose';
import { ICashAdjustment } from './cashAdjustment.interface';

const cashAdjustmentSchema = new Schema<ICashAdjustment>(
  {
    adjustmentNo: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ['In', 'Out'], required: true },
    amount: { type: Number, required: true, min: 0 },
    account: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    remarks: { type: String, trim: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true, toJSON: { transform: (doc, ret) => { delete (ret as any).__v; return ret; } } },
);

export const CashAdjustment = model<ICashAdjustment>('CashAdjustment', cashAdjustmentSchema);
