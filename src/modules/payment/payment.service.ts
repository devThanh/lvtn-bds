import moment from "moment"
import crypto from 'crypto'
import querystring from'qs'
import util from '../../util/util'
import { BaseService } from "../../service"
import { AuthService } from "../auth/auth.service"
import { Payment } from "./entities/payment.model"
import { User } from "../user/entities/user.model"
import { Errors } from "../../helpers/error"
import { Real_Easte_News } from "../real_easte_news/entities/real_easte_news.model"
moment.locale('Asia/Ho_Chi_Minh')


export class PaymentService implements BaseService{
    private authService: AuthService
    constructor(authService: AuthService){
        this.authService = authService
    }

    createPaymentURL = async (ipAddr:any, amount:number, bankCode: string, language: string, real_easte_id: string, email: string, type: string) => {
        // let user = await User.findOneBy({email: email, type: type})
        let date = new Date()
        let createDate = moment(date).format('YYYYMMDDHHmmss')
        
        // let ipAddr = req.headers['x-forwarded-for'] ||
        //     req.connection.remoteAddress ||
        //     req.socket.remoteAddress ||
        //     req.connection.socket.remoteAddress;
    
        //let config = require('config')
        
        let tmnCode = process.env.vnp_TmnCode
        let secretKey = process.env.vnp_HashSecret
        let vnpUrl = process.env.vnp_Url
        let returnUrl = process.env.vnp_ReturnUrl
        let orderId = moment(date).format('DDHHmmss');
        //let amount = req.body.amount;
        //let bankCode = req.body.bankCode;
        
        //let locale = req.body.language;
        let locale = language;
        if(locale === null || locale === ''){
            locale = 'vn';
        }
        let currCode = 'VND';
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = real_easte_id;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho bai dang: ' + real_easte_id;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        //vnp_Params['vnp_UserID'] = user.id;
        if(bankCode !== null && bankCode !== ''){
            vnp_Params['vnp_BankCode'] = bankCode;
        }
    
        vnp_Params = util.sortObject(vnp_Params);
    
        let signData = querystring.stringify(vnp_Params, { encode: false })   
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
        return vnpUrl
        //console.log("TTTTTT: ",req.body)
        //res.redirect(vnpUrl)
    }

    vnpayReturn = async (query: querystring.ParsedQs, email: string, type: string) => {
        let user = await User.findOneBy({email: email, type: type})
        let vnp_Params = query;
        console.log(query);
        let secureHash = vnp_Params['vnp_SecureHash'];
    
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];   
        vnp_Params = util.sortObject(vnp_Params);
        let tmnCode = process.env.vnp_TmnCode
        let secretKey = process.env.vnp_HashSecret
        let signData = querystring.stringify(vnp_Params, { encode: false });     
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");       
        if(secureHash === signed){
            //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
            let payment = new Payment()
            payment.id = vnp_Params['vnp_TransactionNo'].toString()
            payment.price = vnp_Params['vnp_Amount'].toString()
            payment.bank = vnp_Params['vnp_BankCode'].toString()
            payment.content = vnp_Params['vnp_OrderInfo'].toString() 
            payment.code_transaction = vnp_Params['vnp_TransactionNo'].toString()
            let s= vnp_Params['vnp_PayDate'].toString()
            // let ad = moment(d).zone('GMT+7').format('DD-MM-YYYY HH:mm')
            // let d = moment(d).format('DD/MM/YYYY HH:mm:ss')
            let date = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)} ${s.slice(8, 10)}:${s.slice(10,12)}:${s.slice(12,14)}`
            payment.created_date = date
            payment.status = 'success'
            payment.real_easte_id = vnp_Params['vnp_TxnRef'].toString()
            const real_easte_id = vnp_Params['vnp_TxnRef'].toString()
            let real = await Real_Easte_News.findOneBy({id: real_easte_id})
            real.isPay = 'paid'
            await real.save()
            payment.user = user.id
            await payment.save()
            let param = {}
            param['cost'] = payment.price
            param['bank'] = payment.bank
            param['date'] = payment.created_date
            param['code'] = payment.code_transaction
            let url: string = 'http://localhost:3000/thanh-toan-thanh-cong'
            url += '?' + querystring.stringify(param, { encode: false });
            return url
            //return({code: vnp_Params['vnp_ResponseCode'], message:'success', payment})
        } else{
            let payment = new Payment()
            payment.id = vnp_Params['vnp_TransactionNo'].toString()
            payment.price = vnp_Params['vnp_Amount'].toString()
            payment.bank = vnp_Params['vnp_BankCode'].toString()
            payment.content = vnp_Params['vnp_OrderInfo'].toString() 
            payment.code_transaction = vnp_Params['vnp_TransactionNo'].toString()
            //let d= Date.parse(vnp_Params['vnp_PayDate'])
            //let s = moment(d).format('DD/MM/YYYY HH:mm:ss')
            //let d = moment(vnp_Params['vnp_PayDate'].toString()).format('YYYY-MM-DD HH:mm:ss')
            console.log(vnp_Params['vnp_PayDate'].toString());
            payment.created_date = vnp_Params['vnp_PayDate'].toString()
            payment.status = 'fail'
            payment.real_easte_id = vnp_Params['vnp_TxnRef'].toString()
            const real_easte_id = vnp_Params['vnp_TxnRef'].toString()
            payment.user = user.id
            let real = await Real_Easte_News.findOneBy({id: real_easte_id})
            real.isPay = 'unpaid'
            await real.save()
            await payment.save()
            return({code: '97' , message:'fail'})
        }
        //console.log("SSSS: ",req.query)
    }

    getAllPayment = async () => {
        const payment = await Payment.find({})
        return payment
    }

    getPayment =async (paymentId: string) => {
        const payment = await Payment.findOneBy({id: paymentId})
        if(payment!==null){
            return payment
        }else throw Errors.NotFound
    }
    
    
}
