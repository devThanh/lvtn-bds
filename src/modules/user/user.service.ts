import { PutObjectCommand } from "@aws-sdk/client-s3";
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import redis_client, { emailQueue, forgetPass } from "../../../redis_connect";
import { Errors } from "../../helpers/error";
import { s3Client } from "../../helpers/s3";
import { BaseService } from "../../service";
import bcrypt from "../../util/bcrypt";
import { AuthService } from "../auth/auth.service";
import { User } from "./entities/user.model";
import { Admin } from "./entities/admin.model";
import { Session } from "express-session";



export class UserService implements BaseService{
    private authService: AuthService
    constructor(authService: AuthService){
        this.authService = authService
    }

    register = async(email: string, password: string, fullname: string, dateOfBirth: string, address: string, phone: string, avatar: Express.Multer.File)=>{
        const checkEmailExist = await User.findOneBy({ email: email, type:'' })
        if (checkEmailExist !== null) {
            return { message: 'Email already existed' }
        } else {
            
            try {
                let user = new User()
            // const expression: RegExp =
            //     /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            user.email = email
            // const result: boolean = expression.test(email) // true
            // //if (result == false) return { message: 'Email is invalid' }
            const passEncoding = await bcrypt.encode(password)
            user.fullname = fullname
            user.password = passEncoding
            user.type = ''
            user.isActive = false
            //const date = new Date(dateOfBirth)
            //user.dateOfBirth=date
            //user.phone = phone
            //user.address = address    
            // let res = { email, fullname,dateOfBirth,phone,address, isActive: user.isActive }
            //res.email = user.email
            // return {
            //     message: 'Please check your mail',user
            // }
            //console.log(avatar)
            if(avatar!==undefined){
                const filename = await bcrypt.generateFileName()
                user.avatar=filename
                const bucketParams = {
                    Bucket: "lvtn-bds",
                    Key: filename,
                    Body: avatar.buffer
                };
                //user.avatar=filename
                
                    const data = await s3Client.send(new PutObjectCommand(bucketParams));
                    console.log(
                      "Successfully uploaded object: " +
                        bucketParams.Bucket +
                        "/" +
                        bucketParams.Key
                    );
            }
            await user.save()
                await emailQueue.add(
                    'Mailer',
                    { email: email },
                    { removeOnComplete: true, removeOnFail: true }
                )
            
                return {message:'Please check mail to verify your account'}
              } catch (err) {
                console.log("Error", err);
                throw Errors.BadRequest
              }
            
        }
    }

    verifyCode = async(code: any, email: any)=>{
        const user = await User.findOneBy({email: email, type:''})
        //const u = await User.find({where:{email: email}})
        //console.log(u)
        const checkCode = await redis_client.HKEYS(`${email}:${`verifyCode`}`)
        if(user!==null){
            if(user.isActive===false){
                if(checkCode.includes(code)){
                    user.isActive=true
                    await user.save()
                    await redis_client.hDel(`${email}:${`verifyCode`}`,code)
                    return {message:'Register Successfully!!'}
                }else throw Errors.VerifyCodeIsWrong
            }
            return {message:'Your account already verify'}
        }
        else throw Errors.NotFound
    }

    login = async(email: string, password: string)=>{
        const users = await User.findOneBy({ email: email, type:'' })
        const admin = await Admin.findOneBy({email: email, password: password})
        if(admin!==null){
            return admin
        }
        if (users !== null) {
            if (users.isActive === false) {
                return {
                    message: `You're account not active. Check your mail to active`,
                }
            } else {
                const decodePass = await bcrypt.decode(password, users.password)
                console.log(decodePass);
                if (decodePass) {
                    const accessToken = await this.authService.signToken(users.fullname,users.email,users.type)
                    console.log('TOKEN: ', accessToken)
                    const refreshToken =
                        await this.authService.signRefreshToken(users.fullname,users.email,users.type)
                    console.log('REFRESH_TOKEN: ', refreshToken)
                    redis_client.hSet(`${users.email}:${`access-token`}`,accessToken,1)
                    redis_client.expire(`${users.email}:${`access-token`}`, 2592000)
                    redis_client.hSet( `${users.email}:${`refresh-token`}`,refreshToken,1)
                    redis_client.expire(`${users.email}:${`refresh-token`}`,7776000)
                    const imageName = users.avatar
                    if(users.avatar!==null){

                        users.avatar = await getSignedUrl(
                            s3Client,
                            new GetObjectCommand({
                              Bucket: "lvtn-bds",
                              Key: imageName
                            }),
                            { expiresIn: 3600 }// 60*60 seconds  //Infinity
                          )
                    }
                    const data = {
                        "id" : users.id,
                        "email": users.email,
                        "fullname": users.fullname,
                        "avatar": users.avatar,
                        "dateOfBirth": users.dateOfBirth,
                        "phone": users.phone,
                        "address": users.address,
                    }
                    return {data,accessToken: accessToken,refreshToken: refreshToken,}
                } else {
                    throw Errors.WrongUsernameOrPassword
                }
            }
        } else {
            throw Errors.NotFound
        }
    }

