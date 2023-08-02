import { Controller, HttpStatus, Res, Body, Post } from '@nestjs/common';
import { CloudinaryService } from 'src/service/cloudinary.service';

@Controller('/api/v1/upload-images')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  // @Post()
  // async uploadImages(@Body() body, @Res() res) {
  //   const result = await this.cloudinaryService.uploadImages(body);
  //   return res.status(HttpStatus.OK).json({
  //     success: true,
  //     data: { result },
  //   });
  // }
  // @Post()
  // async deleteImages(@Body() body, @Res() res) {
  //   const result = await this.cloudinaryService.deleleImages(body);
  //   return res.status(HttpStatus.OK).json({
  //     success: true,
  //     data: { result },
  //   });
  // }
}
