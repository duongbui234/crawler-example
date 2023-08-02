import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { User, UserSchema } from './models/user.schema';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { PreAuthMiddleware } from './middlewares/preauth.middleware';
import { JwtModule } from '@nestjs/jwt';
import { PostController } from './controller/post.controller';
import { PostService } from './service/post.service';
import { ProvinceController } from './controller/province.controller';
import { Transaction, TransactionSchema } from './models/transaction.schema';
import { Post, PostSchema } from './models/post.schema';
import { ProtectedMiddleware } from './middlewares/protected.middleware';
import { TransactionController } from './controller/transaction.controller';
import { TransactionService } from './service/transaction.service';
import { Counter, CounterSchema } from './models/counter.schema';
import { CloudinaryService } from './service/cloudinary.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    MongooseModule.forFeature([
      {
        name: Counter.name,
        schema: CounterSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),

    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: Transaction.name,
        schema: TransactionSchema,
      },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '2h' },
    }),
  ],
  controllers: [
    AppController,
    UserController,
    PostController,
    ProvinceController,
    TransactionController,
  ],
  providers: [
    AppService,
    UserService,
    PostService,
    TransactionService,
    CloudinaryService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PreAuthMiddleware)
      .forRoutes(
        {
          path: '/api/v1/user/signup',
          method: RequestMethod.POST,
        },
        {
          path: '/api/v1/user/reset-password',
          method: RequestMethod.POST,
        },
      )
      .apply(ProtectedMiddleware)
      .forRoutes(
        TransactionController,
        {
          path: '/api/v1/user/my-profile',
          method: RequestMethod.GET,
        },
        {
          path: '/api/v1/user/update-my-profile',
          method: RequestMethod.PUT,
        },
        {
          path: '/api/v1/post/filter-by-status',
          method: RequestMethod.POST,
        },
        {
          path: '/api/v1/post',
          method: RequestMethod.POST,
        },
        {
          path: '/api/v1/post/admin/all',
          method: RequestMethod.POST,
        },
        {
          path: '/api/v1/post/admin/accept',
          method: RequestMethod.POST,
        },
        {
          path: '/api/v1/post/:postId',
          method: RequestMethod.POST,
        },
        {
          path: '/api/v1/post/update-my-post',
          method: RequestMethod.PUT,
        },
        {
          path: '/api/v1/post/update-hidden-status',
          method: RequestMethod.PUT,
        },
        {
          path: '/api/v1/post/pay',
          method: RequestMethod.POST,
        },
        {
          path: '/api/v1/post/my-post',
          method: RequestMethod.GET,
        },
        {
          path: '/api/v1/post/my-post/:postId',
          method: RequestMethod.GET,
        },
      );
  }
}
