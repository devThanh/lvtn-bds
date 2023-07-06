import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import redis_client, { emailQueue } from "../../../redis_connect";
import { s3Client } from "../../helpers/s3";
import { BaseService } from "../../service";
import bcrypt from "../../util/bcrypt";
import { AuthService } from "../auth/auth.service";
import { News } from "./entities/news.model";
import { Errors } from "../../helpers/error";
import moment from 'moment';
import { Admin } from "../user/entities/admin.model";
import { excuteProcedure } from "../../util/procedure";
import newsProcedure from "./news.procedure";
import { Pagination } from "../../helpers/response.wrapper";
import { ConnectDB } from "../../database/connection";
moment.locale('vn')
const dataSource = ConnectDB.AppDataSource

export class NewsService implements BaseService{
    private authService : AuthService
    constructor(authService: AuthService){
        this.authService = authService
    }

    createNews = async(title: string, content: string, thumbnail: Express.Multer.File, author: string, description: string, admin: string)=>{
        try {
            let news = new News()
            news.title = title
            news.content = content
            news.author = author
            news.description = description
            news.admin = admin
            const filename = await bcrypt.generateFileName()  
            console.log(thumbnail)         
            const bucketParams = {
                Bucket: "lvtn-bds",
                Key: filename,
                Body: thumbnail.buffer
            };
            news.thumbnail=filename
                const data = await s3Client.send(new PutObjectCommand(bucketParams));
                console.log(
                  "Successfully uploaded object: " +
                    bucketParams.Bucket +
                    "/" +
                    bucketParams.Key
                );
                console.log(news)
                const res = await news.save()
                redis_client.HSET(`${`news:`}${news.author}`, `${news.id}`, JSON.stringify(res))
                redis_client.HSET(`${`news`}`, `${news.id}`, JSON.stringify(res))
                return { message: 'CREATED NEWS SUCCESSFULLY', res }
        } catch (error) {
            console.log(error)
            throw Errors.BadRequest
        }
        
    }

    deleteNews = async (slug: string, email: string, typeUser: string) => {
        try {  
            const admin = await Admin.findOneBy({email: email})
            const result = await News.findOneBy({id: slug})
            console.log(result, admin);
            //const user = await User.findOneBy({email: email, type: typeUser})
            if(admin!==null){
                if(result!==null){
                    //result.deleted = true
                    // const deleteParams = {
                    //     Bucket: "lvtn-bds",
                    //     Key: result.thumbnail,
                    //     //Body: thumbnail.buffer
                    // }
                    
                    // const data = await s3Client.send(new DeleteObjectCommand(deleteParams))
                    // console.log(
                    //     "Successfully uploaded object: " +
                    //     deleteParams.Bucket +
                    //       "/" +
                    //       deleteParams.Key
                    //   );
                    await result.remove()
                    //const user = await User.findOneBy({id: result.user})
                    redis_client.hDel(`${`news:`}${result.author}`, `${result.id}`)           
                } else throw Errors.NotFound
            }else throw Errors.Unauthorized
        } catch (error) {
            console.log(error);
            throw Errors.BadRequest
        }
    }

    updateNews = async (email: string, slug: string, title: string, content: string, description: string, thumbnail: Express.Multer.File) => {
            console.log(slug, email)
            const news = await News.findOneBy({id: slug})
            const admin = await Admin.findOneBy({email: email})
            console.log(news, admin)
            if(admin!== null){
                console.log(123444)
                if(news!== null){
                    console.log(6666)
                    news.title = title
                    news.content = content
                    news.description = description
                    const date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
                    news.updated_date = date
                    console.log(thumbnail)
                    if(thumbnail!==undefined){
                        console.log(999)
                        const bucketParams = {
                            Bucket: "lvtn-bds",
                            Key: news.thumbnail,
                            Body: thumbnail.buffer
                        };
                        
                            //const data = await s3Client.send(new PutObjectCommand(bucketParams));
                            console.log(
                              "Successfully uploaded object: " +
                                bucketParams.Bucket +
                                "/" +
                                bucketParams.Key
                            );
                    }
                    
                        console.log(news)
                        const res = await news.save()
                        redis_client.HSET(`${`news:`}${news.author}`, `${news.id}`, JSON.stringify(res))
                        redis_client.HSET(`${`news`}`, `${news.id}`, JSON.stringify(res))
                        return { message: 'UPDATED NEWS SUCCESSFULLY', res }
                } else throw Errors.NotFound
            } else throw Errors.Unauthorized   
    }

