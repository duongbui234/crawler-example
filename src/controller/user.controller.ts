import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller('/api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  async signUp(@Res() res, @Body() user: CreateUserDto) {
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
}
