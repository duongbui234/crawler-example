import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Schema()
export class User {
  @Prop()
  sdt: string;
  @Prop()
  fullname: string;
  @Prop()
  password: string;
  @Prop({ enum: Role, default: Role.USER })
  role: string;
  @Prop({ default: 0 })
  deleted: number;
  @Prop({ default: Date.now() })
  createdDate: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
