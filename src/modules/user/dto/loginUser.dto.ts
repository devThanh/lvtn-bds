import { Expose } from "class-transformer";
import { IsEmail, Length } from "class-validator";



export class UserLogin {
    @Expose()
    @IsEmail()
    email: string

    @Expose()
    @Length(6, 100)
    password: string
}