
import express from 'express'
import { AuthService } from '../auth/auth.service'
import { UserController } from './user.controller'
import { userService } from '../../service'
import { AuthMiddleware } from '../auth/auth.middleware'
import { UserMiddleware } from './user.middleware'
import {  upload } from '../../helpers/multer'
export const userRouter = express.Router()
import passport from "passport"
import { NextFunction, Request, Response } from 'express'

const authService = new AuthService()
//const userMiddleware = new UserMiddleware()
const authMiddleware = new AuthMiddleware(authService)
const userController = new UserController(userService, authService)
const userMiddleware = new UserMiddleware()

userRouter.get('/user/auth/failure', (req:Request, res: Response)=>{
    // const a = req.user
    // res.send(a)
    res.send('failure')
})
userRouter.get('/auth/success', (req:Request, res: Response)=>{
    //res.send('success')
    const a = req.user
    const b = a['user'].avatar.replaceAll('/','\\')
    console.log(a['user'].id, a['user'].fullname, a['user'].avatar, a['refreshtoken'], a['accesstoken']);
    //res.render('http://localhost:3000/', req.user)
    res.redirect(`http://localhost:3000/fb-gg/${a['user'].id}/${a['user'].fullname}/${b}/${a['accesstoken']}/${a['refreshtoken']}`)
})
userRouter.get('/google',passport.authenticate("google", {scope: ["email", "profile"],}));
userRouter.get('/google/callback',passport.authenticate('google',{
    successRedirect: '/user/auth/success',
    failureRedirect: '/user/auth/failure'
}), (req: Request, res: Response)=>{res.send(req.user)}
)

userRouter.get('/facebook',passport.authenticate("facebook", {scope: ['email'],}));
userRouter.get('/facebook/callback',passport.authenticate('facebook', {
        successRedirect: '/user/auth/success',
        failureRedirect: '/user/auth/failure'
    }), (req: Request, res: Response)=>{res.send(req.user)}
)
userRouter.post('/sign-in',upload.single('avatar'), userMiddleware.validateSignIn,  userController.register)
userRouter.get('/verify', userController.verify)
userRouter.post('/login', userMiddleware.validateLogin, userController.login)
userRouter.put('/update', authMiddleware.authorize, upload.single('avatar'), userMiddleware.valdidateUpdateProfileUser, userController.updateProfile)
userRouter.put('/changepass', authMiddleware.authorize, userMiddleware.validateChangePass, userController.changePass)
userRouter.put('/forgetpass', userController.forgetPass)
userRouter.get('/logout', userController.logout)
userRouter.post('/create-admin', userMiddleware.validateAdmin, userController.createAdmin)
userRouter.post('/login-admin', userMiddleware.validateAdmin, userController.loginAdmin)
