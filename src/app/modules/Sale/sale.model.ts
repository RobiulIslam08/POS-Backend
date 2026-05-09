import { Schema, model } from 'mongoose';
import { ISale, ISaleItem } from './sale.interface';

const saleItemSchema = new Schema<ISaleItem>(
  {
    code: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    batchCode: { type: String, trim: true },
    expiryDate: { type: Date },
    type: { type: String, enum: ['SINGLE', 'BOX'], default: 'SINGLE' },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    vat: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { _id: false },
);

const saleSchema = new Schema<ISale>(
  {
    billNo: {
      type: Number,
      required: true,
      unique: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
    items: {
      type: [saleItemSchema],
      required: true,
      validate: {
        validator: (val: ISaleItem[]) => val.length > 0,
        message: 'At least one item is required',
      },
    },
    totalAmount: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    vatPercent: { type: Number, default: 15 },
    netAmount: { type: Number, required: true, default: 0 },
    amountPaid: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    paymentMode: {
      type: String,
      enum: ['CASH', 'CREDIT CARD'],
      default: 'CREDIT CARD',
    },
    createdBy: { type: String, required: true },
    isReturn: { type: Boolean, default: false },
    returnReference: { type: Number },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  },
);

export const Sale = model<ISale>('Sale', saleSchema);
