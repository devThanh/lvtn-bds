import { NextFunction, Request, Response } from "express";
import { BaseService } from "../../service";
import { AuthService } from "../auth/auth.service";
import { NewsService } from "./news.service";
import { AuthRequest } from "../auth/auth.middleware";
import { Pagination, ResponseWrapper } from "../../helpers/response.wrapper";



export class NewsController {
    newsService: NewsService
    authService: AuthService
    constructor(newsService: NewsService, authService: AuthService){
        this.authService = authService
        this.newsService = newsService
    }

    createNews =async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.newsService.createNews(req.body.title, req.body.content, req.file,req.body.author, req.body.description, req.email)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    updateNews =async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            console.log('TTTTTTTTTTT')
            const result = await this.newsService.updateNews(req.email, req.params.slug, req.body.title, req.body.content, req.body.description, req.file)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    newsDetail =async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.newsService.newsDetail(req.email, req.params.id)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    listNewsUserSeen =async (req: AuthRequest, res: Response, next: NextFunction) => {
        //console.log('wqewqe')
        const page = Pagination.fromReq(req)
        try {
            const result = await this.newsService.listNewsUserSeen(req.email, page.page, page.limit)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    save = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.newsService.save(req.email,req.params.id)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    getNewsUserSaved = async (req: AuthRequest,res: Response,next: NextFunction) => {
        const page = Pagination.fromReq(req)
        try {
            const result = await this.newsService.getNewsUserSaved(req.email,page.page,page.limit)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    search = async (req: Request, res: Response, next: NextFunction) => {
        const page = Pagination.fromReq(req)
        try {
            const result = await this.newsService.search(req.query.q as any,page.page,page.limit)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    statistical = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.newsService.statistical()
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    getAll =async (req: Request, res: Response, next: NextFunction) => {
        const page = Pagination.fromReq(req)
        try {
            const result = await this.newsService.getall(page.page,page.limit)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }
}