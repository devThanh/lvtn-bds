import jwt from "jsonwebtoken"
import { Config } from "../../config"
import { Errors } from "../../helpers/error"
import { BaseService } from "../../service"
import dotenv from 'dotenv'
dotenv.config()


export class AuthService implements BaseService {
    signToken = async(fullname: string, email: string,type: string)=>{
        // console.log(process.env.JWT_ACCESS_TIME,process.env.JWT_ACCESS_SECRECT)
        const token = jwt.sign({fullname, email, type},process.env.JWT_ACCESS_SECRECT,
            {expiresIn:  process.env.JWT_ACCESS_TIME},)
        return token
    }

    signTokenAdmin = async( email: string)=>{
        // console.log(process.env.JWT_ACCESS_TIME,process.env.JWT_ACCESS_SECRECT)
        const token = jwt.sign({email},process.env.JWT_ACCESS_SECRECT,
            {expiresIn:  process.env.JWT_REFRESH_TIME},)
        return token
    }

    signRefreshToken = async(fullname: string, email: string,type: string)=>{
        const refreshToken = jwt.sign(
            {
                fullname, email,type
            },
            process.env.JWT_REFRESH_SECRECT,
            {expiresIn:  process.env.JWT_REFRESH_TIME},
        )
        return refreshToken
    }

    verifyToken = async (token: string) => {
        const  payload  = jwt.verify(token, process.env.JWT_REFRESH_SECRECT)
        console.log(payload)
        if (payload) {
            return {
                name: payload['fullname'] as string,
                email: payload['email'] as string,
                type: payload['type'] as string,
            }
            //console.log(userId)
        }
        throw Errors.Unauthorized

    }

    checkLogin = async (token: string) => {
        const { payload } = jwt.verify(token, process.env.JWT_REFRESH_SECRECT, {
            complete: true,
        })
        
        if (payload && payload['fullname'] && payload['email']) {
            return {
                name: payload['fullname'] as string,
                email: payload['email'] as string,
                type: payload['type'] as string,
            }
            //console.log(userId)
        }return 
        //throw Errors.Unauthorized

    }
}