import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { getNextSequenceValue } from './counter.schema';

export type UserDocument = HydratedDocument<User>;

enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Schema({ timestamps: true })
export class User {
  @Prop()
  sdt: string;
  @Prop()
  userId: number;
  @Prop()
  fullname: string;
  @Prop({ default: 0 })
  balance: number;
  @Prop({ type: Object, default: null })
  avatar: object;
  @Prop()
  password: string;
  @Prop({ enum: Role, default: Role.USER })
  role: string;
  @Prop({ default: 0 })
  deleted: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<User>('save', async function (next) {
  if (!this.userId) {
    this.userId = await getNextSequenceValue(User.name);
  }
  next();
});
