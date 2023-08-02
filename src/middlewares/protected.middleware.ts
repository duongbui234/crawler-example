import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';

import { NextFunction, Request, Response } from 'express';
import { Model } from 'mongoose';
import { User } from 'src/models/user.schema';
import { isTokenExpired } from 'src/utils/utils';

@Injectable()
export class ProtectedMiddleware implements NestMiddleware {
  constructor(
    private jwt: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async use(
    req: Request & { user: Omit<User, 'pasword'> },
    res: Response,
    next: NextFunction,
  ) {
    const token = this.extractTokenFromHeader(req);
    try {
      if (!token) {
        throw new UnauthorizedException();
      } else {
        const decoded = await this.jwt.verifyAsync(token, {
          secret: process.env.JWT_SECRET_KEY,
        });
        const user = await this.userModel
          .findOne({ sdt: decoded.sdt })
          .select('-password')
          .exec();

        req.user = user;
      }
      next();
    } catch (error) {
      console.log(
        '🚀 ~ file: protected.middleware.ts:44 ~ ProtectedMiddleware ~ error:',
        error,
      );

      next(error);
    }
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
