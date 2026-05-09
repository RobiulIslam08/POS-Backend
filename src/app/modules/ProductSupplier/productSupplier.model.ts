import { Schema, model } from 'mongoose';
import { IProductSupplier } from './productSupplier.interface';

const productSupplierSchema = new Schema<IProductSupplier>(
  {
    productCode: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    supplierName: { type: String, required: true, trim: true },
    purchasePrice: { type: Number, min: 0 },
    sellingPrice: { type: Number, min: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true, toJSON: { transform: (doc, ret) => { delete (ret as any).__v; return ret; } } },
);

// Compound index to prevent duplicates
productSupplierSchema.index({ productCode: 1, supplierName: 1 }, { unique: true });

export const ProductSupplier = model<IProductSupplier>('ProductSupplier', productSupplierSchema);
