import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../helpers/s3";
import { BaseService } from "../../service";
import bcrypt from "../../util/bcrypt";
import addDay from "../../util/addDay";
import { AuthService } from "../auth/auth.service";
import { Real_Easte_News } from "./entities/real_easte_news.model";
import { Errors } from "../../helpers/error";
import { User } from "../user/entities/user.model";
import redis_client, { emailQueue, expirationRealEasteNews, senMailerApproveQueue, senMailerDisapproveQueue, senMailerRePostQueue } from "../../../redis_connect";
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
import { title } from "process";
import { it } from "node:test";
import { Payment } from "../payment/entities/payment.model";
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
                const bucketParams = {
                    Bucket: "lvtn-bds",
                    Key: filename,
                    Body: thumbnail.buffer
                };
                const data = await s3Client.send(new PutObjectCommand(bucketParams))
                    console.log(
                      "Successfully uploaded object: " +
                        bucketParams.Bucket +
                        "/" +
                        bucketParams.Key
                    );
                    return await newsEaste.save()
            }else newsEaste.thumbnail = ''
            await newsEaste.save()
            redis_client.HSET(`${`real-estate-news`}`,newsEaste.id,JSON.stringify(newsEaste))
            redis_client.HSET(`${user.email}:${`real-estate-news`}`,newsEaste.id,JSON.stringify(newsEaste))
            return newsEaste
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
                    const filename = await bcrypt.generateFileName()
                    result.thumbnail = filename
                    const bucketParams = {
                        Bucket: "lvtn-bds",
                        Key: result.thumbnail,
                        Body: thumbnail.buffer
                    };
                    const data = await s3Client.send(new PutObjectCommand(bucketParams))
                        console.log(
                          "Successfully uploaded object: " +
                            bucketParams.Bucket +
                            "/" +
                            bucketParams.Key
                        );
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
            const admin = await Admin.findOneBy({email: email})
            //const user = await User.findOneBy({email: email, type: typeUser})
            if(result!==null && admin!==null && result.deleted === false){
                result.deleted = true
                await result.save()
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
            const user = await User.findOneBy({email: email, type: typeUser})
            if((result!==null && admin!== null) || (result!==null && user.id===result.user)){
                // result.deleted = true
                // await result.save()
                const info = await Info_Real_Easte.findOneBy({real_easte_id: result.slug})
                if(info!==null){
                    await info.remove()
                }else throw Errors.NotFound
                const usered = await User.findOneBy({id: result.user})
                console.log(usered);
                redis_client.hDel(`${usered.email}:${`real-estate-news`}`, result.id)
                redis_client.hDel(`${`real-estate-news`}`,result.id)
                await result.remove()
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
        try {
            const pagegination = new Pagination(page, limit)
        const skip = pagegination.getOffset()
        const news = await Real_Easte_News.find({
            where:{deleted: false, status: 'Release'}, skip:skip, take: limit})
        console.log('111',news);
        let res: Array<Object> = []
        const data = await Promise.all(
            news.map(async(element)=>{
                //console.log("object");
                const info = await Info_Real_Easte.findOneBy({real_easte_id: element.slug})
                console.log(info);
                const user = await User.findOneBy({id: element.user})
                console.log('222',element.slug);
                if(element.thumbnail!==''){

                    const imageName = element.thumbnail
                    element.thumbnail = await getSignedUrl(
                        s3Client,
                        new GetObjectCommand({
                          Bucket: "lvtn-bds",
                          Key: imageName
                        }),
                        { expiresIn: 3600 }// 60*60 seconds
                    )
                    let data = {
                        "real_easte_id": element,
                        "info_real_easte": info
                        // "id":element.id,
                        // "title":element.title,
                        // "content":element.content,
                        // "thumbnail":element.thumbnail,
                        // "price":info.price,
                        // "acreage":info.acreage,
                        // "number_bathrooms":info.number_bathrooms,
                        // "number_bedrooms":info.number_bedrooms,
                        // "district":info.district,
                        // "city": info.city,
                        // "email":user.email,
                        // "phone":user.phone,
                        // "approve_date": element.approval_date,
                        // "slug": element.slug
                    }
                    console.log(data);
                    res.push(data)
                }
            })
        )
        
        console.log('213 ',res)
        return res
        } catch (error) {
            console.log(error);
        }
    }

    getByCategory = async (slug: string, page: number, limit: number) => {
        const pagegination = new Pagination(page, limit)
        const skip = pagegination.getOffset()
        const news = await Real_Easte_News.find({
            where:{deleted: false, status: 'Release', category: slug}, skip:skip, take: limit})
        const res: Array<Object> = []
        const imgarr: Array<Object> = []
        const data = await Promise.all(
            news.map(async(element)=>{
                const info = await Info_Real_Easte.findOneBy({real_easte_id: element.slug})
                const user = await User.findOneBy({id: element.user})
                user.avatar = await getSignedUrl(
                    s3Client,
                    new GetObjectCommand({
                      Bucket: "lvtn-bds",
                      Key: user.avatar
                    }),
                    { expiresIn: 3600 }// 60*60 seconds
                )
                const imgInfo = await Image_Real_Easte.find({where:{real_easte_id: info.id}})
                //const imgarr: Array<Object> = []
            for (let img of imgInfo) { // For each post, generate a signed URL and save it to the post object
                const imageName = img.images
                img.images = await getSignedUrl(
                  s3Client,
                  new GetObjectCommand({
                    Bucket: "lvtn-bds",
                    Key: imageName
                  }),
                  { expiresIn: 3600 }// 60*60 seconds
                )
                imgarr.push(img)
            }
                if(element.thumbnail!==''){

                    const imageName = element.thumbnail
                    element.thumbnail = await getSignedUrl(
                        s3Client,
                        new GetObjectCommand({
                          Bucket: "lvtn-bds",
                          Key: imageName
                        }),
                        { expiresIn: 3600 }// 60*60 seconds
                    )
                    const data = {
                        "Real_Easte": element,
                        "Info": info,
                        "User": user,
                        "Images": imgarr
                        // "id":element.id,
                        // "title":element.title,
                        // "content":element.content,
                        // "thumbnail":element.thumbnail,
                        // "price":info.price,
                        // "acreage":info.acreage,
                        // "number_bathrooms":info.number_bathrooms,
                        // "number_bedrooms":info.number_bedrooms,
                        // "district":info.district,
                        // "city": info.city,
                        // "email":user.email,
                        // "phone":user.phone,
                        // "approve_date": element.approval_date,
                        // "name": user.fullname,
                        // "slug": element.slug,
                        // "type": element.type
                    }
                    //console.log(element)
                    //res.push(element)
                    res.push(data)
                }
            })
        )
        console.log("GBCT: ",res)
        return res
    }

    

    approveRealEasteNews = async (id: string, email: string) => {
        try {
            const news = await Real_Easte_News.findOneBy({id: id, status: ''})
        console.log("Real: ", news);
        const admin = await Admin.findOneBy({email: email})
        console.log(news, admin);
        //const user
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
                news.admin = admin.id
                await news.save()
                
                const delay = Number(news.expiration)*60*60*24*1000
                //console.log(delays);10000
                //const delay = 60*30*1000
                await expirationRealEasteNews.add(
                    'expiration-real-easte-news',
                    { id: id },
                    { removeOnComplete: true, removeOnFail: true, delay:delay }
                )
                const user = await User.findOneBy({id: news.user})
                const payment = await Payment.findOneBy({real_easte_id: news.id})
                await senMailerApproveQueue.add(
                    'senMailerApprove',
                    {email: user.email, real_easte_id: news.id, expiration: news.expiration, approval_date: news.approval_date, name: user.fullname, payment: payment},
                    {removeOnComplete: true, removeOnFail: true}
                )
                redis_client.HSET(`${`real-estate-news`}`,news.id,JSON.stringify(news))
                redis_client.HSET(`${user.email}:${`real-estate-news`}`,news.id, JSON.stringify(news))
                redis_client.HSET(`admin-${admin.email}:${`real-estate-news`}`,news.id, JSON.stringify(news))
            }else throw Errors.BadRequest
        }else throw Errors.Unauthorized
        } catch (error) {
            console.log(error);
        }
    }


    disapproveRealEasteNews = async (id: string, email: string) => {
        const news = await Real_Easte_News.findOneBy({id: id, status:''})
        const admin = await Admin.findOneBy({email: email})
        if(admin!==null){
            if(news!==null){
                news.status = 'Disapprove'
                const date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
                news.approval_date = date
                const d = new Date(news.approval_date);
                const res = await addDay.addDay(d, Number(news.expiration))
                news.expiration_date =   moment(res).format('YYYY-MM-DD HH:mm:ss')
                news.admin = admin.id
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
                await senMailerDisapproveQueue.add(
                    'senMailerDisapprove',
                    {email: user.email, real_easte_id: news.id, expiration: news.expiration, approval_date: news.approval_date, name: user.fullname},
                    {removeOnComplete: true, removeOnFail: true}
                )
                redis_client.HSET(`${`real-estate-news`}`,news.id,JSON.stringify(a))
                redis_client.HSET(`${user.email}:${`real-estate-news`}`,news.id,JSON.stringify(a))
            }else throw Errors.NotFound
        }else throw Errors.Unauthorized
    }

    createCategory = async (email: string, name: string, type: boolean) => {
        const admin = await Admin.findOneBy({email: email})
        //const category = await Category.findOneBy({id: id})
        if(admin !== null){
            const check = await Category.findOneBy({name: name, type: type})
            if(check!==null){
                throw Errors.BadRequest
            }else{
                const category = new Category()
                category.name = name
                category.type = type
                return await category.save()
            }
        }else throw Errors.Unauthorized

    }

    editCategory = async (email: string, cate_id: string,name: string, type: boolean) => {
        const admin = await Admin.findOneBy({email: email})
        const category = await Category.findOneBy({id: cate_id})
        console.log(category);
        if(admin !== null){
            const check = await Category.findOneBy({name: name, type: type})
            if(category!== null){
                if(category.name === name || check !== null){
                    throw Errors.BadRequest
                }else{
                    category.name = name
                    category.type = type
                    return await category.save()
                    //return {message: 'Delete successfully!!'}
                }               
            }else throw Errors.NotFound
        }else throw Errors.Unauthorized

    }

    deleteCategory = async (email: string, id: string) => {
        console.log(id);
        const admin = await Admin.findOneBy({email: email})
        const category = await Category.findOneBy({id: id})
        if(admin !== null){
            if(category!== null){
                const news = await Real_Easte_News.findOneBy({category: category.slug})
                console.log('News Category: ', news);
                if(news!==null){
                    throw Errors.CanNotDelete
                    
                }else {
                    // category.name = name
                    // category.type = type
                    await category.remove()
                    return {message: 'Delete successfully!!'}
                }              
            }else throw Errors.NotFound
        }else throw Errors.Unauthorized

    }

    getAllCategory =async () => {
        const data = await Category.find({})
        return data
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
            console.log(images);
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
                    
                    console.log('TTTT:  ',imageInfo);
                    const data = await s3Client.send(new PutObjectCommand(bucketParams))
                    console.log(
                              "Successfully uploaded object: " +
                                bucketParams.Bucket +
                                "/" +
                                bucketParams.Key
                            )
                    await imageInfo.save()
                })
            )        
            //console.log(images);
            return info
        }else throw Errors.NotFound
    }

    editInfoRealEaste = async (real_easte_id: string, acreage: number, price: number, status: string, number_bedrooms: number, number_bathrooms: number, number_floors: number, direction: string, balcony_direction: string, facade: number, road_width: number, interior: string, address: string, length: number, width: number, total_usable_area: string, ward: string, district: string ,city: string) =>{
        try {
            //const reNews = await Real_Easte_News.findOneBy({slug: real_easte_id})
        //if(reNews!==null){
            const info = await Info_Real_Easte.findOneBy({id: real_easte_id})
            const reNews = await Real_Easte_News.findOneBy({slug: info.real_easte_id})
            console.log(reNews);
            if(info!==null){
                //const image = new Image_Real_Easte()
                //info.real_easte_id = reNews.slug
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
                info.location = `${loc[0].longitude}, ${loc[0].latitude}`
                info.user = reNews.user
                console.log(info);       
                await info.save()
                return info
        //}else throw Errors.NotFound
            }           
        } catch (error) {
            console.log(error);
            throw Errors.BadRequest
        }
    }

    detailRealEasreNews = async (slug: string) => {
        const info = await Info_Real_Easte.findOneBy({real_easte_id: slug})
        const news = await Real_Easte_News.findOneBy({slug: info.real_easte_id})
        const image = await Image_Real_Easte.find({where:{real_easte_id: info.id}})
        const user = await User.findOneBy({id: info.user})
        user.avatar =  await getSignedUrl(
            s3Client,
            new GetObjectCommand({
              Bucket: "lvtn-bds",
              Key: user.avatar
            }),
            { expiresIn: 3600 }// 60*60 seconds
          )
        console.log(info);
        if(info!==null){
            redis_client.hSet(`${user.email}:${`isSeenRE`}`, `${news.id}`, JSON.stringify(news))
            Object.getOwnPropertyNames(info.location).forEach(key => {
                let value = info.location[key];
                console.log(value);
            });
            //const data = dataSource
             //const data = await dataSource.query(`select a.email, a.type, a.fullname, a.address, a.phone,b.slug, c.id, c.real_easte_id,c.acreage, c.price,c.status,c.number_bedrooms,c.number_bathrooms,c.number_floors,c.direction,c.balcony_direction,c.facade,c.road_width,c.interior,c.address,c.location,c.length,c.width,c.total_usable_area,c.ward,c.district,c.city,c.user, d.images from public.user a inner join real_easte_news b on a.id::uuid = b.user::uuid inner join info_real_easte c on c.real_easte_id = b.slug inner join image_real_easte d on d.real_easte_id::uuid = c.id::uuid where b.slug = '${slug}'`)
            //const data = await excuteProcedure(real_easte_newsProcedure.GetDetailRealEaste, [info.real_easte_id])
            //console.log(data);
            //return data
            const imgarr: Array<Object> = []
            for (let img of image) { // For each post, generate a signed URL and save it to the post object
                const imageName = img.images
                img.images = await getSignedUrl(
                  s3Client,
                  new GetObjectCommand({
                    Bucket: "lvtn-bds",
                    Key: imageName
                  }),
                  { expiresIn: 3600 }// 60*60 seconds
                )
                imgarr.push(img)
            }
            return {info, news, imgarr, user}
        }
    }

    searchRealEaste = async (search_query: any,page:number, limit:number) => {
        // console.log(search_query);
        const pagegination = new Pagination(page, limit)
        const offset = pagegination.getOffset()
        //const price = util.price(search_query.price) 
        //const acreage = util.acreage(search_query.acreage)
        // const info = await dataSource.getRepository(Real_Easte_News)
        //                              .createQueryBuilder('easte')
        //                              .where('easte.title like :title', {title: `%${search_query.title}%`})
        //                              .getMany()
        const news = await Real_Easte_News.find({where:[{
            title: Like(`%${search_query.query}%`), status: 'Release'
        }]})
        let res: Array<Object> = []
        let imgarr: Array<Object> = []
        const data = await Promise.all(
            news.map(async(element)=>{
                const info = await Info_Real_Easte.findOneBy({real_easte_id: element.slug})
                const user = await User.findOneBy({id: element.user})
                user.avatar = await getSignedUrl(
                    s3Client,
                    new GetObjectCommand({
                      Bucket: "lvtn-bds",
                      Key: user.avatar
                    }),
                    { expiresIn: 3600 }// 60*60 seconds
                )
                const imgInfo = await Image_Real_Easte.find({where:{real_easte_id: info.id}})
                
                for (let img of imgInfo) { // For each post, generate a signed URL and save it to the post object
                //const imageName = img.images
                    img.images = await getSignedUrl(
                        s3Client,
                        new GetObjectCommand({
                        Bucket: "lvtn-bds",
                        Key: img.images
                    }),
                    { expiresIn: 3600 }// 60*60 seconds
                    )
                    //imgarr.push(img)
                }
                if(element.thumbnail!==''){

                    const imageName = element.thumbnail
                    element.thumbnail = await getSignedUrl(
                        s3Client,
                        new GetObjectCommand({
                          Bucket: "lvtn-bds",
                          Key: imageName
                        }),
                        { expiresIn: 3600 }// 60*60 seconds
                    )
                    const data = {
                        "Real_Easte": element,
                        "Info": info,
                        "User": user,
                        "Images": imgarr
                    }
                    //console.log(element)
                    //res.push(element)
                    res.push(data)
                }
            })
        )
        console.log("GBCT: ",res)
        return res
        // const info = 
        // console.log(info);
        // await redis_client.ft.sugAdd(``,``,1)
        //const data = await redis_client.ft.search(`idx:real-easte-info`,`@title:6`)
        // console.log(data);
        //const data = await dataSource.query(`SELECT * FROM real_easte_news WHERE title LIKE $1`, ['N%' + search_query.title + '%'])
        //return info
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
                redis_client.hSet(`${user.id}:${`save`}`, `${news.id}`, JSON.stringify(news))
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
        const item = await redis_client.HVALS(`${user.id}:${`save`}`)
        console.log("123213: ",item);
        let output = []
        let kq: Array<Object> = []
        let imgarr: Array<Object> = []
        for (
            let index = pagegination.getOffset();
            index < pagegination.getOffset() + limit && index < item.length;
            index++
        ) {
            output.push(JSON.parse(item[index]))        }
        //const list = item.map((val) => JSON.parse(val))
        if (output.length === 0) throw Errors.NotFound
        else{
            console.log('sssss: ',output[0]);
            const res = await Promise.all(
                output.map(async(item)=>{
                    console.log(item);
                    //const a = JSON.parse(item)
                    //console.log(a);
                    item.thumbnail = await getSignedUrl(
                        s3Client,
                        new GetObjectCommand({
                            Bucket: "lvtn-bds",
                            Key: item.thumbnail
                        }),
                        { expiresIn: 3600 }// 60*60 seconds
                        )
                    const info = await Info_Real_Easte.findOneBy({real_easte_id: item.slug})
                    console.log("object: ", info);
                    const imgInfo = await Image_Real_Easte.find({where:{real_easte_id: info.id}})
                    
                    for (let img of imgInfo) { // For each post, generate a signed URL and save it to the post object
                        const imageName = img.images
                        img.images = await getSignedUrl(
                        s3Client,
                        new GetObjectCommand({
                            Bucket: "lvtn-bds",
                            Key: imageName
                        }),
                        { expiresIn: 3600 }// 60*60 seconds
                        )
                        imgarr.push(img)
                    }
                    let s ={
                        real_easte_news: item,
                        info_real_easte: info,
                        images: imgarr
                    }
                    kq.push(s)
                })
            )
        }
        return  kq
        // if(listNewsSaved){
    }

    //lay tin k duyet chua lam NHO LAM

    getDisapproveNews = async (email: string, page: number, limit: number) => {
        const pagegination = new Pagination(page, limit)
        const skip = pagegination.getOffset()
        const admin = await Admin.findOneBy({email: email})
        if(admin!==null){
            const data = await Real_Easte_News.find({where:{status:'Disapprove'},skip:skip,take:limit})
            console.log(data);
            return data
        }else throw Errors.Unauthorized
    }

    getNewsToApprove = async (email:string, page:number, limit: number) => {
        const pagegination = new Pagination(page, limit)
        const skip = pagegination.getOffset()
        const admin = await Admin.findOneBy({email: email})
        let arr: Array<Object>=[]
        console.log(admin);
        if(admin!==null){
            
            const data = await Real_Easte_News.find({where:{status:''},skip:skip,take:limit})
            console.log(data);
            const res = await Promise.all(
                data.map(async(item)=>{
                    const user = await User.findOneBy({id: item.user})
                    console.log(user);
                    let obj = {
                        "Real_Easte_News":item,
                        "User":user
                    }
                    arr.push(obj)
                })
            )
            
            console.log(arr);
            return arr
        }else throw Errors.Unauthorized
    }


    //get news by user
    getNewsByUser =async (email:string, type: string) => {
        const user = await User.findOneBy({email:email, type: type})
        if(user!==null){
            const data = await redis_client.HVALS(`${user.email}:${`real-estate-news`}`)
            console.log(data);
            let kq: Array<Object> = []
            let imgarr: Array<Object> = []
            const res = await Promise.all(
                data.map(async(item)=>{
                    const a = JSON.parse(item)
                    console.log(a);
                    a.thumbnail = await getSignedUrl(
                        s3Client,
                        new GetObjectCommand({
                            Bucket: "lvtn-bds",
                            Key: a.thumbnail
                        }),
                        { expiresIn: 3600 }// 60*60 seconds
                        )
                    const info = await Info_Real_Easte.findOneBy({real_easte_id: a.slug})
                    const imgInfo = await Image_Real_Easte.find({where:{real_easte_id: info.id}})
                    
                    for (let img of imgInfo) { // For each post, generate a signed URL and save it to the post object
                        const imageName = img.images
                        img.images = await getSignedUrl(
                        s3Client,
                        new GetObjectCommand({
                            Bucket: "lvtn-bds",
                            Key: imageName
                        }),
                        { expiresIn: 3600 }// 60*60 seconds
                        )
                        imgarr.push(img)
                    }
                    let s ={
                        real_easte_news: a,
                        info_real_easte: info,
                        images: imgarr
                    }
                    kq.push(s)
                })
            )
            console.log("object: ", res);
            return kq
        }else throw Errors.NotFound
    }

    reRelease =async (slug: string, type: number, expiration: number, email: string, userType: string) => {
        const user = await User.findOneBy({email: email, type: userType})
        if(user===null)throw Errors.Unauthorized
        const news = await Real_Easte_News.findOneBy({slug: slug, status:'Expiration', user: user.id})
        if(news !== null){
            news.type = type
            news.expiration = expiration
            news.status = 'Release'
            const date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
            news.updated_date = date
            news.created_date
            await news.save()
            const delay = Number(news.expiration)*60*60*24*1000
                //console.log(delays);10000
                //const delay = 60*30*1000
                await expirationRealEasteNews.add(
                    'expiration-real-easte-news',
                    { id: news.id },
                    { removeOnComplete: true, removeOnFail: true, delay:delay }
                )
                //const date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
                //const user = await User.findOneBy({id: news.user})
                await senMailerRePostQueue.add(
                    'senMailerRePost',
                    {email: user.email, real_easte_id: news.id, expiration: news.expiration, approval_date: date, name: user.fullname},
                    {removeOnComplete: true, removeOnFail: true}
                )
        }else throw Errors.BadRequest
    }

    statistical =async (start: string, end: string, user: string) => {
        const admin = await Admin.findOneBy({email: user})
        if(admin!==null){
            const newsRepository =  dataSource.getRepository(Real_Easte_News)
            const paymentRepository =  dataSource.getRepository(Payment)
            const news = await newsRepository.createQueryBuilder('news')
                                                .where('news.created_date >=:start',{start})
                                                .andWhere('news.created_date <=:end',{end})
                                                .getManyAndCount()
                                                console.log(news);
            
            // const {payment} = await paymentRepository.createQueryBuilder('payment')
            //                                         .addSelect('SUM(payment.price)', 'totalSale')
            //                                         .where('payment.created_date >:start',{start})
            //                                         .andWhere('payment.created_date <=:end',{end})
            //                                         .getRawOne()
            const payment = await dataSource.query(`select sum(price::NUMERIC) as totalSale from payment`)
                                    
            return {news, payment}
        }else throw Errors.Unauthorized
        
    }

    unsave = async (email:string, type: string, real_easte_id: string) => {
        const user = await User.findOneBy({email: email, type: type})
        const redisSearch = await redis_client.hGet(
            `${user.id}:${`save`}`,
            `${real_easte_id}`
        )
        if (redisSearch) {
            let news: Real_Easte_News = JSON.parse(redisSearch)
            redis_client.HDEL(`${user.id}:${`save`}`, `${news.id}`)
            //return { message: 'You are already save this news' }
        } else {
            throw Errors.NotFound
        }
    }

    getNewsUserSeen =async (email: string, type: string, page:number, limit: number) => {
        const user = await User.findOneBy({email: email, type: type})
        console.log(user);
        const pagegination = new Pagination(page, limit)
        const item = await redis_client.HVALS(`${user.email}:${`isSeenRE`}`)
        console.log(item);
        let output = []
        let kq: Array<Object> = []
        let imgarr: Array<Object> = []
        for (
            let index = pagegination.getOffset();
            index < pagegination.getOffset() + limit && index < item.length;
            index++
        ) {
            console.log(item[index]);
            output.push(JSON.parse(item[index]))
            console.log(output);
        }
        //const list = item.map((val) => JSON.parse(val))
        if (output.length === 0) throw Errors.NotFound
        else{
            const res = await Promise.all(
                output.map(async(item)=>{
                    //const a = JSON.parse(item)
                    item.thumbnail = await getSignedUrl(
                        s3Client,
                        new GetObjectCommand({
                            Bucket: "lvtn-bds",
                            Key: item.thumbnail
                        }),
                        { expiresIn: 3600 }// 60*60 seconds
                        )
                    //const a = JSON.parse(item)
                    const info = await Info_Real_Easte.findOneBy({real_easte_id: item.slug})
                    const imgInfo = await Image_Real_Easte.find({where:{real_easte_id: info.id}})
                    
                    for (let img of imgInfo) { // For each post, generate a signed URL and save it to the post object
                        const imageName = img.images
                        img.images = await getSignedUrl(
                        s3Client,
                        new GetObjectCommand({
                            Bucket: "lvtn-bds",
                            Key: imageName
                        }),
                        { expiresIn: 3600 }// 60*60 seconds
                        )
                        imgarr.push(img)
                    }
                    let s ={
                        real_easte_news: item,
                        info_real_easte: info,
                        images: imgarr
                    }
                    kq.push(s)
                })
            )
        }
        return kq
    }

    getNewsHidden=async (email:string) => {
        const admin = await Admin.findOneBy({email:email})
        if(admin!==null){
            const news = await Real_Easte_News.find({where:{deleted: true}})
            if(news!==null){
                return news
            }else throw Errors.NotFound
        }else throw Errors.Unauthorized
    }

    restore= async (id: string, email: string) => {
        try {  
            const result = await Real_Easte_News.findOneBy({id: id})
            const admin = await Admin.findOneBy({email: email})
            //const user = await User.findOneBy({email: email, type: typeUser})
            if(result!==null && admin!==null){
                result.deleted = false
                await result.save()
                return {message:'Restore successfully!!'}
            } else throw Errors.NotFound
        } catch (error) {
            console.log(error);
            throw Errors.BadRequest
        }
    }

}