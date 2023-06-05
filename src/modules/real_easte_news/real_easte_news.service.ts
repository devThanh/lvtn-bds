import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../helpers/s3";
import { BaseService } from "../../service";
import bcrypt from "../../util/bcrypt";
import addDay from "../../util/addDay";
import { AuthService } from "../auth/auth.service";
import { Real_Easte_News } from "./entities/real_easte_news.model";
import { Errors } from "../../helpers/error";
import { User } from "../user/entities/user.model";
import redis_client, { emailQueue, expirationRealEasteNews } from "../../../redis_connect";
import { Admin } from "../user/entities/admin.model";
import moment from 'moment';
import { Pagination } from "../../helpers/response.wrapper";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Category } from "./entities/category.model";
import {geocoder} from '../../helpers/geocoder'
import { Info_Real_Easte } from "./entities/info_real_easte.model";
import { Image_Real_Easte } from "./entities/image_real_easte.model";
import querystring from 'qs'
import crypto from 'crypto'
import { Multer } from "multer";
import { ConnectDB } from "../../database/connection";
import { excuteProcedure } from "../../util/procedure";
import real_easte_newsProcedure from "./real_easte_news.procedure";
import { SchemaFieldTypes } from "redis";
import util from "../../util/util";
import { Between, Like, getRepository } from "typeorm";
moment.locale('vn')
const dataSource = ConnectDB.AppDataSource

export class RealEasteNews implements BaseService{
    private authService: AuthService
    constructor(authService: AuthService){
        this.authService = authService
    }

    postRealEasteNews = async (id: string, email: string, typeUser: string, content: string, title: string, expiration: number, type: number,status: string, category: string, thumbnail: Express.Multer.File) => {
        try {           
            console.log(content);
            const newsEaste = new Real_Easte_News()
            newsEaste.id = id
            //newsEaste.id = Date.now().toString()
            newsEaste.content = content
            newsEaste.title = title
            newsEaste.expiration = expiration
            newsEaste.status = ''
            newsEaste.type = type
            newsEaste.category = category
            const user = await User.findOneBy({email:email, type: typeUser})
            newsEaste.user = user.id
            if(thumbnail!==undefined){
                const filename = await bcrypt.generateFileName()
                newsEaste.thumbnail = filename
                // const bucketParams = {
                //     Bucket: "lvtn-bds",
                //     Key: filename,
                //     Body: thumbnail.buffer
                // };
                // const data = await s3Client.send(new PutObjectCommand(bucketParams))
                //     console.log(
                //       "Successfully uploaded object: " +
                //         bucketParams.Bucket +
                //         "/" +
                //         bucketParams.Key
                //     );
            }else newsEaste.thumbnail = ''
            // redis_client.HSET(`${`real-estate-news`}`,newsEaste.id,JSON.stringify(newsEaste))
            // redis_client.HSET(`${email}:${`real-estate-news`}`,newsEaste.id,JSON.stringify(newsEaste))
            
            return await newsEaste.save()
        } catch (error) {
            console.log(error);
            throw Errors.BadRequest
        }
    }


    editRealEasteNews = async (id: string, email: string, typeUser: string, content: string, title: string, expiration_date: number, type: number,status: string, category: string, thumbnail: Express.Multer.File) => {
        try {  
            const result = await Real_Easte_News.findOneBy({id: id})
            const user = await User.findOneBy({email: email, type: typeUser})
            if(result!==null && result.user === user.id){
                console.log(content);
                //const newsEaste = new Real_Easte_News()
                //newsEaste.id = Date.now().toString()
                result.content = content
                result.title = title
                const date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
                result.updated_date = date
                result.category= category
                //newsEaste.expiration_date = expiration_date
                //newsEaste.status = status
                //newsEaste.type = type
                const user = await User.findOneBy({email:email, type: typeUser})
                //newsEaste.user = user.id
                if(thumbnail!==undefined){
                    //const filename = await bcrypt.generateFileName()
                    //newsEaste.thumbnail = filename
                    // const bucketParams = {
                    //     Bucket: "lvtn-bds",
                    //     Key: newsEaste.thumbnail,
                    //     Body: thumbnail.buffer
                    // };
                    // const data = await s3Client.send(new PutObjectCommand(bucketParams))
                    //     console.log(
                    //       "Successfully uploaded object: " +
                    //         bucketParams.Bucket +
                    //         "/" +
                    //         bucketParams.Key
                    //     );
                }
                //redis_client.HSET(`${}`,``,``)
                return await result.save()
            } else throw Errors.NotFound
        } catch (error) {
            console.log(error);
            throw Errors.BadRequest
        }
    }

