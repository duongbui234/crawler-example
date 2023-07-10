import { Controller, Get, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { DepartmentService } from '../service/department.service';

@Controller('/api/v1/department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  async getList(@Query() query, @Res() res) {
    const { departments, count, allDepartments } =
      await this.departmentService.findAll(query);
    return res.status(HttpStatus.OK).json({
      success: true,
      data: {
        departments,
        count,
        allDepartments,
      },
    });
  }

  @Get('count')
  async count(@Res() res) {
    const { countPhongtro, countNha, countCanho, countMatbang } =
      await this.departmentService.count();
    return res.status(HttpStatus.OK).json({
      success: true,
      countPhongtro,
      countNha,
      countCanho,
      countMatbang,
    });
  }

  @Get('other-district')
  async getOtherDistrict(@Res() res, @Query() query) {
    const departments = await this.departmentService.getOtherDistrict(query);
    return res.status(HttpStatus.OK).json({
      success: true,
      departments,
    });
  }

  @Get('other-ward')
  async getOtherWard(@Res() res, @Query() query) {
    const departments = await this.departmentService.getOtherWard(query);
    return res.status(HttpStatus.OK).json({
      success: true,
      departments,
    });
  }

  @Get(':slug')
  async getBySlug(@Param() param, @Res() res) {
    const department = await this.departmentService.findOne(param);
    return res.status(HttpStatus.OK).json({
      success: true,
      department,
    });
  }
}
