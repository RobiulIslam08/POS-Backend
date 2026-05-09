import httpStatus from 'http-status';
import { SupplierCredit, CustomerCredit } from './credit.model';
import { ISupplierCredit, ICustomerCredit } from './credit.interface';
import AppError from '../../errors/AppError';
import QueryBuilder from '../../utils/QueryBuilder';

// Supplier Credit
const recordSupplierPayment = async (payload: ISupplierCredit, userId: string, userRole: string) => {
  payload.createdBy = userId;
  payload.remaining = payload.dueAmount - payload.paidAmount;
  payload.status = (userRole === 'admin' || userRole === 'manager') ? 'Settled' : 'Pending Approval';

  if (payload.paidAmount > payload.dueAmount) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Paid amount cannot exceed due amount');
  }

  return await SupplierCredit.create(payload);
};

const settleSupplierInvoice = async (id: string) => {
  const credit = await SupplierCredit.findById(id);
  if (!credit) throw new AppError(httpStatus.NOT_FOUND, 'Supplier credit not found');
  credit.status = 'Settled';
  await credit.save();
  return credit;
};

const getSupplierCredits = async (query: Record<string, unknown>) => {
  const creditQuery = new QueryBuilder(SupplierCredit.find(), query)
    .search(['supplier', 'invoiceNo']).filter().sort().paginate();
  const result = await creditQuery.modelQuery;
  const meta = await creditQuery.countTotal();
  return { meta, data: result };
};

// Customer Credit
const receiveCustomerPayment = async (payload: ICustomerCredit, userId: string) => {
  payload.createdBy = userId;
  payload.remaining = payload.dueAmount - payload.receivedAmount;
  return await CustomerCredit.create(payload);
};

const getCustomerCredits = async (query: Record<string, unknown>) => {
  const creditQuery = new QueryBuilder(CustomerCredit.find(), query)
    .search(['customer', 'billNo']).filter().sort().paginate();
  const result = await creditQuery.modelQuery;
  const meta = await creditQuery.countTotal();
  return { meta, data: result };
};

export const CreditService = {
  recordSupplierPayment, settleSupplierInvoice, getSupplierCredits,
  receiveCustomerPayment, getCustomerCredits,
};
