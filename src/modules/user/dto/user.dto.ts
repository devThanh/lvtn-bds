import { Exclude, Expose } from "class-transformer";
import { IsEmail, IsString, IsDateString, Length } from "class-validator";




export class UserDTO{
    @Expose()
    @IsEmail()
    email: string

    @Exclude()
    @Length(6, 32)
    password: string

    @Expose()
    @IsString()
    fullName: string

    // @Exclude()
    // @IsString()
    // avatar!: string | null

    // @Expose()
    // @IsDateString()
    // dateOfBirth: Date

    // @Expose()
    // @IsString()
    // phone: string 

    // @Expose()
    // @IsString()
    // address: string

}