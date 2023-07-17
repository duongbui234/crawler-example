import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';
import { Department } from './departments.schema';

export type TransactionDocument = HydratedDocument<Transaction>;

enum TransactionType {
  thanh_toan = 'thanh-toan',
  gia_han = 'gia-han',
  nap_tien = 'nap-tien',
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user_id: User;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Department.name,
  })
  post_id: Department;
  @Prop({ enum: TransactionType })
  transaction_type: string;
  @Prop()
  amount: number;
  @Prop({ default: 0 })
  deleted: number;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
