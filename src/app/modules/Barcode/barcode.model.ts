import { Schema, model } from 'mongoose';
import { IBarcodeJob } from './barcode.interface';

const barcodeJobSchema = new Schema<IBarcodeJob>(
  {
    productCode: { type: String, required: true, trim: true },
    barcodeValue: { type: String, trim: true },
    labelCount: { type: Number, required: true, min: 1, max: 80 },
    paperSize: { type: String, required: true, trim: true },
    printType: { type: String, required: true, trim: true },
    printer: { type: String, required: true, trim: true },
    generatedBy: { type: String, required: true },
  },
  { timestamps: true, toJSON: { transform: (doc, ret) => { delete (ret as any).__v; return ret; } } },
);

export const BarcodeJob = model<IBarcodeJob>('BarcodeJob', barcodeJobSchema);
