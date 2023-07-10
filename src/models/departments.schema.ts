import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DepartmentDocument = HydratedDocument<Department>;

enum ObjectRental {
  tat_ca = 'Tất cả',
  nam = 'Nam',
  nu = 'Nữ',
}

@Schema()
export class Department {
  @Prop()
  title: string;
  @Prop({ unique: true, required: true })
  slug: string;
  @Prop()
  address: string;
  @Prop()
  price: number;
  @Prop()
  description: string;
  @Prop({ enum: ObjectRental, default: ObjectRental.tat_ca })
  rental_object: string;
  @Prop()
  category: string;
  @Prop()
  date_register: Date;
  @Prop()
  floor_size: number;
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
  @Prop()
  province: string;
  @Prop()
  district: string;
  @Prop()
  ward: string;
  @Prop([String])
  images: string[];
  @Prop({ default: 0 })
  deleted: number;
  @Prop({ default: Date.now() })
  createdDate: Date;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
