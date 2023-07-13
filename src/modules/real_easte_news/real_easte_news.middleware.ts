import { Request, Response, NextFunction } from "express"
import { Post_Real_Easte_News } from "./dto/post_real_easte_news.dto"
import { validate } from "class-validator"
import { ResponseWrapper } from "../../helpers/response.wrapper"
import { Edit_Real_Easte_News } from "./dto/edit_real_easte_news.dto"
import { Create_Info_Real_Easte } from "./dto/create_info_real_easte.dto"


export class RealEasteNewsMiddleware{
    validatePost = (req: Request, res: Response, next: NextFunction)=>{
        console.log(req.body);
        let newsRealEaste = new Post_Real_Easte_News()
        newsRealEaste.content = req.body.content
        newsRealEaste.title = req.body.title
        //newsRealEaste.type = req.body.type
        newsRealEaste.status = req.body.status
        //newsRealEaste.expiration_date = req.body.expiration_date
        validate(newsRealEaste).then((errors)=>{
            if(errors.length > 0){
                console.log('validation failed. errors: ', errors);
            return res.send(new ResponseWrapper({message:"validation failed. errors: ", errors}))
            }else{
                console.log('validation succeed');
                next()  
            }
        })
    }

    validateEdit = (req: Request, res: Response, next: NextFunction)=>{
        //console.log(req.body);
        let newsRealEaste = new Edit_Real_Easte_News()
        newsRealEaste.content = req.body.content
        newsRealEaste.title = req.body.title
        //newsRealEaste.type = req.body.type
        //newsRealEaste.status = req.body.status
        //newsRealEaste.expiration_date = req.body.expiration_date
        validate(newsRealEaste).then((errors)=>{
            if(errors.length > 0){
                console.log('validation failed. errors: ', errors);
            return res.send(new ResponseWrapper({message:"validation failed. errors: ", errors}))
            }else{
                console.log('validation succeed');
                next()  
            }
        })
    }

    validateCreate_EditInfo = async (req: Request, res: Response, next: NextFunction) => {
        let info = new Create_Info_Real_Easte()
        info.acreage = req.body.acreage
        info.price = req.body.price
        info.number_bedrooms = req.body.number_bedrooms
        info.number_bathrooms = req.body.number_bathrooms
        info.number_floors = req.body.number_floors
        info.direction = req.body.direction
        info.balcony_direction = req.body.balcony_direction
        info.facade = req.body.facade
        info.road_width = req.body.road_width
        info.interior = req.body.interior
        info.length = req.body.length
        info.width = req.body.width
        //info.total_usable_area = req.body.total_usable_area
        validate(info).then((errors)=>{
            if(errors.length > 0){
                console.log('validation failed. errors: ', errors);
            return res.send(new ResponseWrapper({message:"validation failed. errors: ", errors}))
            }else{
                console.log('validation succeed');
                next()  
            }
        })
    }
}