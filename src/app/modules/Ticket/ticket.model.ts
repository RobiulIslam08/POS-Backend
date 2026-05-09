import { Schema, model } from 'mongoose';
import { ITicket } from './ticket.interface';

const ticketSchema = new Schema<ITicket>(
  {
    ticketNo: { type: String, required: true, unique: true, trim: true },
    subject: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    priority: { type: String, enum: ['Low', 'Normal', 'High', 'Critical'], default: 'Normal' },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
    createdBy: { type: String, required: true },
  },
  { timestamps: true, toJSON: { transform: (doc, ret) => { delete (ret as any).__v; return ret; } } },
);

export const Ticket = model<ITicket>('Ticket', ticketSchema);
