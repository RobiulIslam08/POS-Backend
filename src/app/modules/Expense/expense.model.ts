import { Schema, model } from 'mongoose';
import { IExpense } from './expense.interface';

const expenseSchema = new Schema<IExpense>(
  {
    voucherNo: { type: String, required: true, unique: true, trim: true },
    expenseDate: { type: Date, required: true },
    category: { type: String, required: true, trim: true },
    paidTo: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    vat: { type: Number, default: 15 },
    netAmount: { type: Number, required: true },
    paymentMode: { type: String, default: 'Cash', trim: true },
    remarks: { type: String, trim: true },
    status: { type: String, enum: ['Pending', 'Approved'], default: 'Pending' },
    approvedBy: { type: String },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { transform: (doc, ret) => { delete (ret as any).__v; return ret; } },
  },
);

export const Expense = model<IExpense>('Expense', expenseSchema);
