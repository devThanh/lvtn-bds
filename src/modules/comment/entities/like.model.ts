import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Liked extends BaseEntity{
    @PrimaryGeneratedColumn("uuid")
    //@PrimaryColumn()
    id!: string

    @Column('uuid')
    user_id: string

    @Column()
    commentId: string
}