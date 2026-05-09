import { Schema, model } from 'mongoose';
import { ICustomer } from './customer.interface';

const customerSchema = new Schema<ICustomer>(
  {
    customerCode: { type: String, required: true, unique: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    mobile: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    creditLimit: { type: Number, default: 0, min: 0 },
    address: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { transform: (doc, ret) => { delete (ret as any).__v; return ret; } },
  },
);

customerSchema.pre('find', function (next) { this.find({ isDeleted: { $ne: true } }); next(); });
customerSchema.pre('findOne', function (next) { this.find({ isDeleted: { $ne: true } }); next(); });

export const Customer = model<ICustomer>('Customer', customerSchema);