    hiddenRealEasteNews = async (id: string, email: string, typeUser: string, content: string, title: string, expiration_date: number, type: number,status: string, thumbnail: Express.Multer.File) => {
        try {  
            const result = await Real_Easte_News.findOneBy({id: id})
            const user = await User.findOneBy({email: email, type: typeUser})
            if(result!==null && result.user === user.id && result.deleted === false){
                result.deleted = true
                await result.save()
                // console.log(content);
                // const newsEaste = new Real_Easte_News()
                // newsEaste.id = Date.now().toString()
                // newsEaste.content = content
                // newsEaste.title = title
                // newsEaste.expiration_date = expiration_date
                // newsEaste.status = status
                // newsEaste.type = type
                // const user = await User.findOneBy({email:email, type: typeUser})
                // newsEaste.user = user.id
                // if(thumbnail!==undefined){
                //     //const filename = await bcrypt.generateFileName()
                //     //newsEaste.thumbnail = filename
                //     // const bucketParams = {
                //     //     Bucket: "lvtn-bds",
                //     //     Key: newsEaste.thumbnail,
                //     //     Body: thumbnail.buffer
                //     // };
                //     // const data = await s3Client.send(new PutObjectCommand(bucketParams))
                //     //     console.log(
                //     //       "Successfully uploaded object: " +
                //     //         bucketParams.Bucket +
                //     //         "/" +
                //     //         bucketParams.Key
                //     //     );
                // }
                // //redis_client.HSET(`${}`,``,``)
                // return await newsEaste.save()
                return {message:'Hidden successfully!!'}
            } else throw Errors.NotFound
        } catch (error) {
            console.log(error);
            throw Errors.BadRequest
        }
    }

    deleteRealEasteNews = async (id: string, email: string, typeUser: string, content: string, title: string, expiration_date: number, type: number,status: string, thumbnail: Express.Multer.File) => {
        try {  
            const result = await Real_Easte_News.findOneBy({id: id})
            const admin = await Admin.findOneBy({email: email})
            if(result!==null && admin!== null){
                result.deleted = true
                await result.save()
                return {message:'Delete successfully!!'}
            } else throw Errors.NotFound
        } catch (error) {
            console.log(error);
            throw Errors.BadRequest
        }
    }

    getAll = async (page: number, limit: number) => {
        // const pagegination = new Pagination(page, limit)
        // const skip = pagegination.getOffset()
        // const news = await Real_Easte_News.find({select:['id', 'title', 'content', 'thumbnail'],
        //     where:{deleted: false, status: 'Release'}, skip:skip, take: limit})
        // const res: Array<Object> = []
        // const data = await Promise.all(
        //     news.map(async(element)=>{
        //         if(element.thumbnail!==''){

        //             const imageName = element.thumbnail
        //             element.thumbnail = await getSignedUrl(
        //                 s3Client,
        //                 new GetObjectCommand({
        //                   Bucket: "lvtn-bds",
        //                   Key: imageName
        //                 }),
        //                 { expiresIn: 3600 }// 60 seconds
        //               )
        //             console.log(element)
        //             res.push(element)
        //         }
        //     })
        // )
        // console.log(res)
        // return res
        const pagegination = new Pagination(page, limit)
        const skip = pagegination.getOffset()
        const news = await Real_Easte_News.find({select:['id', 'title', 'content', 'thumbnail', 'slug'],
            where:{deleted: false, status: 'Release'}, skip:skip, take: limit})
        const res: Array<Object> = []
        const data = await Promise.all(
            news.map(async(element)=>{
                const info = await Info_Real_Easte.findOneBy({real_easte_id: element.slug})
                const user = await User.findOneBy({id: element.user})
                if(element.thumbnail!==''){

                    const imageName = element.thumbnail
                    element.thumbnail = await getSignedUrl(
                        s3Client,
                        new GetObjectCommand({
                          Bucket: "lvtn-bds",
                          Key: imageName
                        }),
                        { expiresIn: 3600 }// 60 seconds
                    )
                    const data = {
                        "id":element.id,
                        "title":element.title,
                        "content":element.content,
                        "thumbnail":element.thumbnail,
                        "price":info.price,
                        "acreage":info.acreage,
                        "number_bathrooms":info.number_bathrooms,
                        "number_bedrooms":info.number_bedrooms,
                        "district":info.district,
                        "city": info.city,
                        "email":user.email,
                        "phone":user.phone,
                        "approve_date": element.approval_date
                    }
                    //console.log(element)
                    //res.push(element)
                    res.push(data)
                }
            })
        )
        console.log(res)
        return res
    }

