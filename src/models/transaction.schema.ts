import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';
import { Post } from './post.schema';
import { getNextSequenceValue } from './counter.schema';

export type TransactionDocument = HydratedDocument<Transaction>;

export enum TransactionType {
  thanh_toan = 'thanh-toan',
  gia_han = 'gia-han',
  nap_tien = 'nap-tien',
}
export enum StatusType {
  thanh_cong = 'thanh-cong',
  that_bat = 'that-bai',
}

@Schema({ timestamps: true })
export class Transaction {
  constructor() {
    this.setDefaultTransactionId();
  }
  @Prop()
  transactionId: number;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user_id: User;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Post.name,
  })
  post_id: Post;
  @Prop()
  description: string;
  @Prop({ enum: TransactionType })
  transaction_type: string;
  @Prop({ enum: StatusType })
  status: string;
  @Prop()
  amount: number;
  @Prop({ default: 0 })
  deleted: number;

  async setDefaultTransactionId() {
    this.transactionId = await getNextSequenceValue(Transaction.name); // Lấy giá trị auto-increment từ hàm getNextSequenceValue
  }
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.pre<Transaction>('save', async function (next) {
  if (!this.transactionId) {
    this.transactionId = await getNextSequenceValue(Transaction.name);
  }
  next();
});
