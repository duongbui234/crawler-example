import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Department, DepartmentSchema } from './models/departments.schema';
import { User, UserSchema } from './models/user.schema';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { PreAuthMiddleware } from './middlewares/preauth.middleware';
import { JwtModule } from '@nestjs/jwt';
import { DepartmentController } from './controller/department.controller';
import { DepartmentService } from './service/department.service';
import { ProvinceController } from './controller/province.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    MongooseModule.forFeature([
      {
        name: Department.name,
        schema: DepartmentSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
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
    DepartmentController,
    ProvinceController,
  ],
  providers: [AppService, UserService, DepartmentService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PreAuthMiddleware).forRoutes(
      {
        path: '/api/v1/user/signup',
        method: RequestMethod.POST,
      },
      {
        path: '/api/v1/user/reset-password',
        method: RequestMethod.POST,
      },
    );
  }
}