    updateProfile = async(email: string, newEmail: string, password: string, fullname: string, dateOfBirth: string, address: string, phone: string, avatar: Express.Multer.File) => {
        const user = await User.findOneBy({email: email, type:''})
        console.log(user);
        if(user!== null){
            user.email = newEmail
            user.fullname = fullname
            const date = new Date(dateOfBirth)
            user.dateOfBirth = date
            user.address = address
            user.phone = phone
            // if(user.avatar===null){

            //     const filename = await bcrypt.generateFileName()
            //     user.avatar=filename
            // }
            if(avatar !== undefined){
                const filename = await bcrypt.generateFileName()
                user.avatar = filename
                const bucketParams = {
                    Bucket: "lvtn-bds",
                    Key: filename,
                    Body: avatar.buffer
                };
                const info = await s3Client.send(new PutObjectCommand(bucketParams));
                    console.log(
                      "Successfully uploaded object: " +
                        bucketParams.Bucket +
                        "/" +
                        bucketParams.Key
                    );
                await user.save()
                
            }
            let img: string = null
            if(user.avatar!==null){

                img = await getSignedUrl(
                    s3Client,
                    new GetObjectCommand({
                      Bucket: "lvtn-bds",
                      Key: user.avatar
                    }),
                    { expiresIn: 3600 }// 60*60 seconds
                  )
            }
            //user.avatar=filename
            const data = {
                "id" : user.id,
                "email": user.email,
                "fullname": user.fullname,
                "avatar": img,
                "dateOfBirth": user.dateOfBirth,
                "phone": user.phone,
                "address": user.address,
            }
            //await user.save()
            return data
        }else throw Errors.NotFound
    }

    changePass = async (email: string, password: string, newPass: string) => {
        const users = await User.findOneBy({ email: email, type:'' })
        if (users !== null) {
            const decodePass = await bcrypt.decode(password, users.password)
            if (decodePass == true) {
                const passEncoding = await bcrypt.encode(newPass)
                if (newPass !== password) {
                    users.password = passEncoding
                    console.log(users)
                    await users.save()
                    //delete all access-token and refresh-token user
                    redis_client.del(`${users.email}:${`access-token`}`)
                    redis_client.del(`${users.email}:${`refresh-token`}`)

                    //generate acess-token and refresh-token
                    const accessToken = await this.authService.signToken(
                        users.fullname,
                        users.email,
                        users.type
                    )
                    console.log('TOKEN: ', accessToken)
                    const refreshToken =
                        await this.authService.signRefreshToken(
                            users.fullname,
                            users.email,
                            users.type
                        )
                    console.log('ACCESS_TOKEN: ', accessToken)
                    redis_client.hSet(
                        `${users.email}:${`access-token`}`,
                        accessToken,
                        1
                    )
                    redis_client.expire(
                        `${users.email}:${`access-token`}`,
                        10*60
                    )
                    console.log('REFRESH_TOKEN: ', refreshToken)
                    redis_client.hSet(
                        `${users.email}:${`refresh-token`}`,
                        refreshToken,
                        1
                    )
                    redis_client.expire(
                        `${users.email}:${`refresh-token`}`,
                        //2592000
                        60*60*24*90
                    )
                    return { message: 'PASSWORD CHANGED SUCCCESSFULLY!!' }
                }
                throw Errors.BadRequest
            } else {
                throw Errors.WrongUsernameOrPassword
            }
        }
        throw Errors.NotFound
    }

    forgetPass =async (email: string) => {
        const expression: RegExp =
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            //user.email = email
        const result: boolean = expression.test(email) // true
        if(result === false)throw Errors.BadRequest
            //if (result == false) return { message: 'Email is invalid' }
        const generatePass = await bcrypt.generateFileName(6)
        const pass = await bcrypt.encode(generatePass)
        const user = await User.findOneBy({email: email, type:''})
        if(user!== null){
            user.password = pass
            await forgetPass.add(
                'forgetPass',
                { email: email, pass: generatePass },
                { removeOnComplete: true, removeOnFail: true }
            )
            await user.save()
            return user
        }else throw Errors.NotFound

    }

    logout = async (session: Session) => {
        session.destroy
        // console.log(email,password)
        // //const admin = await Admin.findOneBy({email: email, password: password})
        // let admin = new Admin()
        // admin.email=email
        // admin.password=password
        // await admin.save()
        // return admin
        // console.log(admin)
        // if(admin!==null){
        //     return admin
        // }throw Errors.NotFound
    }

    loginAdmin =async (email: string, pass: string) => {
        const admin = await Admin.findOneBy({email: email, password: pass})
        if(admin!==null){
            const accessToken = await this.authService.signTokenAdmin(admin.email)
                    console.log('TOKEN: ', accessToken)
                    const refreshToken =
                        await this.authService.signTokenAdmin(admin.email)
                    console.log('REFRESH_TOKEN: ', refreshToken)
                    redis_client.hSet(`${admin.email}:${`access-token`}`,accessToken,1)
                    redis_client.expire(`${admin.email}:${`access-token`}`, 2592000)
                    redis_client.hSet( `${admin.email}:${`refresh-token`}`,refreshToken,1)
                    redis_client.expire(`${admin.email}:${`refresh-token`}`,7776000)
                    return {admin,accessToken: accessToken,refreshToken: refreshToken,}
        }else throw Errors.BadRequest
    }

    createAdmin =async (email:string, password: string) => {
        const admin = new Admin()
        admin.email = email
        admin.password = password
        return await admin.save()  
    }
}

