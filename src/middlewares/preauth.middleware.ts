import {
  Injectable,
  NestMiddleware,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as firebaseAdmin from 'firebase-admin';

import * as firebaseServiceAuth from 'src/config/firebaseServiceAuth2.json';
import { NextFunction, Request, Response } from 'express';

const json = {
  type: 'service_account',
  project_id: 'datn-2df88',
  private_key_id: '4a3466085fcec7cf230d2d81bc78b7ab6700b720',
  private_key:
    '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCoocfg5IC1pRrn\nS4jJ8WMK4UvSgqSHDOmpyzJsE7nH/IELnTO0rS0bG0wUJf+4qD0Tjln82DWevQk2\nUYgsAIV4KFMEFH70kwY3joLBAJa2I17/rbwQY50FXkSArSwpJMEZ4VZQxR5H6g7p\n5RaaN7lOS2hlDIOIWI4x+BOKBpdTpBNOPVnmH1BkMk916utdRoLHVH3Bcise30eP\na8hLkLABOjsBK9xhjRt3xnJqUmKNSQ2u/3IJHg4MvMj8CKtEQQM3dDZ0WquFZ4iT\ni9/heNv+T8FXooM7/Wf33LEg8PyCThcYFE8XnS21C99pTX99Nfqjk4hYwl9fVuaj\ngpb4U3aVAgMBAAECggEAAybA1kBW8m4TNmLYO9PlwrCKqvSzj+2LGVf5iYEF3gmn\nPLkTnAsHdoP4VEEQihokyA6HOn0s5VpJh4kXByF8XQ493OvoInhz64pfga1Z463+\nCr+rrc+6wbytAY2a72rnK+1k4E4KvpPOcwsLtNaZQTASE59b/uqOv7rP3Kq6Xb8B\ns+1P09xrGTZKm0FzOLATJ+1yeMdXOAIPVCbWym7ernDMqAyyeCvyXOKlADElNsMe\nBjUK6/T9A8zddG3wdnYmFxIkLDrhE8oxGt/M8lTb9dgAdYzS8jcuV5BjbyWlCGBp\nIMZS24I5mpsDXfBV95NigalSuU7KLckGthUSVTdaiQKBgQDT3KbYCVOzi5zGq/bS\nHzuNfMqTKGKOwV0eOMo7iQ+aT750e/ajXB1A7ekeIJxoNd46EvCJQRr48AiG7mp0\nLRZ0dAeSaKogOlHiYl5pdvaXCsULrQW/LZvfm4pNzKsWiZ+binsiC3oZmWwM2zhE\nnXnfratcEsN5j8IjMyqSqa8diQKBgQDLw4WF9F0MYmexHs4CU1p4tqJJ3WXwAXr7\n/RUL8fiRvECMtHo/lKJ7ao/bqfzAaM0p+PRjh5mIORqgJ/oaXuPK99cw9ByLXMuS\nonzFjj1wpZWetyWSWlWAeJieryEFRJ7o1UA1maC6yUwdZR/bhquF6wVoZGfUZOJ3\n2sgSCuE5rQKBgQC03DoGVTgCH14v8B+d0xHYwD6DD8fLTGD86sghuOj797WD5Utw\nu7Mxeag3kulSwSG7++0hjtXCy87LuX5hPRhdQ6wvHXCWYJMEqqskZ20tFgGO7R7p\nzLqzUinoLp+jdsstUjO5pYiPj/zAoOhREwo2nCCcUlxTSxkVSZm/aGHY2QKBgCYa\nPrqo0kmBkUBGsWEv8wgFpt1HIEu8CyJZ1fiw27lsyWlGSmHfSm7no1UBOXlFX7AM\nlK6T6brWassuDo+l1NTceYn26+uHg6284rYSfhy1agAO4WC3satfYbKyrusMRObn\nEaW0P6EOCUSp50YmraZSJ2W4+M13u/2LlMQC8tDVAoGBAMYWzIPvBbio9GEEB02R\nFbcTNTjt+QtvEBDVdrAlbJu+5+f9M0TwglQ7VNF5YHKzNz+6anS/3pQER/xfS3H+\niSfo7JIznP1McrziuzzcMsqc2D5DCeWog868/Gcmh3bjnhZVAkoUKsb+mDxldOFB\nVHp5rTjQM7Rw6G+zuHsPz4EH\n-----END PRIVATE KEY-----\n',
  client_email: 'firebase-adminsdk-iy50q@datn-2df88.iam.gserviceaccount.com',
  client_id: '112309578076232738869',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-iy50q%40datn-2df88.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com',
} as any;

@Injectable()
export class PreAuthMiddleware implements NestMiddleware {
  private defaultApp: any;

  constructor() {
    this.defaultApp = firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(json),
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
