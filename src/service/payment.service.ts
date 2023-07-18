import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Department } from '../models/departments.schema';
import { Model } from 'mongoose';
import dayjs from 'dayjs';
import sortObject from 'sortobject';

import querystring from 'qs';
import crypto from 'crypto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Department.name) private department: Model<Department>,
  ) {}

  async createPaymentUrl(req, body): Promise<any> {
    const ipAddr = req.ip;
    console.log(ipAddr);
    let returnUrl = '';

    const tmnCode = process.env.VNP_TMNCODE;
    const secretKey = process.env.VNP_HASHSECRET;
    let vnpUrl = process.env.VNP_URL;

    returnUrl = `${process.env.DOMAIN}/api/v1/payment/vnpay-return`;

    const createDate = dayjs().format('YYYYMMDDHHmmss');
    const orderId = dayjs().format('HHmmss');
    const amount = body.amount;
    console.log(process.env);

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
    vnp_Params['vnp_TmnCode'] = 'FW10MR3G';
    // vnp_Params['vnp_Merchant'] = ''
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_BankCode'] = 'NCB';
    // if (bankCode !== null && bankCode !== '') {
    // }

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });

    const hmac = crypto.createHmac(
      'sha512',
      'BVLUNEJJODMFVMCENZDESSCJKSHMJKLB',
    );
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    console.log(vnpUrl);
    return vnpUrl;
  }

  async checkPayment(query): Promise<any> {
    console.log(query);

    const vnp_Params = query?.vnp_Params;

    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const tmnCode = process.env.VNP_TMNCODE;
    const secretKey = 'process.env.VNP_HASHSECRET';

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      return { code: vnp_Params['vnp_ResponseCode'] };
    } else {
      return { code: '97' };
    }
  }
}
