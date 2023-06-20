import { NextFunction, Request, Response } from "express";
import { AuthService } from "../auth/auth.service";
import { PaymentService } from "./payment.service";
import { ResponseWrapper } from "../../helpers/response.wrapper";
import { AuthRequest } from "../auth/auth.middleware";


export class PaymentController{
    paymentService: PaymentService
    authService: AuthService
    constructor(paymentService: PaymentService, authService: AuthService){
        this.paymentService = paymentService
        this.authService = authService
    }

    createPaymentURL = async (req: AuthRequest, res: Response, next: NextFunction) => {
        let ipAddr = req.headers['x-forwarded-for'] 
        try {
            const result = await this.paymentService.createPaymentURL(ipAddr, req.body.amount, req.body.bankCode, req.body.language, req.body.real_easte_id, req.email, req.type)
            
            console.log(result);//res.send(new ResponseWrapper(result))
            res.send(new ResponseWrapper(result))
            //res.redirect(result)
        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    vnpayReturn = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = this.paymentService.vnpayReturn(req.query,req.email, req.type)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    getAllPayment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.paymentService.getAllPayment()
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    getPayment =async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.paymentService.getPayment(req.params.paymentId)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }
}