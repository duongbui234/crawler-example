import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
  fullname: string;
  @Prop({ default: 0 })
  balance: number;
  @Prop()
  password: string;
  @Prop({ enum: Role, default: Role.USER })
  role: string;
  @Prop({ default: 0 })
  deleted: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
