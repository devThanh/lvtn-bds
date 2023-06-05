import express from 'express'
import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'
import { AuthService } from '../auth/auth.service'
import { AuthMiddleware } from '../auth/auth.middleware'

export const paymentRouter = express.Router()

const authService = new AuthService()
const authMiddleware = new AuthMiddleware(authService)
const paymentService = new PaymentService(authService)
const paymentController = new PaymentController(paymentService, authService)


paymentRouter.post('/create_payment_url', authMiddleware.authorize, paymentController.createPaymentURL)
paymentRouter.get('/vnpay_return', paymentController.vnpayReturn)
paymentRouter.get('/:paymentId', paymentController.getPayment)
paymentRouter.get('/', paymentController.getAllPayment)