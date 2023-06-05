import express, { NextFunction, Request, Response, response } from 'express'
import { config } from './config'
import { handleError } from './helpers/error'
import { logger } from './helpers/logger'
import { ConnectDB } from './database/connection'
import redis_client from '../redis_connect'
import { userRouter } from './modules/user/user.route'
require('dotenv').config()
import { newsRouter } from './modules/news/news.route'
import cookieSession from "cookie-session";
import './helpers/passport'
//import esClient from './helpers/elastic-search'
import session from 'express-session'
import passport from "passport"
import { categoryRouter, realEasteRouter } from './modules/real_easte_news/real_easte_news.route'
import { paymentRouter } from './modules/payment/payment.route'
import { commentRouter } from './modules/comment/comment.route'
import { error } from 'console'

const app = express()
const port = config.port
app.use(session({secret:'cats'}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// app.use(
//     cookieSession({
//       maxAge: 24 * 60 * 60 * 1000,
//       keys: ['dHJhbnZhbnRoYW5o'],
//     })
//   );
  
//   // initialize passport
//   app.use(passport.initialize());
//   app.use(passport.session());

//Connect Database
async function bootstrap() {
    await ConnectDB.AppDataSource.initialize()
        .then(() => {
            console.log('CONNECT POSTGRESQL SUCCESSFULLY!!!')
        })
        .catch((err) => {
            console.error(err)
        })
}
bootstrap()

//Connect Redis
async function connect() {
    await redis_client.connect()
}

connect()

// async function elastic(){
//     await esClient.info()
//         .then((response) => console.log(JSON.stringify(response)))
//         .catch((error)=> console.error(JSON.stringify(error)))
// }
// elastic()




app.use('/user', userRouter)
app.use('/news', newsRouter)
app.use('/real-easte', realEasteRouter)
app.use('/category', categoryRouter)
app.use('/payment', paymentRouter)
app.use('/comment', commentRouter)


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    handleError(err, res)
})

app.listen(port, async () => {
    return logger.info(`Server is listening at port ${port} `)
})
