import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { Product } from '../Product/product.model';
import { StockReturn, StockCorrection } from './stock.model';
import { IStockReturn, IStockCorrection } from './stock.interface';
import AppError from '../../errors/AppError';
import QueryBuilder from '../../utils/QueryBuilder';

const stockSearchableFields = ['productName', 'productCode', 'storage'];

// Get all stock (products with stock info)
const getStock = async (query: Record<string, unknown>) => {
  const queryObj = { ...query };

  // Map warehouse to storage
  if (queryObj.warehouse) {
    queryObj.storage = queryObj.warehouse;
    delete queryObj.warehouse;
  }

  // Map date filters to updatedAt
  if (queryObj.fromDate || queryObj.toDate) {
    const dateFilter: Record<string, unknown> = {};
    if (queryObj.fromDate) {
      dateFilter['$gte'] = new Date(queryObj.fromDate as string);
      delete queryObj.fromDate;
    }
    if (queryObj.toDate) {
      dateFilter['$lte'] = new Date(queryObj.toDate as string);
      delete queryObj.toDate;
    }
    if (Object.keys(dateFilter).length > 0) {
      queryObj.updatedAt = dateFilter;
    }
  }

  const stockQuery = new QueryBuilder(
    Product.find({}, 'productCode productName quantity storage minQty updatedAt'),
    queryObj,
  )
    .search(stockSearchableFields)
    .filter()
    .sort()
    .paginate();

  const result = await stockQuery.modelQuery;
  const meta = await stockQuery.countTotal();
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
