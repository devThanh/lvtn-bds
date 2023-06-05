import { Entity, PrimaryColumn, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity, CreateDateColumn, ManyToMany, JoinTable, BeforeInsert, BeforeUpdate } from 'typeorm'
import slugify from 'slugify';

@Entity()
export class News extends BaseEntity{
    @PrimaryGeneratedColumn("uuid")
    //@PrimaryColumn()
    id!: string

    @Column('text')
    title!: string

    @Column('text')
    content!: string

    @Column()
    thumbnail!: string

    @Column({ type: "timestamp", default: () => "now()"})
    created_date: Date

    @Column({nullable:true})
    updated_date: string

    @Column()
    author!: string

    @Column()
    description!: string

    @Column({default: 0})
    viewer: number

    @Column({ type: "text", nullable: false })
    slug: string;

    @Column()
    admin: string

    @BeforeInsert()
    @BeforeUpdate()
    generateSlug() {
      this.slug = slugify(this.title + '-' + Math.floor(Math.random() * 999999) + 1, { lower: true });
    }

}

