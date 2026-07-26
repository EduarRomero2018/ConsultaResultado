import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const bucket = process.env.AWS_S3_BUCKET;

export async function uploadToS3(buffer, key, contentType) {
    await s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    }));
}

export async function deleteFromS3(key) {
    await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function getPresignedDownloadUrl(key, fileName, expiresInSeconds = 120) {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ResponseContentDisposition: `attachment; filename="${fileName}"`,
    });
    return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}
