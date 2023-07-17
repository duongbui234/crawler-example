import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import * as fs from 'fs';
import slugify from 'slugify';
import { DepartmentSchema } from '../models/departments.schema';

dotenv.config({ path: process.cwd() + '/.env' });

(async function importData() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);

    const jsonFiles = [
      'cho-thue-can-ho.json',
      'cho-thue-mat-bang.json',
      'cho-thue-phong-tro.json',
      'nha-cho-thue.json',
    ];

    let data: any[] = [];
    for (const file of jsonFiles) {
      const jsonData = fs.readFileSync(process.cwd() + `/${file}`, 'utf-8');
      console.log(JSON.parse(jsonData).length);
      data = data.concat(JSON.parse(jsonData));
    }
    console.log(data.length);

    data = data.map((department) => {
      const diadiem = department.address.split(', ');
      let province;
      let district;
      let ward;
      if (diadiem.length) {
        province = diadiem[diadiem.length - 1] ?? '';
        district = diadiem[diadiem.length - 2] ?? '';
        if (diadiem.length > 3) {
          ward = diadiem[diadiem.length - 3] ?? '';
        } else {
          ward = '';
        }
      }
      let category = '';
      if (
        department.category === 'Cho thuê căn hộ mini' ||
        department.category === 'Cho thuê căn hộ dịch vụ'
      ) {
        category = slugify('Cho thuê căn hộ');
      } else {
        category = slugify(department.category);
      }
      return {
        ...department,
        price: department.price * 1000000,
        user_id: null,
        slug: slugify(department.title),
        category: category.toLowerCase(),
        province,
        district,
        ward,
      };
    });

    const getUniqueObject = (arr) => {
      const uniqueObject = arr.reduce((acc, item) => {
        if (!acc[item.slug]) {
          acc[item.slug] = item;
        }
        return acc;
      }, {});
      return Object.values(uniqueObject);
    };

    data = getUniqueObject(data);

    const Department = mongoose.model('Department', DepartmentSchema);

    await Department.insertMany(data);

    console.log('Import dữ liệu thành công');
  } catch (e) {
    console.error('Import dữ liệu thất bại', e);
  } finally {
    await mongoose.disconnect();
  }
})();