    newsDetail = async (email: string, id: string) => {
        const check = await redis_client.hExists(`${`news`}`, `${id}`)
        if(check === true){
            const redisSearch = await redis_client.hGet(`${`news`}`, `${id}`)
            let res: News = JSON.parse(redisSearch)    
            if (res !== null ) {
                //const a =await dataSource.query(`call countview('${res.id}')`)
                //console.log(a)
                // console.log(res)
                //await excuteProcedure(newsProcedure.IncreaseView, [res.id])
                //let res: News = JSON.parse(redisSearch)
                res.viewer += 1
                const news = await News.findOneBy({id: res.id})
                news.viewer +=1
                await news.save()
                //const data = await res.save()
                //console.log(data)
                const obj = JSON.stringify(res)
                redis_client.HSET(`${`news`}`, `${res.id}`, obj)
                if (email !== undefined) {
                    //luu cac tin nguoi dung da doc vao redis neu nguoi dung co dang nhap
                    redis_client.hSet(`${email}:${`isSeen`}`, `${res.id}`, obj)
                    //2592000 = 30days
                    redis_client.expire(`${email}:${`isSeen`}`, 2592000)
                }
                const data = JSON.parse(obj)
                // const imageName = res.thumbnail
                // res.thumbnail = await getSignedUrl(
                //   s3Client,
                //   new GetObjectCommand({
                //     Bucket: "lvtn-bds",
                //     Key: imageName
                //   }),
                //   { expiresIn: 3600 }// 60*60 seconds
                // )
                return { data }
            } else {
                console.log("object");
                const news = await News.findOneBy({ id: id })
                if (news !== null ) {
                    //Load du lieu tu databse sau do chuyen thanh chuoi va gan cho bien result de them vao redis
                    const result = JSON.stringify(news)
                    redis_client.hSet(`${`news`}`, `${news.id}`, result)
                    if (email !== undefined) {
                        //luu cac tin nguoi dung da doc vao redis neu nguoi dung co dang nhap
                        redis_client.hSet(`${email}:${`isSeen`}`, `${news.id}`, result)
                        //2592000 = 30days
                        redis_client.expire(`${email}:${`isSeen`}`, 2592000)
                    }
                    //const data = await excuteProcedure(newsProcedure.IncreaseView, [id])
                    return { news }
                }
                return Errors.NotFound
            }
        }else throw Errors.NotFound
        
    }

    

    listNewsUserSeen = async (email: string, page: number, limit: number) => {
        const pagegination = new Pagination(page, limit)
        //const listNews = await redis_client.hKeys(`${email}:${`isSeen`}`)
        const item = await redis_client.HVALS(`${email}:${`isSeen`}`)
        let output = []
        for (
            let index = pagegination.getOffset();
            index < pagegination.getOffset() + limit && index < item.length;
            index++
        ) {
            output.push(JSON.parse(item[index]))
        }
        //const list = item.map((val) => JSON.parse(val))
        if (output.length === 0) throw Errors.NotFound
        return output
        // console.log(item)
        // const list = item.map((val) => JSON.parse(val))
        // if (list.length === 0) throw Errors.NotFound
        // return list
    }

