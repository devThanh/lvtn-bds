import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";


@Entity()
export class Payment extends BaseEntity{
    @PrimaryColumn()
    id: string

    @Column()
    code_transaction: string

    @Column()
    price: string

    @Column()
    bank: string

    @Column()
    content: string

    @Column()
    created_date: string
    
    @Column()
    real_easte_id: string

    @Column()
    user: string

}