    getByCategory = async (slug: string, page: number, limit: number) => {
        const pagegination = new Pagination(page, limit)
        const skip = pagegination.getOffset()
        const news = await Real_Easte_News.find({select:['id', 'title', 'content', 'thumbnail', 'slug'],
            where:{deleted: false, status: 'Release', category: slug}, skip:skip, take: limit})
        const res: Array<Object> = []
        const data = await Promise.all(
            news.map(async(element)=>{
                const info = await Info_Real_Easte.findOneBy({real_easte_id: element.slug})
                const user = await User.findOneBy({id: element.user})
                if(element.thumbnail!==''){

                    const imageName = element.thumbnail
                    element.thumbnail = await getSignedUrl(
                        s3Client,
                        new GetObjectCommand({
                          Bucket: "lvtn-bds",
                          Key: imageName
                        }),
                        { expiresIn: 3600 }// 60 seconds
                    )
                    const data = {
                        "id":element.id,
                        "title":element.title,
                        "content":element.content,
                        "thumbnail":element.thumbnail,
                        "price":info.price,
                        "acreage":info.acreage,
                        "number_bathrooms":info.number_bathrooms,
                        "number_bedrooms":info.number_bedrooms,
                        "district":info.district,
                        "city": info.city,
                        "email":user.email,
                        "phone":user.phone,
                        "approve_date": element.approval_date,
                        "name": user.fullname
                    }
                    //console.log(element)
                    //res.push(element)
                    res.push(data)
                }
            })
        )
        console.log(res)
        return res
    }

    

    approveRealEasteNews = async (id: string, email: string) => {
        const news = await Real_Easte_News.findOneBy({id: id, status: ''})
        const admin = await Admin.findOneBy({email: email})
        if(admin!==null){
            if(news!==null){
                news.status = 'Release'
                const date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
                news.approval_date = date
                // const dayExp = moment(moment(news.approval_date, 'YYYY-MM-DD HH:mm:ss').add(news.expiration, 'days').format('YYYY/MM/DD HH:mm:ss'))
                // news.expiration_date = dayExp.toString()
                // const d = new Date(news.approval_date);
                // const res = await addDay.addDay(d, Number(news.expiration))
                // news.expiration_date =   moment(res).format('YYYY-MM-DD HH:mm:ss')
                news.admin = email
                await news.save()
                
                //const delays = Number(news.expiration)  * 60 * 60 * 24*1000
                //console.log(delays);10000
                const delay = 60*30*1000
                await expirationRealEasteNews.add(
                    'expiration-real-easte-news',
                    { id: id },
                    { removeOnComplete: true, removeOnFail: true, delay:delay }
                )
                redis_client.HSET(`${`real-estate-news`}`,news.id,JSON.stringify(news))
                redis_client.HSET(`${email}:${`real-estate-news`}`,news.id,JSON.stringify(news))
                // try {
                //     redis_client.ft.create('idx:real-easte', {
                //         title:{
                //             type: SchemaFieldTypes.TEXT,
                //             SORTABLE: true
                //         },
                //         // ward: SchemaFieldTypes.TEXT,
                //         // district: SchemaFieldTypes.TEXT,
                //         // city: SchemaFieldTypes.TEXT,               
                //     },{
                //         ON: 'JSON',
                //         PREFIX: 'noderedis:real-easte'
                //     })
                // } catch (e) {
                //     if (e.message === 'Index already exists') {
                //         console.log('Index exists already, skipped creation.');
                //       } else {
                //         // Something went wrong, perhaps RediSearch isn't installed...
                //         console.error(e);
                //         process.exit(1);
                //       }
                // }
                await redis_client.json.set(`noderedis:real-easte:${news.id}`,'$',{title:news.title})
            }else throw Errors.BadRequest
        }else throw Errors.Unauthorized
    }


