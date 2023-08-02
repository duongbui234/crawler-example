import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../models/post.schema';
import { Model } from 'mongoose';

import querystring from 'qs';
import crypto from 'crypto';
import moment from 'moment';
import { sortObject } from 'src/utils/utils';
import { User } from 'src/models/user.schema';
import {
  StatusType,
  Transaction,
  TransactionType,
} from 'src/models/transaction.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) {}

  async createPaymentUrl(req, body): Promise<any> {
    const ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    let returnUrl = '';

    const tmnCode = process.env.VNP_TMNCODE;
    const secretKey = process.env.VNP_HASHSECRET;
    let vnpUrl = process.env.VNP_URL;

    returnUrl = process.env.VNP_RETURNURL;

    const amount = body.amount;

    const orderInfo = body.orderDescription;
    const orderType = body.orderType;
    let locale = body.language;
    if (locale === null || locale === '') {
      locale = 'vn';
    }
    const currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = moment(date).format('DDHHmmss');
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_BankCode'] = 'NCB';

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });

    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    return vnpUrl;
  }

  async checkPayment(query: any, req) {
    let vnp_Params = query;

    console.log(req.user);
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const secretKey = process.env.VNP_HASHSECRET;

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    console.log(
      '🚀 ~ file: payment.service.ts:93 ~ PaymentService ~ checkPayment ~ vnp_Params:',
      vnp_Params,
    );
    if (secureHash !== signed) {
      return { code: '97' };
    }
    const { vnp_Amount, vnp_OrderInfo } = vnp_Params;
    if (vnp_Params['vnp_ResponseCode'] == '00') {
      await this.userModel
        .findOneAndUpdate(
          { sdt: req?.user?.sdt },
          { balance: req?.user?.balance + vnp_Amount / 100 },
        )
        .exec();
      await this.transactionModel.create({
        user_id: req.user._id,
        description: decodeURIComponent(vnp_OrderInfo.replace(/\+/g, '%20')),
        transaction_type: TransactionType.nap_tien,
        status: StatusType.thanh_cong,
        amount: vnp_Amount / 100,
      });

      return { code: vnp_Params['vnp_ResponseCode'] };
    }
    await this.transactionModel.create({
      user_id: req.user._id,
      description: decodeURIComponent(vnp_OrderInfo.replace(/\+/g, '%20')),
      transaction_type: TransactionType.nap_tien,
      status: StatusType.that_bat,
      amount: vnp_Amount / 100,
    });
    return { code: vnp_Params['vnp_ResponseCode'] };
  }

  async listLichSuNapTien(req) {
    const list = await this.transactionModel
      .find({
        user_id: req.user._id,
        transaction_type: TransactionType.nap_tien,
      })
      .sort({ createdAt: 'desc' })
      .exec();

    console.log(list);
    return list;
  }
  async listLichSuThanhToanGiaHan(req) {
    const list = await this.transactionModel
      .find({
        user_id: req.user._id,
        transaction_type: {
          $in: [TransactionType.thanh_toan, TransactionType.gia_han],
        },
      })
      .sort({ createdAt: 'desc' })
      .exec();

    return list;
  }

  async listAllTransaction() {
    return await this.transactionModel
      .find()
      .sort({ createdAt: 'desc' })
      .exec();
  }
}
