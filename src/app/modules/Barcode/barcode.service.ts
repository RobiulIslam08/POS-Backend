import { BarcodeJob } from './barcode.model';
import { IBarcodeJob } from './barcode.interface';
import QueryBuilder from '../../utils/QueryBuilder';

const generateLabels = async (payload: IBarcodeJob, userId: string) => {
  payload.generatedBy = userId;
  if (!payload.barcodeValue) {
    payload.barcodeValue = payload.productCode;
  }
  return await BarcodeJob.create(payload);
};

const getJobs = async (query: Record<string, unknown>) => {
  const jobQuery = new QueryBuilder(BarcodeJob.find(), query)
    .search(['productCode', 'barcodeValue']).filter().sort().paginate();
  const result = await jobQuery.modelQuery;
  const meta = await jobQuery.countTotal();
  return { meta, data: result };
};

export const BarcodeService = { generateLabels, getJobs };
