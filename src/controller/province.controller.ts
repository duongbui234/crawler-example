import { Controller, Get, HttpStatus, Param, Query, Res } from '@nestjs/common';
import axios from 'axios';

@Controller('/api/v1/province')
export class ProvinceController {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  @Get()
  async getAllProvinces(@Query() query, @Res() res) {
    try {
      const response = await axios.get('https://provinces.open-api.vn/api/');
      const data = response.data;
      // Xử lý kết quả từ API
      return res.status(HttpStatus.CREATED).json({
        success: true,
        data,
      });
    } catch (e) {
      throw new Error('Failed to fetch data from API');
    }
  }

  @Get('/p/:id')
  async getDistrictsByProvinceCode(@Param() param, @Res() res) {
    try {
      console.log(param);
      const { data } = await axios.get(
        `https://provinces.open-api.vn/api/p/${param.id}/?depth=2`,
      );
      // Xử lý kết quả từ API
      return res.status(HttpStatus.CREATED).json({
        success: true,
        data: data.districts,
      });
    } catch (e) {
      throw new Error('Failed to fetch data from API');
    }
  }

  @Get('/d/:id')
  async getWardsByProvinceCode(@Param() param, @Res() res) {
    try {
      console.log(param);
      const { data } = await axios.get(
        `https://provinces.open-api.vn/api/d/${param.id}/?depth=2`,
      );
      // Xử lý kết quả từ API
      return res.status(HttpStatus.CREATED).json({
        success: true,
        data: data.wards,
      });
    } catch (e) {
      throw new Error('Failed to fetch data from API');
    }
  }
}
