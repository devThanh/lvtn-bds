
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
//     url
// });




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
import { senMailer, senMailerApprove, senMailerDisapprove, senMailerForgetPass, senMailerRePost, senMailerRepost } from './src/helpers/email'
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
        const a = await util.expirationRealEasteNews(job.data.id)
        console.log('',job.data.id);
        console.log("object:  ", a);
        
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

export const repostQueue = new Queue('repost', {
    connection: {
        // host: 'localhost',
        // port: 6379,
        host: 'redis-18699.c240.us-east-1-3.ec2.cloud.redislabs.com',
        port: 18699,
        password: 'GT8dxzSal6hw5nblaOGPzHmzXVWsf9Ob'
    },
    defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
})

export const repostWorker = new Worker(
    'repost',
    async (job) => {
        // console.log(1);
        // senMailerRepost(job.data.email, job.data.real_easte_id, job.data.expiration, job.data.approval_date, job.data.name, job.data.payment)
        // console.log(2);
        await util.repostRealEasteNews(job.data.id)
        console.log(3);
        console.log('',job.data.id);
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

export const senMailerApproveQueue = new Queue('senMailerApprove', {
    connection: {
        // host: 'localhost',
        // port: 6379,
        host: 'redis-18699.c240.us-east-1-3.ec2.cloud.redislabs.com',
        port: 18699,
        password: 'GT8dxzSal6hw5nblaOGPzHmzXVWsf9Ob'
    },
    defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
})

export const senMailerDisapproveQueue = new Queue('senMailerDisapprove', {
    connection: {
        // host: 'localhost',
        // port: 6379,
        host: 'redis-18699.c240.us-east-1-3.ec2.cloud.redislabs.com',
        port: 18699,
        password: 'GT8dxzSal6hw5nblaOGPzHmzXVWsf9Ob'
    },
    defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
})

export const senMailerApproveWorker = new Worker(
    'senMailerApprove',
    async (job) => {
        senMailerApprove(job.data.email, job.data.real_easte_id, job.data.expiration, job.data.approval_date, job.data.name, job.data.payment)
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

export const senMailerDisapproveWorker = new Worker(
    'senMailerDisapprove',
    async (job) => {
        senMailerDisapprove(job.data.email, job.data.real_easte_id, job.data.expiration, job.data.approval_date, job.data.name)
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

export const senMailerRePostWorker = new Worker(
    'mail-repost-real-easte-news',
    async (job) => {
        senMailerRePost(job.data.email, job.data.real_easte_id, job.data.expiration, job.data.approval_date, job.data.name)
        await util.repostRealEasteNews(job.data.id)
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

export const senMailerRePostQueue = new Queue('mail-repost-real-easte-news', {
    connection: {
        // host: 'localhost',
        // port: 6379,
        host: 'redis-18699.c240.us-east-1-3.ec2.cloud.redislabs.com',
        port: 18699,
        password: 'GT8dxzSal6hw5nblaOGPzHmzXVWsf9Ob'
    },
    defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
})