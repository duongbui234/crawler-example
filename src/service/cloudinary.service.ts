import { Body, Injectable } from '@nestjs/common';
import cloudinary from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRET_KEY,
    });
  }
  async uploadImages(images: string[]): Promise<any> {
    if (images.length) {
      const results = await Promise.all(
        images.map(async (img) => {
          const result = await cloudinary.v2.uploader.upload(img, {
            public_id: `${Date.now()}`,
            resource_type: 'auto',
            folder: 'post',
          });
          return {
            public_id: result.public_id,
            url: result.secure_url,
            name: `${result.public_id}.${result.format}`,
          };
        }),
      );
      return results;
    }
    return [];
  }

  async deleteImages(
    images: { public_id?: string; name?: string; url?: string }[],
  ): Promise<any> {
    console.log(images);
    if (images.length) {
      console.log(images);
      const results = await Promise.all(
        images.map(async (img) => {
          return await cloudinary.v2.uploader.destroy(img.public_id);
        }),
      );
      console.log(
        '🚀 ~ file: cloudinary.service.ts:44 ~ CloudinaryService ~ results:',
        results,
      );
      return results;
    }
  }
}
