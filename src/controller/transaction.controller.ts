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
import { TransactionService } from '../service/transaction.service';

@Controller('/api/v1/transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async listAllTransaction(@Res() res): Promise<any> {
    const allTrans = await this.transactionService.listAllTransaction();
    return res.status(HttpStatus.OK).json({
      success: true,
      allTrans,
    });
  }

  @Post('payment/create-payment-url')
  async createPaymentUrl(@Res() res, @Req() req, @Body() body, @Ip() ip) {
    console.log(ip);
    const url = await this.transactionService.createPaymentUrl(req, body);
    return res.status(HttpStatus.OK).json({
      success: true,
      data: { url },
    });
  }

  @Get('payment/vnpay-return')
  async checkPayment(@Query() query, @Res() res, @Req() req) {
    const result = await this.transactionService.checkPayment(query, req);
    if (result.code === 97) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Có lỗi xảy ra. Thanh toán không thành công',
      });
    }
    return res.status(HttpStatus.OK).json({
      success: true,
      data: { ...result },
    });
  }

  @Get('my-pay')
  async listPayByUid(@Res() res, @Req() req) {
    const result = await this.transactionService.listLichSuNapTien(req);
    return res.status(HttpStatus.OK).json({
      success: true,
      data: result,
    });
  }
  @Get('my-transaction')
  async listTransactionByUid(@Res() res, @Req() req) {
    const result = await this.transactionService.listLichSuThanhToanGiaHan(req);
    return res.status(HttpStatus.OK).json({
      success: true,
      data: result,
    });
  }
}
