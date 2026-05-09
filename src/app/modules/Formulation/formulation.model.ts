import { Schema, model } from 'mongoose';
import { IFormulation } from './formulation.interface';

const formulationSchema = new Schema<IFormulation>(
  {
    formulationCode: { type: String, required: true, unique: true, trim: true },
    formulationName: { type: String, required: true, trim: true },
    group: { type: String, trim: true },
    strength: { type: String, trim: true },
    manufacturer: { type: String, trim: true },
    notes: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { transform: (doc, ret) => { delete (ret as any).__v; return ret; } },
  },
);

formulationSchema.pre('find', function (next) { this.find({ isDeleted: { $ne: true } }); next(); });
formulationSchema.pre('findOne', function (next) { this.find({ isDeleted: { $ne: true } }); next(); });

export const Formulation = model<IFormulation>('Formulation', formulationSchema);
