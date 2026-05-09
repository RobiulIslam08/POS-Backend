import { Schema, model } from 'mongoose';
import { ISupplierCredit, ICustomerCredit } from './credit.interface';

const supplierCreditSchema = new Schema<ISupplierCredit>(
  {
    supplier: { type: String, required: true, trim: true },
    invoiceNo: { type: String, required: true, trim: true },
    dueAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, required: true, min: 0 },
    remaining: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'Bank Transfer'], default: 'Cash' },
    reference: { type: String, trim: true },
    remarks: { type: String, trim: true },
    status: { type: String, enum: ['Pending Approval', 'Settled'], default: 'Pending Approval' },
    createdBy: { type: String, required: true },
  },
  { timestamps: true, toJSON: { transform: (doc, ret) => { delete (ret as any).__v; return ret; } } },
);

const customerCreditSchema = new Schema<ICustomerCredit>(
  {
    customer: { type: String, required: true, trim: true },
    billNo: { type: String, required: true, trim: true },
    dueAmount: { type: Number, required: true, min: 0 },
    receivedAmount: { type: Number, required: true, min: 0 },
    remaining: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    remarks: { type: String, trim: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true, toJSON: { transform: (doc, ret) => { delete (ret as any).__v; return ret; } } },
);

export const SupplierCredit = model<ISupplierCredit>('SupplierCredit', supplierCreditSchema);
export const CustomerCredit = model<ICustomerCredit>('CustomerCredit', customerCreditSchema);
