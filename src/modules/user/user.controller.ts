import { NextFunction, Request, Response } from 'express'
import { Errors } from '../../helpers/error'
import { ResponseWrapper } from '../../helpers/response.wrapper'
//import { UserService } from './user.service'
import { AuthService } from '../auth/auth.service'
//import { authService } from '../../service'
import { AuthRequest } from '../auth/auth.middleware'
import exp from 'constants'
import { UserService } from './user.service'
import { Multer } from 'multer'
//import { upload } from '../../helpers/multer'

export class UserController{
   userService: UserService
   authService: AuthService

   constructor(userService: UserService, authService: AuthService){
    this.userService = userService
    this.authService = authService
   }

   register = async(req: Request, res: Response, next: NextFunction)=>{
      //:Express.Multer.File
      // let file = null
      // if (req.file !== undefined) file = req.file
      try {
         const result = await this.userService.register(req.body.email,req.body.password, req.body.fullName,req.body.dateOfBirth,req.body.address, req.body.phone, req.file)
         res.send(new ResponseWrapper(result))
      } catch (error) {
         next(error)
      }
      
   }

   verify = async (req: Request, res: Response, next: NextFunction) => {
      try {
          const result = await this.userService.verifyCode(
              req.query.code,
              req.query.email
          )
          res.send(new ResponseWrapper(result))
      } catch (error) {
          next(error)
      }
   }

   login = async (req: Request, res: Response, next: NextFunction)=>{
      try {
         const result = await this.userService.login(req.body.email, req.body.password)
         res.send(new ResponseWrapper(result))
      } catch (error) {
         next(error)
      }
   }

   updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
         const result = await this.userService.updateProfile(req.email,req.body.email, req.body.password, req.body.fullName, req.body.dateOfBirth, req.body.address, req.body.phone, req.file)
         res.send(new ResponseWrapper(result))
      } catch (error) {
         next(error)
      }
   }

   changePass =async (req: AuthRequest, res: Response, next: NextFunction) => {
      console.log('SSSS: ', req.email)
      try {
         const result = await this.userService.changePass(req.email, req.body.password, req.body.newPass)
         res.send(result)
      } catch (error) {
         next(error)
      }
   }


   forgetPass =async (req: Request, res: Response, next: NextFunction) => {
      try {
         const result = await this.userService.forgetPass(req.body.email)
         res.send(new ResponseWrapper(result))
      } catch (error) {
         next(error)
      }
   }

   logout =async (req: Request, res: Response, next: NextFunction) => {
      try { req.session
         const result = await this.userService.logout(req.body.email, req.body.password, req.session)
         res.send(new ResponseWrapper(result))
      } catch (error) {
         next(error)
      }
   }

}