import { Expose } from "class-transformer"
import { IsInt, IsNumber, IsString, Max, MaxLength, Min, isString } from "class-validator"


export class Create_Info_Real_Easte{
    @Expose()
    @IsInt()
    @Min(1)
    acreage: number

    @Expose()
    @IsInt()
    @Min(1)
    price: number

    // @Expose()
    // status: string

    @Expose()
    @IsInt()
    @Min(1)
    number_bedrooms: number

    @Expose()
    @IsInt()
    @Min(1)
    number_bathrooms: number

    @Expose()
    @IsInt()
    @Min(1)
    number_floors: number

    @Expose()
    @IsString()
    direction: string

    @Expose()
    @IsString()
    balcony_direction: string

    @Expose()
    @IsInt()
    @Min(1)
    facade: number

    @Expose()
    @IsInt()
    @Min(1)
    road_width: number

    @Expose()
    @IsString()
    interior: string

    // @Expose()
    // address: string

    // @Expose("point")
    // location: string

    @Expose()
    @IsInt()
    @Min(1)
    length: number

    @Expose()
    @IsInt()
    @Min(1)
    width: number

    // @Expose()
    // @IsInt()
    // @Min(1)
    // total_usable_area: string
}

