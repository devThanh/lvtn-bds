import { BaseEntity, Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'


@Entity()
export class Comment extends BaseEntity{
    @PrimaryGeneratedColumn("uuid")
    //@PrimaryColumn()
    id!: string

    @Column('text')
    content!: string

    @Column('text')
    name!: string

    @Column('uuid')
    user_id!: string

    @Column()
    real_easte_id!: string

    @Column({nullable: true})
    parent_comment: string


    //@CreateDateColumn()
    //@Column('datetime')
    //@Column({type: 'timestamptz'})
    @Column({ type: "timestamp", default: () => "now()"})
    created_date: Date

    @Column({nullable:true})
    updated_date: string

    @DeleteDateColumn({ type: "timestamp", select: false })
    deletedDate?: Date;

    @Column({default: 0})
    like: number

    @Column({default:0})
    totalRep:number

}