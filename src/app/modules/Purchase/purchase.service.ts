import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { Purchase } from './purchase.model';
import { IPurchase } from './purchase.interface';
import { Product } from '../Product/product.model';
import AppError from '../../errors/AppError';
import QueryBuilder from '../../utils/QueryBuilder';

const searchableFields = ['invoiceNo', 'purchaseOrderNo', 'createdBy'];

// Create purchase (adds stock)
const createPurchase = async (payload: IPurchase, userId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    payload.createdBy = userId;

    // Check duplicate invoice
    const existing = await Purchase.findOne({ invoiceNo: payload.invoiceNo });
    if (existing) {
      throw new AppError(httpStatus.CONFLICT, 'Purchase invoice already exists');
    }

    // Add stock for each item
    for (const item of payload.items) {
      if (item.barcode) {
        const product = await Product.findOne({ productCode: item.barcode }).session(session);
        if (product) {
          product.quantity += item.totalQty + item.free;
          if (item.sellingPrice > 0) {
            product.sellingPrice = item.sellingPrice;
          }
          product.purchasePrice = item.purchasePrice;
          await product.save({ session });
        }
      }
    }

    const [result] = await Purchase.create([payload], { session });

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Get all purchases with filters
const getAllPurchases = async (query: Record<string, unknown>) => {
  const purchaseQuery = new QueryBuilder(Purchase.find(), query)
    .search(searchableFields).filter().sort().paginate().fields();

  const result = await purchaseQuery.modelQuery.populate('supplier');
  const meta = await purchaseQuery.countTotal();
  return { meta, data: result };
};

// Get single purchase
const getPurchaseById = async (id: string) => {
  const purchase = await Purchase.findById(id).populate('supplier');
  if (!purchase) throw new AppError(httpStatus.NOT_FOUND, 'Purchase not found');
  return purchase;
};

export const PurchaseService = { createPurchase, getAllPurchases, getPurchaseById };
