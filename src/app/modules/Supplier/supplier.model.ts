import { Schema, model } from 'mongoose';
import { ISupplier } from './supplier.interface';

const supplierSchema = new Schema<ISupplier>(
  {
    supplierCode: {
      type: String,
      required: [true, 'Supplier code is required'],
      unique: true,
      trim: true,
    },
    supplierName: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    contactPerson: { type: String, trim: true },
    phone: { type: String, trim: true },
    creditLimit: { type: Number, default: 0, min: 0 },
    address: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { transform: (doc, ret) => { delete (ret as any).__v; return ret; } },
  },
);

supplierSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

supplierSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export const Supplier = model<ISupplier>('Supplier', supplierSchema);
