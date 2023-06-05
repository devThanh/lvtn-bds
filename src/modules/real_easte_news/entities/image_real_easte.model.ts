import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Image_Real_Easte extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('uuid', {nullable: true})
    real_easte_id: string

    @Column()
    images: string
}