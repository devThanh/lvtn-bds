import {Entity,PrimaryColumn,Column,BaseEntity, PrimaryGeneratedColumn} from 'typeorm'
import { Exclude } from 'class-transformer'

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string


    @Column()
    email: string


    @Column()
    password: string

    @Column({nullable: true})
    fullname: string

    @Column({nullable:true})
    avatar!: string | null

    @Column({type:"timestamp", nullable: true})
    dateOfBirth: Date

    @Column({nullable: true})
    phone: string 

    @Column({nullable: true})
    address: string

    @Column()
    isActive: boolean

    @Column({default: ''})
    type: string
}
