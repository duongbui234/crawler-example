import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Ip,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { PaymentService } from '../service/payment.service';

@Controller('/api/v1/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment-url')
  async createPaymentUrl(@Res() res, @Req() req, @Body() body, @Ip() ip) {
    console.log(ip);
    const url = await this.paymentService.createPaymentUrl(req, body);
    return res.status(HttpStatus.OK).json({
      success: true,
      data: { url },
    });
  }

  @Get('vnpay-return')
  async checkPayment(@Query() query, @Res() res) {
    await this.paymentService.checkPayment(query);
    return res.status(HttpStatus.OK).json({
      success: true,
      data: {},
    });
  }
}
