import { Request, Response, NextFunction } from "express"
import { Post_Real_Easte_News } from "./dto/post_real_easte_news.dto"
import { validate } from "class-validator"
import { ResponseWrapper } from "../../helpers/response.wrapper"
import { Edit_Real_Easte_News } from "./dto/edit_real_easte_news.dto"


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
}