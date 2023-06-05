import { Expose } from "class-transformer";
import { IsEmail, Length } from "class-validator";


export class ChangePass{
    @Expose()
    @IsEmail()
    email: string

    @Expose()
    @Length(6, 32)
    password: string
}