import httpStatus from 'http-status';
import { Formulation } from './formulation.model';
import { IFormulation } from './formulation.interface';
import AppError from '../../errors/AppError';
import QueryBuilder from '../../utils/QueryBuilder';

const searchableFields = ['formulationName', 'formulationCode', 'group', 'manufacturer'];

const createFormulation = async (payload: IFormulation) => {
  const existing = await Formulation.findOne({ formulationCode: payload.formulationCode });
  if (existing) throw new AppError(httpStatus.CONFLICT, 'Formulation with this code already exists');
  return await Formulation.create(payload);
};

const getAllFormulations = async (query: Record<string, unknown>) => {
  const formulationQuery = new QueryBuilder(Formulation.find(), query)
    .search(searchableFields).filter().sort().paginate().fields();
  const result = await formulationQuery.modelQuery;
  const meta = await formulationQuery.countTotal();
  return { meta, data: result };
};

const updateFormulation = async (id: string, payload: Partial<IFormulation>) => {
  delete payload.formulationCode;
  delete payload.isDeleted;
  const formulation = await Formulation.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!formulation) throw new AppError(httpStatus.NOT_FOUND, 'Formulation not found');
  return formulation;
};

const deleteFormulation = async (id: string) => {
  const formulation = await Formulation.findById(id);
  if (!formulation) throw new AppError(httpStatus.NOT_FOUND, 'Formulation not found');
  formulation.isDeleted = true;
  await formulation.save();
};

export const FormulationService = { createFormulation, getAllFormulations, updateFormulation, deleteFormulation };
