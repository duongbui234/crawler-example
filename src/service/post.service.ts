import { HttpException, HttpStatus, Injectable, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../models/post.schema';
import { Model } from 'mongoose';
import slugify from 'slugify';
import { CloudinaryService } from './cloudinary.service';
import { User } from 'src/models/user.schema';
import { TransactionService } from './transaction.service';
import {
  StatusType,
  Transaction,
  TransactionType,
} from 'src/models/transaction.schema';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private post: Model<Post>,
    @InjectModel(User.name) private user: Model<User>,
    @InjectModel(Transaction.name) private transaction: Model<Transaction>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly transactionService: TransactionService,
  ) {}

  async findAll(@Query() query): Promise<{
    posts: Post[];
    count: number;
    allPosts: any[];
  }> {
    const limit = +query.limit || 7;
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
            filter[key] = {
              $gte: arrPrice[0] * 1000000,
              $lte: arrPrice[1] * 1000000,
            };
          } else {
            filter[key] = { $gte: arrPrice[0] * 1000000 };
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

    filter['hidden'] = 0;
    filter['active'] = { $in: [1, 2] };

    const count = await this.post.count(filter);
    // const posts = await this.post
    //   .find(filter)
    //   .skip(skip)
    //   .limit(limit)
    //   .sort({ date_expire: -1, level: -1, date_register: 1 }) // sort
    //   .exec();
    const posts = await this.post.aggregate([
      { $match: filter },
      { $addFields: { isExpired: { $lt: ['$date_expire', new Date()] } } },
      { $sort: { isExpired: 1, level: -1, date_register: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);
    let allPosts: any[] = [];
    if (isCall) allPosts = await this.post.find(filter).exec();
    return { posts, count, allPosts };
  }

  async count(): Promise<{
    countPhongtro: number;
    countNha: number;
    countCanho: number;
    countMatbang: number;
  }> {
    const countPhongtro = await this.post.count({
      category: /phong-tro-nha-tro/i,
    });
    const countNha = await this.post.count({
      category: /nha-thue-nguyen-can/i,
    });
    const countCanho = await this.post.count({
      category: /cho-thue-can-ho/i,
    });
    const countMatbang = await this.post.count({
      category: /cho-thue-mat-bang/i,
    });
    return { countPhongtro, countNha, countCanho, countMatbang };
  }

  async findOne(param): Promise<Post> {
    return await this.post.findOne({ slug: param.slug }).exec();
  }

  async getOtherDistrict(@Query() query): Promise<Post[]> {
    // eslint-disable-next-line prefer-const
    let { province, district, category } = query;
    console.log(
      '🚀 ~ file: post.service.ts:127 ~ PostService ~ getOtherDistrict ~ category:',
      category,
    );
    province = province?.replace(/(thành phố|tỉnh)/gi, '').trim();
    district = district?.replace(/(quận|huyện|thị xã|thành phố)/gi, '').trim();
    const q: {
      province: RegExp;
      district: { $not: RegExp };
      category?: string;
    } = {
      province: new RegExp(province, 'i'),
      district: { $not: new RegExp(district, 'i') },
    };
    if (category !== 'undefined') q.category = category;
    return await this.post.find(q).exec();
  }

  async getOtherWard(@Query() query): Promise<Post[]> {
    // eslint-disable-next-line prefer-const
    let { province, district, ward, category } = query;
    province = province?.replace(/(thành phố|tỉnh)/gi, '').trim();
    district = district?.replace(/(quận|huyện|thị xã|thành phố)/gi, '').trim();
    ward = ward?.replace(/(thị trấn|xã|phường)/gi, '').trim();
    const q: {
      province: RegExp;
      district: RegExp;
      ward: { $not: RegExp };
      category?: string;
    } = {
      province: new RegExp(province, 'i'),
      district: new RegExp(district, 'i'),
      ward: { $not: new RegExp(ward, 'i') },
    };
    if (category !== 'undefined') q.category = category;
    console.log(q);
    return await this.post.find(q).exec();
  }

  async createPost(body, req): Promise<any> {
    const images = await this.cloudinaryService.uploadImages(body.images);
    const query = {
      ...body,
      user_id: req.user._id,
      active: -2,
      level: 0,
      images,
      slug: slugify(body.title),
    };
    if (req.user.role === 'ADMIN') {
      const currentTime = Date.now();
      const futureTime = new Date(currentTime);
      futureTime.setDate(futureTime.getDate() + body.numOfDay);
      query.active = 1;
      query.level = body.level;
      query.date_register = new Date(currentTime).toISOString();
      query.date_expire = futureTime.toISOString();
    }
    const existingPost = await this.post
      .findOne({ slug: slugify(body.title) })
      .exec();
    if (existingPost)
      throw new Error('Tin đăng đã tồn tại, vui lòng nhập lại tiêu đề');

    console.log(query);
    const createdPost = new this.post(query);
    return await createdPost.save();
  }

  async getMyPost(req): Promise<any> {
    return await this.post
      .find({
        user_id: req.user._id,
        // active: req.query.active * 1,
      })
      .exec();
  }

  async getMyPostById(params, req): Promise<any> {
    const query = { postId: parseInt(params.postId), user_id: req.user._id };
    const role = req.user.role;
    if (role === 'ADMIN') {
      delete query.user_id;
    }
    const myPost = await this.post.findOne(query).exec();
    if (!myPost) {
      throw new HttpException('Không tìm thấy bài post', HttpStatus.NOT_FOUND);
    }
    return myPost;
  }

  async payPost(req): Promise<any> {
    const { numOfDay, level, money, postId, type } = req.body;

    const currentTime = Date.now();
    const futureTime = new Date(currentTime);
    futureTime.setDate(futureTime.getDate() + numOfDay);
    const updatedUser = await this.user
      .findByIdAndUpdate(req.user._id, {
        balance: req.user.balance - money,
      })
      .select('-password')
      .exec();

    const updatedPost = await this.post
      .findByIdAndUpdate(postId, {
        date_register: new Date(currentTime).toISOString(),
        date_expire: futureTime.toISOString(),
        level,
        active: level !== 1 ? 1 : -1,
      })
      .exec();
    const newTransaction = await this.transaction.create({
      user_id: req.user._id,
      post_id: updatedPost._id,
      description: `${type} tin đăng ${updatedPost.postId} với số tiền ${money}`,
      transaction_type: TransactionType[type],
      status: StatusType.thanh_cong,
      amount: money,
    });

    return { updatedUser, updatedPost, newTransaction };
  }

  async updateMyPost(req): Promise<any> {
    const role = req.user.role;
    const query = {
      user_id: req.user._id,
      postId: +req.body.postId,
    };
    if (role === 'ADMIN') delete query.user_id;
    const myPost = await this.post.find(query).exec();

    if (myPost.length === 0) {
      throw new HttpException(
        'Không tìm thấy bài post của bạn',
        HttpStatus.NOT_FOUND,
      );
    } else {
      if (myPost[0].active !== 2) {
        console.log('hello');

        const willUploadImages: string[] = [];
        const oldImages = [];
        let willDeleteImages = [];
        for (const item2 of req.body.images) {
          if (typeof item2 === 'string') {
            console.log('string');
            willUploadImages.push(item2);
          } else {
            oldImages.push(item2);
          }
        }

        willDeleteImages = myPost[0]?.images?.filter(
          (orgImg: { public_id: string; name: string; url: string }) =>
            !req.body.images.some(
              (bodyImg) =>
                typeof bodyImg !== 'string' &&
                orgImg.public_id === bodyImg.public_id,
            ),
        );

        const images = await this.cloudinaryService.uploadImages(
          willUploadImages,
        );

        console.log(req.body);

        await this.cloudinaryService.deleteImages(willDeleteImages);
        const updatePost = await this.post
          .findOneAndUpdate(
            { postId: +req.body.postId },
            { ...req.body, images: [...images, ...oldImages] },
          )
          .exec();
        return updatePost;
      } else {
        return await this.post
          .findOneAndUpdate({ postId: +req.body.postId }, { ...req.body })
          .exec();
      }
    }
  }
  async updateHiddenStatus(req): Promise<any> {
    const query: any = { postId: +req.body.postId };
    if (req.user.role === 'USER') {
      query.user_id = req.user._id;
    }
    const myPost = await this.post.find(query).exec();

    if (myPost.length < 0) {
      throw new HttpException(
        'Không tìm thấy bài post của bạn',
        HttpStatus.NOT_FOUND,
      );
    } else {
      const updatePost = await this.post
        .findOneAndUpdate(
          { postId: +req.body.postId },
          { hidden: +req.body.hidden },
        )
        .exec();
      return updatePost;
    }
  }
  async locTinTheoTrangThai(req): Promise<any> {
    const query: any = { user_id: req.user._id };
    const role = req.user.role;
    if (role === 'ADMIN') {
      delete query.user_id;
    }
    if (req.body.status == 'hidden') {
      query.hidden = 1;
    } else {
      if (req.body.status == 'notPay') {
        query.active = -2;
      }
      if (req.body.status == 'notAccept') {
        query.active = -1;
      }
      if (req.body.status == 'active') {
        if (role === 'ADMIN') {
          query.active = { $in: [1, 2] };
        } else {
          query.active = 1;
        }
        query.date_expire = { $gt: new Date() };
      }
      if (req.body.status == 'expired') {
        query.active = 1;
        query.date_expire = { $lt: new Date() };
      }
    }
    return await this.post.find(query).exec();
  }

  async getAllPostByAdmin(req): Promise<any> {
    const role = req.user.role;
    const limit = 7;
    const current = +req.body.page || 1;
    const skip = (current - 1) * limit;
    const query: any = {};
    if (req.body.status == 'hidden') {
      query.hidden = 1;
    } else {
      if (req.body.status == 'notPay') {
        query.active = -2;
      }
      if (req.body.status == 'notAccept') {
        query.active = -1;
      }
      if (req.body.status == 'active') {
        query.active = { $in: [1, 2] };
        query.date_expire = { $gt: new Date() };
      }
      if (req.body.status == 'expired') {
        query.active = { $in: [1, 2] };
        query.date_expire = { $lt: new Date() };
      }
    }
    if (req.user.role === 'ADMIN') {
      console.log(query);
      const posts = await this.post
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ postId: 'desc' })
        .exec();
      const count = await this.post.find(query).count().exec();
      return { posts, count };
    }
  }

  async duyetTinDang(req): Promise<any> {
    return await this.post
      .findOneAndUpdate({ postId: req.body.postId }, { active: 1 })
      .exec();
  }
}
