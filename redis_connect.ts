import { createClient } from 'redis'

const url =  process.env.REDIS_HOST || 'redis://localhost:6379' 
const redis_client = createClient({
    url,
})

redis_client.on('error', (err) => console.log('Redis Client Error', err))

redis_client.on('connect', () => console.log('Redis Client Connect'))

redis_client.on('ready', () => console.log('Redis Client Ready'))

export default redis_client

import { Queue, Worker  } from 'bullmq'
import { senMailer, senMailerForgetPass } from './src/helpers/email'
import { RealEasteNews } from './src/modules/real_easte_news/real_easte_news.service'
import { Real_Easte_News } from './src/modules/real_easte_news/entities/real_easte_news.model'

export const emailQueue = new Queue('Mailer', {
    connection: {
        host: 'localhost',
        port: 6379,
    },
    defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
})


export const forgetPass = new Queue('forgetPass', {
    connection: {
        host: 'localhost',
        port: 6379,
    },
    defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
})

export const expirationRealEasteNews = new Queue('expiration-real-easte-news', {
    connection: {
        host: 'localhost',
        port: 6379,
    },
    defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
})
import util from './src/util/util'
export const expirationWorker = new Worker(
    'expiration-real-easte-news',
    async (job) => {
        util.expirationRealEasteNews(job.data.id)
        console.log('',job.data.id);
        
        //const new = await Real_Easte_News.findOneBy
    },
    {
        connection: {
            host: 'localhost',
            port: 6379,
        },
    }
)

export const worker = new Worker(
    'Mailer',
    async (job) => {
        senMailer(job.data.email)
    },
    {
        connection: {
            host: 'localhost',
            port: 6379,
        },
    }
)

export const workerForgetPass = new Worker(
    'forgetPass',
    async (job) => {
        senMailerForgetPass(job.data.email, job.data.pass)
        console.log('123')
    },
    {
        connection: {
            host: 'localhost',
            port: 6379,
        },
    }
)
