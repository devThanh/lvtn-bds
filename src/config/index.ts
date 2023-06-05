import * as dotenv from 'dotenv'
dotenv.config()
const env = process.env

export interface Config {
    port: string
    bucketName: string
    region : string
    accessKeyId : string
    secretAccessKey : string
}

export const config: Config = {
    port: env.PORT,
    bucketName: env.AWS_BUCKET_NAME,
    region : env.AWS_BUCKET_REGION,
    accessKeyId : env.AWS_ACCESS_KEY,
    secretAccessKey : env.AWS_SECRET_ACCESS_KEY,
}