    disapproveRealEasteNews = async (id: string, email: string) => {
        const news = await Real_Easte_News.findOneBy({id: id})
        const admin = await Admin.findOneBy({email: email})
        if(admin!==null){
            if(news!==null){
                news.status = 'Disapprove'
                const date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
                news.approval_date = date
                const d = new Date(news.approval_date);
                const res = await addDay.addDay(d, Number(news.expiration))
                news.expiration_date =   moment(res).format('YYYY-MM-DD HH:mm:ss')
                news.admin = email
                const a = await news.save()
                
                //const delays = Number(news.expiration)  * 60 * 60 * 24
                //console.log(delays);
                // const delay = 10000
                // await expirationRealEasteNews.add(
                //     'expiration-real-easte-news',
                //     { id: id },
                //     { removeOnComplete: true, removeOnFail: true, delay:delay }
                //)
                const user = await User.findOneBy({id: news.user})
                redis_client.HSET(`${`real-estate-news`}`,news.id,JSON.stringify(a))
                redis_client.HSET(`${user.email}:${`real-estate-news`}`,news.id,JSON.stringify(admin))
            }else throw Errors.NotFound
        }else throw Errors.Unauthorized
    }

    createCategory = async (email: string, name: string, type: boolean) => {
        const admin = await Admin.findOneBy({email: email})
        //const category = await Category.findOneBy({id: id})
        if(admin !== null){
            const category = new Category()
            category.name = name
            category.type = type
            return await category.save()

        }else throw Errors.BadRequest

    }

    editCategory = async (email: string, cate_id: string,name: string, type: boolean) => {
        const admin = await Admin.findOneBy({email: email})
        const category = await Category.findOneBy({id: cate_id})
        console.log(category);
        if(admin !== null){
            if(category!== null){
                category.name = name
                category.type = type
                return await category.save()
                //return {message: 'Delete successfully!!'}
            }else throw Errors.NotFound
        }else throw Errors.Unauthorized

    }

    deleteCategory = async (email: string, id: string) => {
        console.log(id);
        const admin = await Admin.findOneBy({email: email})
        const category = await Category.findOneBy({id: id})
        if(admin !== null){
            if(category!== null){
                // category.name = name
                // category.type = type
                await category.remove()
                return {message: 'Delete successfully!!'}
            }else throw Errors.NotFound
        }else throw Errors.Unauthorized

    }

    createInfoRealEaste = async (real_easte_id: string, acreage: number, price: number, status: string, number_bedrooms: number, number_bathrooms: number, number_floors: number, direction: string, balcony_direction: string, facade: number, road_width: number, interior: string, address: string, length: number, width: number, total_usable_area: string, ward: string, district: string ,city: string, images:any ) =>{
        const reNews = await Real_Easte_News.findOneBy({slug: real_easte_id})
        if(reNews!==null){

            const info = new Info_Real_Easte()
            //const image = new Image_Real_Easte()
            info.real_easte_id = reNews.slug
            info.acreage = acreage
            info.price = price
            info.status = status
            info.number_bathrooms = number_bathrooms
            info.number_bedrooms = number_bedrooms
            info.number_floors = number_floors
            info.direction = direction
            info.balcony_direction = balcony_direction
            info.facade = facade
            info.road_width = road_width
            info.interior = interior
            info.length = length
            info.width = width
            info.total_usable_area = total_usable_area
            info.ward = ward
            info.district = district
            info.city = city
            const dc = `${address}${`, `}${ward}${`, `}${district}${`, `}${city}`
            info.address = dc
            const loc = await geocoder.geocode(dc);
            console.log(loc[0].longitude,loc[0].latitude);
            // info.location = {
            //     type: 'Point',
            //     coordinates: [loc[0].longitude,loc[0].latitude]
            // }
            info.location = `${loc[0].longitude}, ${loc[0].latitude}`
            info.user = reNews.user
            console.log(info);
            await info.save()
            const res = await Promise.all(
                images.map(async (item) =>{
                    const filename = await bcrypt.generateFileName()
                    const imageInfo = new Image_Real_Easte()
                    imageInfo.images = filename
                    imageInfo.real_easte_id = info.id
                    //console.log('AAA: ',item.buffer);
                    const bucketParams = {
                        Bucket: "lvtn-bds",
                        Key: filename,
                        Body: item.buffer
                    }
                    await imageInfo.save()
                    //console.log('TTTT:  ',imageInfo);
                    // const data = await s3Client.send(new PutObjectCommand(bucketParams))
                    // console.log(
                    //           "Successfully uploaded object: " +
                    //             bucketParams.Bucket +
                    //             "/" +
                    //             bucketParams.Key
                    //         )
                })
            )
            // try {
            //     redis_client.ft.create('idx:real-easte-info', {
            //         title:{
            //             type: SchemaFieldTypes.TEXT,
            //             SORTABLE: true
            //         },
            //         ward: SchemaFieldTypes.TEXT,
            //         district: SchemaFieldTypes.TEXT,
            //         city: SchemaFieldTypes.TEXT,  
            //         price: SchemaFieldTypes.NUMERIC,
            //         acreage: SchemaFieldTypes.NUMERIC         
            //     },{
            //         ON: 'JSON',
            //         PREFIX: 'noderedis:real-easte-info'
            //     })
            // } catch (e) {
            //     if (e.message === 'Index already exists') {
            //         console.log('Index exists already, skipped creation.');
            //       } else {
            //         // Something went wrong, perhaps RediSearch isn't installed...
            //         console.error(e);
            //         process.exit(1);
            //       }
            // }
            await redis_client.json.set(`noderedis:real-easte-info:${info.id}`,'$',{
                ward: ward,
                district: district,
                city: city,
                price: price,
                acreage: acreage
            })
            
            
            //console.log(images);
            return info
        }else throw Errors.NotFound
    }

