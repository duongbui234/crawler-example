import { Injectable, Param, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Department } from '../models/departments.schema';
import { Model } from 'mongoose';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name) private department: Model<Department>,
  ) {}

  async findAll(@Query() query): Promise<{
    departments: Department[];
    count: number;
    allDepartments: any[];
  }> {
    const limit = 20;
    const current = +query.page || 1;
    const skip = (current - 1) * limit;
    const filter = {};

    let isCall = false;

    for (const key in query) {
      if (query[key] !== 'null' && query[key] !== 'undefined') {
        if (key === 'province' || key === 'district' || key === 'ward') {
          isCall = true; // chỉ khi có province or district or ward thì ms gọi get All
          let province = '';
          let district = '';
          let ward = '';
          if (key === 'province') {
            province = query.province?.replace(/(thành phố|tỉnh)/gi, '').trim();
            filter[key] = new RegExp(province, 'i');
          }
          if (key === 'district') {
            district = query.district
              ?.replace(/(quận|huyện|thị xã|thành phố)/gi, '')
              .trim();
            filter[key] = new RegExp(district, 'i');
          }
          if (key === 'ward') {
            ward = query.ward?.replace(/(thị trấn|xã|phường)/gi, '').trim();
            filter[key] = new RegExp(ward, 'i');
          }
        }

        if (key === 'price') {
          const arrPrice = query[key].split('-');
          if (arrPrice.length == 2) {
            filter[key] = { $gte: arrPrice[0], $lte: arrPrice[1] };
          } else {
            filter[key] = { $gte: arrPrice[0] };
          }
        }
        if (key === 'floor_size') {
          const arrFloorSize = query[key].split('-');
          if (arrFloorSize.length == 2) {
            filter[key] = { $gte: arrFloorSize[0], $lte: arrFloorSize[1] };
          } else {
            filter[key] = { $gte: arrFloorSize[0] };
          }
        }
        if (key === 'category') {
          filter[key] = new RegExp(query[key], 'i');
        }
      }
    }
    console.log(filter);

    const count = await this.department.count(filter);
    const departments = await this.department
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();
    let allDepartments: any[] = [];
    if (isCall) allDepartments = await this.department.find(filter).exec();
    return { departments, count, allDepartments };
  }

  async count(): Promise<{
    countPhongtro: number;
    countNha: number;
    countCanho: number;
    countMatbang: number;
  }> {
    const countPhongtro = await this.department.count({
      category: /phong-tro-nha-tro/i,
    });
    const countNha = await this.department.count({
      category: /nha-thue-nguyen-can/i,
    });
    const countCanho = await this.department.count({
      category: /cho-thue-can-ho/i,
    });
    const countMatbang = await this.department.count({
      category: /cho-thue-mat-bang/i,
    });
    return { countPhongtro, countNha, countCanho, countMatbang };
  }

  async findOne(@Param() param): Promise<Department> {
    return await this.department.findOne({ slug: param.slug }).exec();
  }

  async getOtherDistrict(@Query() query): Promise<Department[]> {
    // eslint-disable-next-line prefer-const
    let { province, district, category } = query;
    console.log(category);
    province = province?.replace(/(thành phố|tỉnh)/gi, '').trim();
    district = district?.replace(/(quận|huyện|thị xã|thành phố)/gi, '').trim();
    return await this.department
      .find({
        category: new RegExp(category, 'i'),
        province: new RegExp(province, 'i'),
        district: { $not: new RegExp(district, 'i') },
      })
      .exec();
  }

  async getOtherWard(@Query() query): Promise<Department[]> {
    // eslint-disable-next-line prefer-const
    let { province, district, ward, category } = query;
    province = province?.replace(/(thành phố|tỉnh)/gi, '').trim();
    district = district?.replace(/(quận|huyện|thị xã|thành phố)/gi, '').trim();
    ward = ward?.replace(/(thị trấn|xã|phường)/gi, '').trim();
    return await this.department
      .find({
        category: new RegExp(category, 'i'),
        province: new RegExp(province, 'i'),
        district: new RegExp(district, 'i'),
        ward: { $not: new RegExp(ward, 'i') },
      })
      .exec();
  }
}
