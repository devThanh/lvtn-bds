
import { CreateBucketCommand, S3 } from "@aws-sdk/client-s3";

export const s3Client = new S3({
    //forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    //endpoint: "https://nyc3.digitaloceanspaces.com",
    region: "ap-southeast-1",
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_ACCESS_KEY
    }
});

