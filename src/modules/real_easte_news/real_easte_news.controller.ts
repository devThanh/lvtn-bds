import { Pagination, ResponseWrapper } from "../../helpers/response.wrapper";
import { AuthRequest } from "../auth/auth.middleware";
import { AuthService } from "../auth/auth.service";
import { RealEasteNews } from "./real_easte_news.service";
import { Request, Response, NextFunction } from "express";



export class RealEasteNewsController{
    realEasteNewsService: RealEasteNews
    authService: AuthService
    constructor(realEasteNewsService: RealEasteNews, authService: AuthService){
        this.authService = authService
        this.realEasteNewsService = realEasteNewsService
    }

    postRealEasteNews = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.realEasteNewsService.postRealEasteNews(req.body.id, req.email, req.type,req.body.content, req.body.title, req.body.expiration, req.body.type,req.body.status,req.body.category, req.file)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    editRealEasteNews = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.realEasteNewsService.editRealEasteNews(req.params.id, req.email, req.type,req.body.content, req.body.title, req.body.expiration_date, req.body.type,req.body.status, req.body.category, req.file)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    hiddenRealEasteNews = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.realEasteNewsService.hiddenRealEasteNews(req.params.id, req.email, req.type,req.body.content, req.body.title, req.body.expiration_date, req.body.type,req.body.status, req.file)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    deleteRealEasteNews = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.realEasteNewsService.deleteRealEasteNews(req.params.id, req.email, req.type,req.body.content, req.body.title, req.body.expiration_date, req.body.type,req.body.status, req.file)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    getAll =async (req: Request, res: Response, next: NextFunction) => {
        console.log("object");
        const page = Pagination.fromReq(req)
        try {
            const result = await this.realEasteNewsService.getAll(page.page,page.limit)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    getByCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = Pagination.fromReq(req)
            const result = await this.realEasteNewsService.getByCategory(req.params.slug, page.page, page.limit)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }       
    }

    createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.realEasteNewsService.createCategory(req.email,req.body.name, req.body.type)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    editCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.realEasteNewsService.editCategory(req.email, req.params.id, req.body.name, req.body.type)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.realEasteNewsService.deleteCategory(req.email, req.params.id)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    getAllCategory =async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.realEasteNewsService.getAllCategory()
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    approveRealEasteNews =async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.realEasteNewsService.approveRealEasteNews(req.params.id, req.email)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    disapproveRealEasteNews =async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.realEasteNewsService.disapproveRealEasteNews(req.params.id, req.email)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    infoRealEaste =async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.realEasteNewsService.createInfoRealEaste(req.body.real_easte_id, req.body.acreage, req.body.price, req.body.status, req.body.number_bedrooms, req.body.number_bathrooms, req.body.number_floors, req.body.direction, req.body.balcony_direction, req.body.facade, req.body.road_width, req.body.interior, req.body.address, req.body.length, req.body.width, req.body.total_usable_area, req.body.ward, req.body.district ,req.body.city, req.files)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    editInfoRealEaste =async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.realEasteNewsService.editInfoRealEaste(req.params.real_easte_id, req.body.acreage, req.body.price, req.body.status, req.body.number_bedrooms, req.body.number_bathrooms, req.body.number_floors, req.body.direction, req.body.balcony_direction, req.body.facade, req.body.road_width, req.body.interior, req.body.address, req.body.length, req.body.width, req.body.total_usable_area, req.body.ward, req.body.district ,req.body.city)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    detailInfoRealEaste =async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.realEasteNewsService.detailRealEasreNews(req.params.slug)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    save = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.realEasteNewsService.save(req.email, req.params.real_easte_id, req.type)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    getSave = async (req: AuthRequest, res: Response, next: NextFunction) => {
        const page = Pagination.fromReq(req)
        try {
            const result = await this.realEasteNewsService.getNewsUserSaved(req.email, req.type,page.page, page.limit)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    search = async (req: Request, res: Response, next: NextFunction) => {
        const page = Pagination.fromReq(req)
        //console.log('TTT: ',req.query);
        try {
            const result = await this.realEasteNewsService.searchRealEaste(req.query, page.page, page.limit)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    getDisapproveNews = async (req: AuthRequest, res: Response, next: NextFunction) => {
        const page = Pagination.fromReq(req)
        //console.log('TTT: ',req.query);
        try {
            const result = await this.realEasteNewsService.getDisapproveNews(req.email, page.page, page.limit)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    getNewsToApprove = async (req: AuthRequest, res: Response, next: NextFunction) => {
        console.log("object");
        const page = Pagination.fromReq(req)
        //console.log('TTT: ',req.query);
        try {
            const result = await this.realEasteNewsService.getNewsToApprove(req.email, page.page, page.limit)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    getNewsByUser =async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.realEasteNewsService.getNewsByUser(req.email, req.type)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
        
    }

    rePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.realEasteNewsService.reRelease(req.params.slug, req.body.type, req.body.expiration, req.email, req.type)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}