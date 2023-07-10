import { Body, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { hashPassword, isMatchPassword } from '../utils/utils';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwt: JwtService,
  ) {}

  async signUp(@Body() createUserDto: CreateUserDto): Promise<User> {
    const { sdt, password, fullname } = createUserDto;
    const existedUser = await this.userModel.findOne({ sdt }).exec();
    if (existedUser) {
      throw new Error('Số điện thoại đã được đăng ký');
    }

    const hash = await hashPassword(password);

    const createdUser = new this.userModel({ sdt, password: hash, fullname });
    return createdUser.save();
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
      delete existedUser.password;
      delete existedUser._id;
      return {
        accessToken: this.jwt.sign(payload),
        user: existedUser,
      };
    } else {
      throw new UnauthorizedException(
        'Tài khoản hoặc mật khẩu không chính xác',
      );
    }
  }
}