    detailRealEasreNews = async (slug: string) => {
        const info = await Info_Real_Easte.findOneBy({real_easte_id: slug})
        if(info!==null){
            //const data = dataSource
            // const data = await dataSource.query(`select a.email, a.type, a.fullname, a.address, a.phone,b.slug, c.id, c.real_easte_id,c.acreage, c.price,c.status,c.number_bedrooms,c.number_bathrooms,c.number_floors,c.direction,c.balcony_direction,c.facade,c.road_width,c.interior,c.address,c.location,c.length,c.width,c.total_usable_area,c.ward,c.district,c.city,c.user, d.images from public.user a inner join real_easte_news b on a.id::uuid = b.user::uuid inner join info_real_easte c on c.real_easte_id = b.slug inner join image_real_easte d on d.real_easte_id::uuid = c.id::uuid where b.slug = 'tran-van-thanh'`)
            const data = await excuteProcedure(real_easte_newsProcedure.GetDetailRealEaste, [info.real_easte_id])
            console.log(data);
            return data
        }
    }

    searchRealEaste = async (search_query: any,page:number, limit:number) => {
        // console.log(search_query);
        // const pagegination = new Pagination(page, limit)
        // const offset = pagegination.getOffset()
        // const price = util.price(search_query.price) 
        // const acreage = util.acreage(search_query.acreage)
        // // const info = await dataSource.getRepository(Real_Easte_News)
        // //                              .createQueryBuilder('easte')
        // //                              .where('easte.title like :title', {title: `%${search_query.title}%`})
        // //                              .getMany()
        // // const info = await Real_Easte_News.find({where:{
        // //     title: Like(`%${search_query.title}%`)
        // // }})
        // const info = 
        // console.log(info);
    }



    save = async (email: string, real_easte_id: string, type: string) => {
        const user = await User.findOneBy({email: email, type: type})
        const redisSearch = await redis_client.hGet(
            `${user.id}:${`save`}`,
            `${real_easte_id}`
        )
        if (redisSearch) {
            return { message: 'You are already save this news' }
        } else {
            const redisSearch = await redis_client.hGet(
                `${`real-estate-news`}`,
                `${real_easte_id}`
            )
            let news: Real_Easte_News = JSON.parse(redisSearch)
            //const news = await News.findOneBy({ id: newsId })
            if (news !== null && news.status === 'Release') {
                const a = JSON.stringify(news)
                redis_client.hSet(`${user.id}:${`save`}`, `${news.id}`, 1)
                //30days = 2592000s
                //redis_client.expire(`${email}:${`save`}`, 2592000)
                return { message: 'Save this news successfully!!!' }
            } else {
                throw Errors.NotFound
            }
        }
    }

    getNewsUserSaved = async (email: string, type: string, page: number, limit: number) => {
        const user = await User.findOneBy({email: email, type: type})
        // const listNewsSaved = await redis_client.HKEYS(`${email}:${`save`}`)
        // let output = []
        // console.log('first: ', email, listNewsSaved)
        // const item = await redis_client.HVALS(`${email}:${`save`}`)
        // const list = item.map((val) => JSON.parse(val))
        // return list
        const pagegination = new Pagination(page, limit)
        const item = await redis_client.HKEYS(`${user.id}:${`save`}`)
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


}