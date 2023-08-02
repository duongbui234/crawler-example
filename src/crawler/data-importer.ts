import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import * as fs from 'fs';
import slugify from 'slugify';
import { Post, PostSchema } from '../models/post.schema';
import { CounterSchema } from '../models/counter.schema';

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

    data = data.map((department, idx) => {
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

      const imagesTo1 = department.images.map((img) => {
        return { public_id: '', url: img.replace(/\s/g, '') };
      });

      return {
        ...department,
        price: department.price * 1000000,
        user_id: null,
        slug: slugify(department.title),
        category: category.toLowerCase(),
        images: [...imagesTo1],
        province,
        district,
        active: 2,
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
    data = data.map((item, idx) => ({ ...item, postId: idx + 1 }));

    const post = mongoose.model('Post', PostSchema);
    const counter = mongoose.model('Counter', CounterSchema);

    await counter.findOneAndUpdate(
      { collectionName: Post.name },
      { $inc: { sequence_value: data.length } },
      { new: true, upsert: true },
    );
    await post.insertMany(data);

    console.log('Import dữ liệu thành công');
  } catch (e) {
    console.error('Import dữ liệu thất bại', e);
  } finally {
    await mongoose.disconnect();
  }
})();
