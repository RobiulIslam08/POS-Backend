import { Schema, model } from 'mongoose';
import { IPurchase, IPurchaseItem } from './purchase.interface';

const purchaseItemSchema = new Schema<IPurchaseItem>(
  {
    barcode: { type: String, trim: true },
    itemName: { type: String, required: true, trim: true },
    batch: { type: String, trim: true },
    expiryDate: { type: Date },
    totalQty: { type: Number, required: true, min: 0 },
    free: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    discountAmt: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    purchasePrice: { type: Number, required: true, min: 0 },
    netAmount: { type: Number, required: true },
  },
  { _id: false },
);

const purchaseSchema = new Schema<IPurchase>(
  {
    invoiceNo: { type: String, required: true, unique: true, trim: true },
    invoiceDate: { type: Date, required: true },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    purchaseOrderNo: { type: String, trim: true },
    items: {
      type: [purchaseItemSchema],
      required: true,
      validate: { validator: (v: IPurchaseItem[]) => v.length > 0, message: 'At least one item is required' },
    },
    netAmount: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    vat: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    paymentMethod: { type: String, enum: ['readyCash', 'creditCard'], default: 'readyCash' },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { transform: (doc, ret) => { delete (ret as any).__v; return ret; } },
  },
);

export const Purchase = model<IPurchase>('Purchase', purchaseSchema);
