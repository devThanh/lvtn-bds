import { createClient } from 'redis'

//const url =  process.env.REDIS_HOST || 'redis://localhost:6379' 
//const url = 'redis://redis-18699.c240.us-east-1-3.ec2.cloud.redislabs.com:18699'
const redis_client = createClient({
    password: 'GT8dxzSal6hw5nblaOGPzHmzXVWsf9Ob',
    socket: {
        host: 'redis-18699.c240.us-east-1-3.ec2.cloud.redislabs.com',
        port: 18699
    }
});



// const redis_client = createClient({
//     password: 'GT8dxzSal6hw5nblaOGPzHmzXVWsf9Ob',
//     socket: {
//         host: 'redis-18699.c240.us-east-1-3.ec2.cloud.redislabs.com',
//         port: 18699
//     }
// });

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
        // host: 'localhost',
        // port: 6379,
        host: 'redis-18699.c240.us-east-1-3.ec2.cloud.redislabs.com',
        port: 18699,
        password: 'GT8dxzSal6hw5nblaOGPzHmzXVWsf9Ob'
    },
    defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
})


export const forgetPass = new Queue('forgetPass', {
    connection: {
        // host: 'localhost',
        // port: 6379,
        host: 'redis-18699.c240.us-east-1-3.ec2.cloud.redislabs.com',
        port: 18699,
        password: 'GT8dxzSal6hw5nblaOGPzHmzXVWsf9Ob'
    },
    defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
})

export const expirationRealEasteNews = new Queue('expiration-real-easte-news', {
    connection: {
        // host: 'localhost',
        // port: 6379,
        host: 'redis-18699.c240.us-east-1-3.ec2.cloud.redislabs.com',
        port: 18699,
        password: 'GT8dxzSal6hw5nblaOGPzHmzXVWsf9Ob'
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
            // host: 'localhost',
            // port: 6379,
            host: 'redis-18699.c240.us-east-1-3.ec2.cloud.redislabs.com',
        port: 18699,
        password: 'GT8dxzSal6hw5nblaOGPzHmzXVWsf9Ob'
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
            // host: 'localhost',
            // port: 6379,
            host: 'redis-18699.c240.us-east-1-3.ec2.cloud.redislabs.com',
        port: 18699,
        password: 'GT8dxzSal6hw5nblaOGPzHmzXVWsf9Ob'
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
            // host: 'localhost',
            // port: 6379,
            host: 'redis-18699.c240.us-east-1-3.ec2.cloud.redislabs.com',
        port: 18699,
        password: 'GT8dxzSal6hw5nblaOGPzHmzXVWsf9Ob'
        },
    }
)
