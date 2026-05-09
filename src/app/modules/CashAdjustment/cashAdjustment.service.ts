import httpStatus from 'http-status';
import { CashAdjustment } from './cashAdjustment.model';
import { ICashAdjustment } from './cashAdjustment.interface';
import AppError from '../../errors/AppError';
import QueryBuilder from '../../utils/QueryBuilder';

const postAdjustment = async (payload: ICashAdjustment, userId: string) => {
  payload.createdBy = userId;
  const existing = await CashAdjustment.findOne({ adjustmentNo: payload.adjustmentNo });
  if (existing) throw new AppError(httpStatus.CONFLICT, 'Adjustment number already exists');
  return await CashAdjustment.create(payload);
};

const getAdjustments = async (query: Record<string, unknown>) => {
  const adjQuery = new QueryBuilder(CashAdjustment.find(), query)
    .search(['adjustmentNo', 'account']).filter().sort().paginate();
  const result = await adjQuery.modelQuery;
  const meta = await adjQuery.countTotal();
  return { meta, data: result };
};

export const CashAdjustmentService = { postAdjustment, getAdjustments };
