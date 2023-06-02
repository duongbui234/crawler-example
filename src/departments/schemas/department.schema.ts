import * as mongoose from 'mongoose';

export const DepartmentSchema = new mongoose.Schema({
  title: String,
  address: String,
  price: Number,
  description: String,
  date_register: Date,
  date_expire: Date,
  username: String,
  lat: Number,
  lng: Number,
  phone_number: { type: String, required: false },
  zalo_number: { type: String, required: false },
  images: [String],
});
