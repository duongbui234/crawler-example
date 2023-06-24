import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import * as fs from 'fs';
import { DepartmentSchema } from '../models/departments.schema';

dotenv.config({ path: process.cwd() + '/.env' });

(async function importData() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);

    const jsonData = fs.readFileSync(
      process.cwd() + '/cho-thue-mat-bang.json',
      'utf-8',
    );

    const data = JSON.parse(jsonData);

    const Department = mongoose.model('Department', DepartmentSchema);

    await Department.insertMany(data);

    console.log('Import dữ liệu thành công');
  } catch (e) {
    console.error('Import dữ liệu thất bại', e);
  } finally {
    await mongoose.disconnect();
  }
})();
