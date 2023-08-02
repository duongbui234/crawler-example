import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  Get,
  Req,
  Put,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller('/api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async listAllUser(@Res() res): Promise<any> {
    const allUsers = await this.userService.listAllUser();
    return res.status(HttpStatus.OK).json({
      success: true,
      allUsers,
    });
  }

  @Post('/signup')
  async signUp(@Res() res, @Body() user: CreateUserDto): Promise<any> {
    const newUser = await this.userService.signUp(user);
    return res.status(HttpStatus.CREATED).json({
      success: true,
      newUser,
    });
  }

  @Post('/signin')
  async signIn(@Res() res, @Body() body) {
    const user = await this.userService.signIn(body);
    return res.status(HttpStatus.OK).json({
      success: true,
      user,
    });
  }

  @Post('/reset-password')
  async resetPassword(@Res() res, @Body() body) {
    await this.userService.resetPassword(body);
    return res.status(HttpStatus.OK).json({
      success: true,
    });
  }

  @Get('/create-admin')
  async createAdmin(@Res() res): Promise<any> {
    const newUser = await this.userService.createAdmin();

    return res.status(HttpStatus.CREATED).json({
      success: true,
      newUser,
    });
  }
  @Get('/my-profile')
  async getMyProfile(@Res() res, @Req() req): Promise<any> {
    const myProfile = await this.userService.getMyProfile(req);
    return res.status(HttpStatus.CREATED).json({
      success: true,
      myProfile,
    });
  }
  @Put('/update-my-profile')
  async updateMyProfile(@Res() res, @Req() req): Promise<any> {
    const myProfile = await this.userService.updateMyProfile(req);
    return res.status(HttpStatus.CREATED).json({
      success: true,
      myProfile,
    });
  }
}
