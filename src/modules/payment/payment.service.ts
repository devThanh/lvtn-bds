import moment from "moment"
import crypto from 'crypto'
import querystring from'qs'
import util from '../../util/util'
import { BaseService } from "../../service"
import { AuthService } from "../auth/auth.service"
import { Payment } from "./entities/payment.model"
import { User } from "../user/entities/user.model"
import { Errors } from "../../helpers/error"
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
            let d= Date.parse(vnp_Params['vnp_PayDate'].toString())
            let s = moment(d).format('DD/MM/YYYY HH:mm:ss')
            payment.created_date = s
            payment.real_easte_id = vnp_Params['vnp_TxnRef'].toString()
            payment.user = user.id
            await payment.save()
    
            return({code: vnp_Params['vnp_ResponseCode'], message:'success', payment})
        } else{
            return({code: '97' , message:'success'})
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