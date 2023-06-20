import slugify from "slugify";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Real_Easte_News extends BaseEntity{

    @PrimaryColumn()
    id: string

    @Column('text')
    content: string

    @Column()
    title: string

    @Column({nullable: true})
    approval_date: string

    @Column({ type: "timestamp", default: () => "now()"})
    created_date: Date

    @Column({nullable:true, type:"timestamp"})
    updated_date: string

    @Column({nullable:true})
    expiration_date: string

    @Column()
    expiration: number

    @Column()
    type: number

    @Column()
    thumbnail: string

    @Column()
    status: string

    @Column()
    category: string

    @Column({default: false})
    deleted: boolean

    @Column({nullable: true})
    isPay: string

    @Column('uuid',{nullable: true})
    admin: string

    @Column('uuid',{nullable: true})
    user: string
    

    @Column()
    slug: string

    @BeforeInsert()
    @BeforeUpdate()
    generateSlug() {
      this.slug = slugify(this.title, { lower: true });
    }
}