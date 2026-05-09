import { ProductLink } from './productLink.model';
import { IProductLink } from './productLink.interface';
import QueryBuilder from '../../utils/QueryBuilder';

const linkProducts = async (payload: IProductLink) => {
  return await ProductLink.create(payload);
};

const getLinks = async (query: Record<string, unknown>) => {
  const linkQuery = new QueryBuilder(ProductLink.find(), query)
    .search(['boxProductName', 'singleProductName', 'boxProductCode', 'singleProductCode']).filter().sort().paginate();
  const result = await linkQuery.modelQuery;
  const meta = await linkQuery.countTotal();
  return { meta, data: result };
};

export const ProductLinkService = { linkProducts, getLinks };
