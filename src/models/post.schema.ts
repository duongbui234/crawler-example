import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';
import { getNextSequenceValue } from './counter.schema';

export type PostDocument = HydratedDocument<Post>;

enum ObjectRental {
  tat_ca = 'Tất cả',
  nam = 'Nam',
  nu = 'Nữ',
}

enum Category {
  phong_tro = 'phong-tro-nha-tro',
  nha_nguyen_can = 'nha-thue-nguyen-can',
  can_ho = 'cho-thue-can-ho',
  mat_bang = 'cho-thue-mat-bang',
}

enum Level {
  not_pay = 0,
  normal = 1,
  vip1 = 2,
  vip2 = 3,
  vip3 = 4,
}

@Schema({ timestamps: true })
export class Post {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  user_id: User;
  @Prop()
  postId: number;
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
  @Prop({ enum: Category })
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
  @Prop([Object])
  images: object[];
  @Prop({ default: 0 })
  deleted: number;
  @Prop({ default: Level.not_pay, enum: Level })
  level: number;
  @Prop({ default: -2 }) // có 5 trạng thái -2, -1,1,2 . , -2 là tin mới tạo chưa thanh toán, -1 là tin THƯỜNG đã thanh toán chưa được ad duyệt, 1 là tin đang active, 2 là crwal dữ liệu ngoài
  active: number;
  @Prop({ default: 0 })
  hidden: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.pre<Post>('save', async function (next) {
  if (!this.postId) {
    this.postId = await getNextSequenceValue(Post.name);
  }
  next();
});
