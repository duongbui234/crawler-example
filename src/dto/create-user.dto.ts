import { IsString, MinLength, Matches, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly sdt: string;

  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])^[\S].+$/, {
    message:
      'Mật khẩu phải có ít nhất 1 ký tự viết hoa, 1 ký tự số và 1 ký tự đặc biệt',
  })
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  readonly fullname: string;
}
