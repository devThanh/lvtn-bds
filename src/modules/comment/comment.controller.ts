import { NextFunction, Request, Response } from "express";
import { AuthService } from "../auth/auth.service";
import { CommentService } from "./comment.service";
import { AuthRequest } from "../auth/auth.middleware";
import { Pagination, ResponseWrapper } from "../../helpers/response.wrapper";



export class CommentController{
    commentService: CommentService
    authService: AuthService
    constructor(commentService: CommentService, authService: AuthService){
        this.authService = authService
        this.commentService = commentService
    }

    getComment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.commentService.getComment(req.params.commentId)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    createComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.commentService.createComment(req.params.real_easte_detail_id,req.email, req.type, req.fullname, req.body.content)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    editComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.commentService.editComment(req.params.commentId, req.body.content, req.email, req.type)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    deleteComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.commentService.deleteComment(req.params.commentId, req.email, req.type)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    hiddenComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.commentService.hiddenComment(req.params.commentId, req.email, req.type)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    replyComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.commentService.replyComment(req.params.real_easte_id, req.params.commentId, req.email, req.type, req.body.content)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    editReplyComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.commentService.editReplyComment(req.params.replyCommentId, req.body.content, req.email, req.type)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    deleteReplyComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.commentService.deleteReplyComment(req.params.replyCommentId, req.email, req.type)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    hiddenReplyComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.commentService.hiddenReplyComment(req.params.replyCommentId, req.email, req.type)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    like =async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.commentService.like(req.params.commentId, req.email, req.type)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    unlike =async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.commentService.unlike(req.params.commentId, req.email, req.type)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    listCommentByRealEasteNews = async (req: Request, res: Response, next: NextFunction) => {
        const page = Pagination.fromReq(req)
        try {
            const result = await this.commentService.listCommentByRealEasteNews(page.page, page.limit, req.query.column as any, req.params.real_easte_id)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    listReplyCommentByComment =async (req: Request, res: Response, next: NextFunction) => {
        const page = Pagination.fromReq(req)
        try {
            const result = await this.commentService.listReplyByComment(page.page, page.limit, req.params.commentId)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }

    getAllComment =async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const result = await this.commentService.getAllComment(req.email)
            res.send(new ResponseWrapper(result))
        } catch (error) {
            next(error)
        }
    }


}