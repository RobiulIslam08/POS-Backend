import { Schema, model } from 'mongoose';
import { IProductLink } from './productLink.interface';

const productLinkSchema = new Schema<IProductLink>(
  {
    boxProductCode: { type: String, required: true, trim: true },
    boxProductName: { type: String, required: true, trim: true },
    singleProductCode: { type: String, required: true, trim: true },
    singleProductName: { type: String, required: true, trim: true },
    conversionQty: { type: Number, required: true, min: 1 },
    remark: { type: String, trim: true },
  },
  { timestamps: true, toJSON: { transform: (doc, ret) => { delete (ret as any).__v; return ret; } } },
);

productLinkSchema.index({ boxProductCode: 1, singleProductCode: 1 }, { unique: true });

export const ProductLink = model<IProductLink>('ProductLink', productLinkSchema);
