import slugify from "slugify";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Category extends BaseEntity{

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    type: boolean

    @Column({ type: "text", nullable: false })
    slug: string;

    @BeforeInsert()
    @BeforeUpdate()
    generateSlug() {
      this.slug = slugify(this.name);
    }
}