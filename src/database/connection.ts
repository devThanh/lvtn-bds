import { DataSource } from "typeorm"
import 'reflect-metadata'
import { User } from "../modules/user/entities/user.model"
import { Admin } from "../modules/user/entities/admin.model"
import { News } from "../modules/news/entities/news.model"
import { Real_Easte_News } from "../modules/real_easte_news/entities/real_easte_news.model"
import { Category } from "../modules/real_easte_news/entities/category.model"
import { Info_Real_Easte } from "../modules/real_easte_news/entities/info_real_easte.model"
import { Image_Real_Easte } from "../modules/real_easte_news/entities/image_real_easte.model"
import { Payment } from "../modules/payment/entities/payment.model"
import { Comment } from "../modules/comment/entities/comment.model"
import { Liked } from "../modules/comment/entities/like.model"

export class ConnectDB {
    static AppDataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        entities: [User, Admin, News, Real_Easte_News, Category, Info_Real_Easte, Image_Real_Easte, Payment, Comment, Liked],
        logging: false,
        synchronize: true,
        subscribers: [],
    })
}