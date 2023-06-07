import { Expose } from "class-transformer"
import { IsDateString, IsEmail, IsString } from "class-validator"


export class UpdateProfileUser{
    @Expose()
    @IsEmail()
    email: string

    // @Exclude()
    // @Length(6, 32)
    // password: string

    @Expose()
    @IsString()
    fullName: string

    // @Expose()
    // @IsString()
    // avatar!: string | null

    @Expose()
    @IsDateString()
    dateOfBirth: Date

    @Expose()
    @IsString()
    phone: string 

    @Expose()
    @IsString()
    address: string
}