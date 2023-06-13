import express from 'express'
import { RealEasteNewsController } from './real_easte_news.controller'
import { AuthService } from '../auth/auth.service'
import { RealEasteNews } from './real_easte_news.service'
import { AuthMiddleware } from '../auth/auth.middleware'
import { RealEasteNewsMiddleware } from './real_easte_news.middleware'
import { upload } from '../../helpers/multer'
export const realEasteRouter = express.Router()
export const categoryRouter = express.Router()

const authService = new AuthService()
const authMiddleware = new AuthMiddleware(authService)
const realEasteNewsService = new RealEasteNews(authService)
const realEasteNewsMiddleware = new RealEasteNewsMiddleware()
const realEasteNewsController = new RealEasteNewsController(realEasteNewsService, authService)

realEasteRouter.get('/news-user', authMiddleware.authorize, realEasteNewsController.getNewsByUser)
realEasteRouter.get('/get-disapprove', authMiddleware.authorize, realEasteNewsController.getNewsToApprove)
realEasteRouter.get('/get-news', authMiddleware.authorize, realEasteNewsController.getNewsToApprove)
realEasteRouter.get('/search', realEasteNewsController.search)
realEasteRouter.post('/save/:real_easte_id', authMiddleware.authorize, realEasteNewsController.save)
realEasteRouter.get('/get-saved', authMiddleware.authorize, realEasteNewsController.getSave)
realEasteRouter.get('/detail/:slug', realEasteNewsController.detailInfoRealEaste)
realEasteRouter.post('/create-info', upload.array('images',10), authMiddleware.authorize, realEasteNewsController.infoRealEaste)
realEasteRouter.put('/edit-info/:real_easte_id', authMiddleware.authorize, realEasteNewsController.editInfoRealEaste)
realEasteRouter.put('/disapprove/:id', authMiddleware.authorize, realEasteNewsController.disapproveRealEasteNews)
realEasteRouter.put('/approve/:id', authMiddleware.authorize, realEasteNewsController.approveRealEasteNews)
realEasteRouter.get('/:slug', realEasteNewsController.getByCategory)
realEasteRouter.delete('/delete/:id', authMiddleware.authorize, realEasteNewsController.deleteRealEasteNews)
realEasteRouter.put('/hidden/:id', authMiddleware.authorize, realEasteNewsController.hiddenRealEasteNews)
realEasteRouter.put('/edit/:id', authMiddleware.authorize, upload.single('thumbnail'), realEasteNewsMiddleware.validateEdit, realEasteNewsController.editRealEasteNews)
realEasteRouter.post('/create', authMiddleware.authorize, upload.single('thumbnail'), realEasteNewsMiddleware.validatePost, realEasteNewsController.postRealEasteNews)


categoryRouter.post('/create', authMiddleware.authorize, realEasteNewsController.createCategory) ////
categoryRouter.put('/edit/:id', authMiddleware.authorize, realEasteNewsController.editCategory)
categoryRouter.delete('/delete/:id', authMiddleware.authorize, realEasteNewsController.deleteCategory)
categoryRouter.get('/getall', realEasteNewsController.getAllCategory)
realEasteRouter.get('/', realEasteNewsController.getAll)