    save = async (email: string, newsId: string) => {
        const redisSearch = await redis_client.hGet(
            `${email}:${`save`}`,
            `${newsId}`
        )
        if (redisSearch) {
            return { message: 'You are already save this news' }
        } else {
            const redisSearch = await redis_client.hGet(
                `${`news`}`,
                `${newsId}`
            )
            let news: News = JSON.parse(redisSearch)
            //const news = await News.findOneBy({ id: newsId })
            if (news !== null ) {
                const a = JSON.stringify(news)
                redis_client.hSet(`${email}:${`save`}`, `${news.id}`, a)
                //30days = 2592000s
                redis_client.expire(`${email}:${`save`}`, 2592000)
                return { message: 'Save this news successfully!!!' }
            } else {
                throw Errors.NotFound
            }
        }
    }

    getNewsUserSaved = async (email: string, page: number, limit: number) => {
        // const listNewsSaved = await redis_client.HKEYS(`${email}:${`save`}`)
        // let output = []
        // console.log('first: ', email, listNewsSaved)
        // const item = await redis_client.HVALS(`${email}:${`save`}`)
        // const list = item.map((val) => JSON.parse(val))
        // return list
        const pagegination = new Pagination(page, limit)
        const item = await redis_client.HVALS(`${email}:${`save`}`)
        let output = []
        for (
            let index = pagegination.getOffset();
            index < pagegination.getOffset() + limit && index < item.length;
            index++
        ) {
            output.push(JSON.parse(item[index]))
        }
        //const list = item.map((val) => JSON.parse(val))
        if (output.length === 0) throw Errors.NotFound
        return output
        // if(listNewsSaved){
    }

    search = async (search_query: string, page: number, limit: number) => {
        //let searchValue = new RegExp(search_query,'ig')
        const pagegination = new Pagination(page, limit)
        const offset = pagegination.getOffset()
        const sql = `SELECT id, title, description, thumbnail, author, viewer FROM news WHERE title LIKE N'%${search_query}%' or tags LIKE ('%${search_query}%') LIMIT ${limit} OFFSET ${offset};`
        console.log(sql)
        const data = await dataSource.query(sql)
        console.log(data)
        if (data.length !== 0) return data
        throw Errors.NotFound
    }
    //{select: ['id','viewer','totalComment']}
    statistical = async () => {
        const news = await dataSource.getRepository(News).find({
            select: [
                'id',
                'title',
                'description',
                'author',
                // 'totalComment',
                // 'like',
                'viewer',
            ],
            //where: { status: 'xuat ban' },
        })
        //const news = JSON.parse(newsa)
        if (news.length === 0) throw Errors.NotFound
        return news
    }

    getall = async (page: number,limit: number) => {
        // const pagegination = new Pagination(page, limit)
        // const offset = pagegination.getOffset()
        // //const orderExp = `comment.${column}`
        // //const listNews = await News.find({ take: limit, skip: offset })
        // const newsRepository = dataSource.getRepository(News)
        // const newsList = await newsRepository
        //     .createQueryBuilder('news')
        //     //.where('comment.newsId = :newsId', { newsId })
        //     .select(['id','title','description','author','created_date','viewer',])
        //     //.groupBy('')
        //     //.orderBy('viewer', 'DESC')
        //     //.addOrderBy('created_date','DESC')
        //     .take(limit)
        //     .offset(offset)
        //     .getMany()
        //     console.log(newsList)
        // if (newsList.length !== 0) {
        //     return newsList
        // }
        // throw Errors.NotFound

        const news = await dataSource.getRepository(News).find({
            select: [
                'id',
                'title',
                'description',
                'created_date',
                'author',
                'thumbnail',
                // 'totalComment',
                // 'like',
                'viewer',
            ],order:{viewer:"DESC", created_date:'DESC'}
            //where: { status: 'xuat ban' },
        })
        //const news = JSON.parse(newsa)
        if (news.length === 0) throw Errors.NotFound
        else{
            for (let post of news) { // For each post, generate a signed URL and save it to the post object
                const imageName = post.thumbnail
                post.thumbnail = await getSignedUrl(
                  s3Client,
                  new GetObjectCommand({
                    Bucket: "lvtn-bds",
                    Key: imageName
                  }),
                  { expiresIn: 3600 }// 60*60 seconds
                )
            }
        }
            return news
        }
    
}