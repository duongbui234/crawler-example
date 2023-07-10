import {
  Injectable,
  NestMiddleware,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';

import * as firebaseServiceAuth from 'src/config/firebaseServiceAuth2.json';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class PreAuthMiddleware implements NestMiddleware {
  private defaultApp: any;

  constructor() {
    this.defaultApp = firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(firebaseServiceAuth as any),
    });
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractTokenFromHeader(req);
    try {
      if (!token) {
        throw new UnauthorizedException();
      } else {
        const user = await this.defaultApp.auth().verifyIdToken(token);
        if (
          user.phone_number.replace('+84', '') != req.body.sdt.replace('0', '')
        ) {
          throw new NotFoundException('Số điện thoại không hợp lệ');
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
