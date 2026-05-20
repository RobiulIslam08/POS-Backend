import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { Product } from '../Product/product.model';
import { StockReturn, StockCorrection } from './stock.model';
import { IStockReturn, IStockCorrection } from './stock.interface';
import AppError from '../../errors/AppError';
import QueryBuilder from '../../utils/QueryBuilder';



// Get all stock (products with stock info)
const getStock = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 50;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter: Record<string, unknown> = { isDeleted: { $ne: true } };

  // Keyword search
  if (query.searchTerm) {
    const regex = new RegExp(query.searchTerm as string, 'i');
    filter.$or = [
      { productName: regex },
      { productCode: regex },
      { storage: regex },
    ] as any;
  }

  // Map warehouse -> storage filter
  if (query.warehouse) {
    filter.storage = query.warehouse;
  }

  // Date range filter on updatedAt
  if (query.fromDate || query.toDate) {
    const dateFilter: Record<string, unknown> = {};
    if (query.fromDate) dateFilter['$gte'] = new Date(query.fromDate as string);
    if (query.toDate) dateFilter['$lte'] = new Date(query.toDate as string);
    if (Object.keys(dateFilter).length > 0) filter.updatedAt = dateFilter;
  }

  const projection = 'productCode productName arabicName batchCode quantity storage minQty expiryDate updatedAt';

  const [result, total] = await Promise.all([
    Product.find(filter as any, projection).sort('-createdAt').skip(skip).limit(limit),
    Product.countDocuments(filter as any),
  ]);

  const meta = { page, limit, total, totalPage: Math.ceil(total / limit) };
  return { meta, data: result };
};

// Process stock return
const processReturn = async (payload: IStockReturn, userId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    payload.createdBy = userId;

    // Add stock back
    const product = await Product.findOne({ productCode: payload.productCode }).session(session);
    if (product) {
      product.quantity += payload.returnQty;
      await product.save({ session });
    }

    const [result] = await StockReturn.create([payload], { session });

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Process stock correction
const processCorrection = async (payload: IStockCorrection, userId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    payload.createdBy = userId;

    // Update stock for each correction item
    for (const item of payload.items) {
      const product = await Product.findOne({ productCode: item.code }).session(session);
      if (product) {
        product.quantity = item.quantity; // Set to corrected quantity
        // Also update batch and expiry from the correction item if provided
        if (item.batchCode) product.batchCode = item.batchCode;
        if (item.expiryDate) product.expiryDate = new Date(item.expiryDate as unknown as string);
        await product.save({ session });
      }
    }

    const [result] = await StockCorrection.create([payload], { session });

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Get stock returns
const getStockReturns = async (query: Record<string, unknown>) => {
  const returnQuery = new QueryBuilder(StockReturn.find(), query)
    .search(['productName', 'productCode']).filter().sort().paginate();
  const result = await returnQuery.modelQuery;
  const meta = await returnQuery.countTotal();
  return { meta, data: result };
};

export const StockService = { getStock, processReturn, processCorrection, getStockReturns };
