import express from 'express'
import { CommentController } from './comment.controller'
import { AuthService } from '../auth/auth.service'
import { AuthMiddleware } from '../auth/auth.middleware'
import { CommentService } from './comment.service'

const authService = new AuthService()
const authMiddleware = new AuthMiddleware(authService)
const commentService = new CommentService()

const commentController = new CommentController(commentService, authService)
export const commentRouter = express.Router()


commentRouter.post('/create/:real_easte_detail_id', authMiddleware.authorize, commentController.createComment)
commentRouter.put('/edit/:commentId', authMiddleware.authorize, commentController.editComment)
commentRouter.put('/hidden-comment/:commentId', authMiddleware.authorize, commentController.hiddenComment)
commentRouter.delete('/delete/:commentId', authMiddleware.authorize, commentController.deleteComment)
commentRouter.post('/reply/:real_easte_id/:commentId', authMiddleware.authorize, commentController.replyComment)
commentRouter.put('/edit-reply/:replyCommentId', authMiddleware.authorize, commentController.editReplyComment)
commentRouter.put('/hidden-reply/:replyCommentId', authMiddleware.authorize, commentController.hiddenReplyComment)
commentRouter.delete('/delete-reply/:replyCommentId', authMiddleware.authorize, commentController.deleteReplyComment)
commentRouter.post('/like/:commentId', authMiddleware.authorize, commentController.like)
commentRouter.delete('/unlike/:commentId', authMiddleware.authorize, commentController.unlike)
commentRouter.get('/list-comment/:real_easte_id', authMiddleware.authorize, commentController.listCommentByRealEasteNews)
commentRouter.get('/list-reply/:commentId', authMiddleware.authorize, commentController.listReplyCommentByComment)
commentRouter.get('/', commentController.getComment)