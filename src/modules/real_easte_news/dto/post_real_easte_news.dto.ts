import { Expose } from "class-transformer"
import { IsNumber, IsString, Max, MaxLength, Min } from "class-validator"


export class Post_Real_Easte_News{
    // @Expose()
    // @IsString()
    // id: string

    @Expose()
    @MaxLength(250)
    content: string

    @Expose()
    @MaxLength(250)
    title: string

    // @Column({nullable: true})
    // approval_date: string

    // @Column({ type: "timestamp", default: () => "now()"})
    // created_date: Date

    // @Expose()
    // @Max(31)
    // @Min(1)
    // //@IsNumber()
    // expiration_date: number

    // @Expose()
    // @Max(4)
    // @Min(1)
    // //@IsNumber()
    // type: number

    // @Exp()
    // thumbnail: string

    @Expose()
    @IsString()
    status: string

    // @Column({nullable: true})
    // admin: string

    // @Column()
    // user: string
}

