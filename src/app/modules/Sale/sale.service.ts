import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { Sale } from './sale.model';
import { ISale } from './sale.interface';
import { Product } from '../Product/product.model';
import AppError from '../../errors/AppError';
import { generateAutoNumber } from '../../utils/generateId';
import QueryBuilder from '../../utils/QueryBuilder';

const saleSearchableFields = ['billNo', 'paymentMode', 'createdBy'];

// Create a new sale
const createSale = async (payload: ISale, userId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Generate bill number
    const billNo = await generateAutoNumber(Sale, 'billNo', 8500);
    payload.billNo = billNo;
    payload.createdBy = userId;
    payload.isReturn = false;

    // Deduct stock for each item
    for (const item of payload.items) {
      const product = await Product.findOne({ productCode: item.code }).session(session);
      if (product) {
        if (product.quantity < item.quantity) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            `Insufficient stock for ${item.productName}. Available: ${product.quantity}`,
          );
        }
        product.quantity -= item.quantity;
        await product.save({ session });
      }
    }

    const [result] = await Sale.create([payload], { session });

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Get all sales
const getAllSales = async (query: Record<string, unknown>) => {
  // Handle type (SALE or RETURN)
  if (query.type === 'RETURN') {
    query.isReturn = true;
  } else {
    // If not explicitly RETURN, treat as SALE (which has isReturn false or undefined)
    query.isReturn = { $ne: true };
  }
  delete query.type;

  const saleQuery = new QueryBuilder(
    Sale.find().populate('customer'),
    query
  )
    .search(saleSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await saleQuery.modelQuery;
  const meta = await saleQuery.countTotal();

  return {
    meta,
    data: result,
  };
};


// Get single sale by bill number
const getSaleByBillNo = async (billNo: number) => {
  const sale = await Sale.findOne({ billNo }).populate('customer');
  if (!sale) {
    throw new AppError(httpStatus.NOT_FOUND, 'Sale not found');
  }
  return sale;
};

// Create sales return
const createSalesReturn = async (payload: ISale, userId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const billNo = await generateAutoNumber(Sale, 'billNo', 8500);
    payload.billNo = billNo;
    payload.createdBy = userId;
    payload.isReturn = true;

    // Restore stock for returned items
    for (const item of payload.items) {
      const product = await Product.findOne({ productCode: item.code }).session(session);
      if (product) {
        product.quantity += item.quantity;
        await product.save({ session });
      }
    }

    const [result] = await Sale.create([payload], { session });

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const SaleService = { createSale, getAllSales, getSaleByBillNo, createSalesReturn };
