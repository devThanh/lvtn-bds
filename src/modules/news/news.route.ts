import express from 'express'
import { AuthMiddleware } from '../auth/auth.middleware'
import { AuthService } from '../auth/auth.service'
import { upload } from '../../helpers/multer'
import { NewsController } from './news.controller'
import { newsService } from '../../service'
import { NewsMiddleware } from './news.middleware'
const newsMiddleware = new NewsMiddleware()
export const newsRouter = express.Router()
const authService = new AuthService()
const authMiddleware = new AuthMiddleware(authService)
const newsController = new NewsController(newsService, authService)

newsRouter.get('/getall', newsController.getAll)
newsRouter.get('/watch', authMiddleware.authorize, newsController.listNewsUserSeen)
newsRouter.get('/save/:id', authMiddleware.authorize, newsController.save)
newsRouter.get('/getsaved', authMiddleware.authorize, newsController.getNewsUserSaved)
newsRouter.post('/create', authMiddleware.authorize, upload.single('thumbnail'), newsMiddleware.validateCreateNews, newsController.createNews)
newsRouter.put('/edit/:id', authMiddleware.authorize, upload.single('thumbnail'), newsController.updateNews)
newsRouter.delete('/delete/:id', authMiddleware.authorize, newsController.deleteNews)
newsRouter.get('/:id', authMiddleware.checkLogin, newsController.newsDetail)