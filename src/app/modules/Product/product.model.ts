import { Schema, model } from 'mongoose';
import { IProduct } from './product.interface';

const productSchema = new Schema<IProduct>(
  {
    productId: {
      type: String,
      required: [true, 'Product ID is required'],
      unique: true,
      trim: true,
    },
    productCode: {
      type: String,
      required: [true, 'Product code is required'],
      unique: true,
      trim: true,
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    arabicName: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    packageVal: {
      type: String,
      trim: true,
    },
    vat: {
      type: Number,
      required: true,
      default: 15,
      enum: [0, 5, 15],
    },
    mrp: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'MRP cannot be negative'],
    },
    purchasePrice: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Purchase price cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Selling price cannot be negative'],
    },
    storage: {
      type: String,
      trim: true,
    },
    minQty: {
      type: Number,
      default: 1,
      min: [0, 'Minimum quantity cannot be negative'],
    },
    productType: {
      type: String,
      enum: ['SINGLE', 'BOX'],
      default: 'SINGLE',
    },
    boxQty: {
      type: Number,
      default: 1,
      min: [1, 'Box quantity must be at least 1'],
    },
    formulation: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
  },
);

// Exclude deleted products from queries
productSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

productSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export const Product = model<IProduct>('Product', productSchema);
