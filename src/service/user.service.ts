import { Body, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { hashPassword, isMatchPassword } from '../utils/utils';
import { JwtService } from '@nestjs/jwt';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwt: JwtService,
    private readonly cloundinary: CloudinaryService,
  ) {}

  async signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
    const { sdt, password, fullname } = createUserDto;
    const existedUser = await this.userModel.findOne({ sdt }).exec();
    if (existedUser) {
      throw new Error('Số điện thoại đã được đăng ký');
    }

    const hash = await hashPassword(password);

    const createdUser = new this.userModel({ sdt, password: hash, fullname });
    return await createdUser.save();
  }

  async resetPassword(@Body() body): Promise<any> {
    const { password, sdt } = body;
    console.log(body);
    const existedUser = await this.userModel.findOne({ sdt }).exec();
    console.log(existedUser);
    if (!existedUser) {
      throw new Error('Số điện thoại không hợp lệ');
    }
    const hash = await hashPassword(password);
    existedUser.password = hash;
    await existedUser.save();
  }

  async signIn(@Body() body): Promise<any> {
    const { sdt, password } = body;
    const existedUser = await this.userModel.findOne({ sdt }).exec();
    if (
      existedUser &&
      (await isMatchPassword(password, existedUser.password))
    ) {
      console.log(existedUser);
      const payload = { sdt: existedUser.sdt, fullname: existedUser.fullname };

      const toObject = existedUser.toObject();
      delete toObject.password;
      delete toObject._id;

      return {
        accessToken: this.jwt.sign(payload, { expiresIn: '10h' }),
        user: toObject,
      };
    } else {
      throw new UnauthorizedException(
        'Tài khoản hoặc mật khẩu không chính xác',
      );
    }
  }

  async createAdmin(): Promise<any> {
    const hash = await hashPassword('Duongbui@123');

    const createdUser = new this.userModel({
      sdt: '999999999',
      password: hash,
      fullname: 'Admin hệ thống',
      role: 'ADMIN',
    });
    return await createdUser.save();
  }
  async getMyProfile(req): Promise<any> {
    return req.user;
  }

  async updateMyProfile(req): Promise<any> {
    const { public_id, url } = req.body?.image;
    console.log(
      '🚀 ~ file: user.service.ts:86 ~ UserService ~ updateMyProfile ~ public_id:',
      public_id,
    );
    let newAvatar;
    if (!public_id) {
      console.log(req.user?.avatar?.public_id);
      if (req.user?.avatar?.public_id) {
        await this.cloundinary.deleteImages([req.user?.avatar]);
      }
      newAvatar = await this.cloundinary.uploadImages([url]);
    }
    return await this.userModel
      .findByIdAndUpdate(req.user._id, {
        fullname: req.body.fullname,
        avatar: !public_id ? newAvatar[0] : req.user.avatar,
      })
      .exec();
  }

  async listAllUser() {
    return await this.userModel
      .find({ userId: { $ne: 0 } })
      .sort({ createdAt: 'desc' })
      .exec();
  }
}
