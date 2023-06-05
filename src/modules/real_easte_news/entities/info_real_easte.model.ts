import { BaseEntity, Column, Entity, Index, Point, PrimaryGeneratedColumn } from "typeorm";
import { Geometry} from 'geojson'

@Entity()
export class Info_Real_Easte extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    real_easte_id: string
    
    @Column()
    acreage: number

    @Column('numeric')
    price: number

    @Column()
    status: string

    @Column()
    number_bedrooms: number

    @Column()
    number_bathrooms: number

    @Column()
    number_floors: number

    @Column()
    direction: string

    @Column()
    balcony_direction: string

    @Column()
    facade: number

    @Column()
    road_width: number

    @Column()
    interior: string

    @Column()
    address: string

    @Column("point")
    location: string

    // @Index({ spatial: true })
    // @Column({
    //     type: 'Point',
    //     spatialFeatureType: 'Point', 
    //     srid: 4326,
    //     nullable: true,
    // })
    //location:Point

    @Column()
    length: number

    @Column()
    width: number

    @Column()
    total_usable_area: string

    @Column()
    ward: string

    @Column()
    district: string

    @Column()
    city: string

    @Column('uuid', {nullable:true})
    user: string

    

}