import { NextFunction, Request, Response } from "express";
import { UserDTO } from "./dto/user.dto";
import { validate, ValidationError } from "class-validator";
import { ResponseWrapper } from '../../helpers/response.wrapper';
import { UserLogin } from "./dto/loginUser.dto";
import { UpdateProfileUser } from "./dto/updateProfileUser.dto";
import { ChangePass } from "./dto/changePass.dto";
import { AuthRequest } from "../auth/auth.middleware";



export class UserMiddleware{
    validateSignIn = async(req: Request, res: Response, next:NextFunction)=>{
      console.log(req.body)
        let user = new UserDTO()
        user.email = req.body.email
        user.password = req.body.password
        user.fullname = req.body.fullname
        //user.address = req.body.address
        //user.phone = req.body.phone
        //user.avatar = req.file.originalname
        //user.dateOfBirth = req.body.dateOfBirth
        validate(user).then(errors => {
          // errors is an array of validation errors
          if (errors.length > 0) {
            console.log('validation failed. errors: ', errors);
            return res.send(new ResponseWrapper({message:"validation failed. errors: ", errors}))
          } else {
            console.log('validation succeed');
            next()
          }
        });
    }

    validateLogin = async(req: Request, res: Response, next: NextFunction)=>{
        let user = new UserLogin()
        user.email = req.body.email
        user.password = req.body.password
        validate(user).then(errors => {
            // errors is an array of validation errors
            if (errors.length > 0) {
              console.log('validation failed. errors: ', errors);
              return res.send(new ResponseWrapper({message:"validation failed. errors: ", errors}))
            } else {
              console.log('validation succeed');
              next()
            }
          });
    }

    valdidateUpdateProfileUser = async (req: Request, res: Response, next: NextFunction) => {
        let user = new UpdateProfileUser()
        user.email = req.body.email
        user.fullname = req.body.fullname
        user.address = req.body.address
        user.dateOfBirth = req.body.dateOfBirth
        user.phone = req.body.phone
        //user.avatar = req.body.avatar
        validate(user).then(errors => {
            // errors is an array of validation errors
            if (errors.length > 0) {
              console.log('validation failed. errors: ', errors);
              return res.send(new ResponseWrapper({message:"validation failed. errors: ", errors}))
            } else {
              console.log('validation succeed');
              next()
            }
          });
    }

    validateChangePass =async (req: AuthRequest, res: Response, next: NextFunction) => {
        let user = new ChangePass()
        user.email = req.email
        user.password = req.body.password
        validate(user).then(errors => {
            // errors is an array of validation errors
            if (errors.length > 0) {
              console.log('validation failed. errors: ', errors);
              return res.send(new ResponseWrapper({message:"validation failed. errors: ", errors}))
            } else {
              console.log('validation succeed');
              next()
            }
          });
    }
}