import { Request, Response, NextFunction } from "express";
import { CreateNewsDTO } from "./dto/createNews.dto";
import { validate } from "class-validator";
import { ResponseWrapper } from "../../helpers/response.wrapper";



export class NewsMiddleware {
    validateCreateNews =async (req: Request, res: Response, next: NextFunction) => {
        console.log(req.body)
        let news = new CreateNewsDTO()
        news.title = req.body.title
        news.content = req.body.content
        //news.thumbnail = req.file.filename
        news.author = req.body.author
        news.description = req.body.description
        //console.log(news)
        validate(news).then((errors)=>{
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