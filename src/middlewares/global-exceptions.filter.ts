import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const httpException = exception as HttpException;

    console.log(
      '🚀 ~ file: global-exceptions.filter.ts:27 ~ GlobalExceptionsFilter ~ httpException:',
      httpException,
    );

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      // @ts-expect-error: TODO: Bắt lỗi message xử lý trong pipes
      message: httpException.message ?? httpException.getResponse().message[0],
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
