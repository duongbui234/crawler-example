import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Department {
  @Prop()
  title: string;
  @Prop()
  address: string;
  @Prop()
  price: number;
  @Prop()
  description: string;
  @Prop()
  date_register: Date;
  @Prop()
  date_expire: Date;
  @Prop()
  username: string;
  @Prop()
  lng: number;
  @Prop()
  lat: number;
  @Prop()
  phone_number: string;
  @Prop()
  zalo_number: string;
  @Prop([String])
  images: string[];
  @Prop({ default: 0 })
  deleted: number;
  @Prop({ default: Date.now() })
  createdDate: Date;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
