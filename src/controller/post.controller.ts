import { NextFunction } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { PostService } from 'src/service/post.service';

@Controller('/api/v1/post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getList(@Query() query, @Res() res) {
    const { posts, count, allPosts } = await this.postService.findAll(query);
    return res.status(HttpStatus.OK).json({
      success: true,
      data: {
        posts,
        count,
        allPosts,
      },
    });
  }
  @Get('/my-post')
  async getListByActiveStatus(@Res() res, @Req() req) {
    const result = await this.postService.getMyPost(req);
    return res.status(HttpStatus.OK).json({
      success: true,
      data: {
        result,
      },
    });
  }

  @Get('/my-post/:postId')
  async getMyPostByPostId(@Param() params, @Res() res, @Req() req) {
    const postDetail = await this.postService.getMyPostById(params, req);

    return res.status(HttpStatus.OK).json({
      success: true,
      postDetail,
    });
  }

  @Get('count')
  async count(@Res() res) {
    const { countPhongtro, countNha, countCanho, countMatbang } =
      await this.postService.count();
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
    const departments = await this.postService.getOtherDistrict(query);
    return res.status(HttpStatus.OK).json({
      success: true,
      departments,
    });
  }

  @Get('other-ward')
  async getOtherWard(@Res() res, @Query() query) {
    const departments = await this.postService.getOtherWard(query);
    return res.status(HttpStatus.OK).json({
      success: true,
      departments,
    });
  }
  @Post('filter-by-status')
  async locTinTheoTrangThai(@Req() req, @Res() res) {
    const posts = await this.postService.locTinTheoTrangThai(req);
    return res.status(HttpStatus.OK).json({
      success: true,
      posts,
    });
  }

  @Get(':slug')
  async getBySlug(@Param() param, @Res() res) {
    const department = await this.postService.findOne(param);
    if (department) {
      return res.status(HttpStatus.OK).json({
        success: true,
        department,
      });
    } else {
      throw new HttpException('Không tìm thấy bài post', HttpStatus.NOT_FOUND);
    }
  }

  @Post()
  async createPost(@Body() body, @Res() res, @Req() req) {
    const department = await this.postService.createPost(body, req);
    return res.status(HttpStatus.OK).json({
      success: true,
      department,
    });
  }

  @Put('/update-my-post')
  async updatePost(@Req() req, @Res() res) {
    const updated = await this.postService.updateMyPost(req);
    return res.status(HttpStatus.OK).json({
      success: true,
      data: { ...updated },
    });
  }
  @Put('/update-hidden-status')
  async updateHiddenStatus(@Req() req, @Res() res) {
    const updated = await this.postService.updateHiddenStatus(req);
    return res.status(HttpStatus.OK).json({
      success: true,
      data: { ...updated },
    });
  }

  @Post('pay')
  async payPost(@Req() req, @Res() res) {
    const { updatedUser, updatedPost, newTransaction } =
      await this.postService.payPost(req);
    return res.status(HttpStatus.OK).json({
      success: true,
      data: { updatedPost, updatedUser, newTransaction },
    });
  }

  @Post('/admin/all')
  async getAllPostByAdmin(@Req() req, @Res() res) {
    const { posts, count } = await this.postService.getAllPostByAdmin(req);
    return res.status(HttpStatus.OK).json({
      success: true,
      posts,
      count,
    });
  }

  @Post('/admin/accept')
  async duyetTinDang(@Req() req, @Res() res) {
    const { updated } = await this.postService.duyetTinDang(req);
    return res.status(HttpStatus.OK).json({
      success: true,
      updated,
    });
  }
}
