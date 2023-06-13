import { NextFunction, Request, Response } from 'express'
import { Errors } from '../../helpers/error'
import { AuthService } from './auth.service'

export interface AuthRequest extends Request {
    fullname: string
    email: string
    type: string
}

export class AuthMiddleware {
    private authService: AuthService

    constructor(authService: AuthService) {
        this.authService = authService
    }

    authorize = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers['authorization']
            const [, token] = authHeader && authHeader.split(' ')
            //console.log([, token])
            if (token == null) {
                console.log('TTTTTT')
                return next(Errors.Unauthorized)
            }
            const payload = await this.authService.verifyToken(token)
            console.log('TTTT',payload)
            req.fullname = payload.name
            req.email = payload.email
            req.type = payload.type
            next()
        } catch (error) {
            console.error(error)
            next(Errors.Unauthorized)
        }
    }

    checkLogin = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const authHeader = req.headers['authorization']
            const [, token] = authHeader && authHeader.split(' ')
            if (token == null) {
                return next()
            }
            const payload = await this.authService.checkLogin(token)
            if (!payload) next()
            else {
                //console.log("first", payload)
                req.fullname = payload.name
                req.email = payload.email
                next()
            }
        } catch (error) {
            next()
            //console.error(error)
            //next(Errors.Unauthorized)
        }
    }

   
}
