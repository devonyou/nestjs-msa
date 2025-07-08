import { Inject, Injectable } from '@nestjs/common';
import { ObjectCannedACL, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
    constructor(@Inject(S3Client.name) private readonly s3Client: S3Client) {}

    getClient() {
        return this.s3Client;
    }

    async generatePresignedUrl(
        bucketName: string,
        path: string,
        expiresIn: number,
        contentType: string,
        ACL?: ObjectCannedACL,
    ) {
        try {
            const filename = `${uuid()}.${contentType}`;
            const key = `${path}/${filename}`;

            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                ACL: ACL,
            });

            const url = await getSignedUrl(this.s3Client, command, { expiresIn });

            return {
                presignedUrl: url,
                fileUrl: `https://${bucketName}.s3.amazonaws.com/${path}/${filename}`,
                filename: filename,
            };
        } catch (err) {
            throw new Error('Failed to generate presigned url');
        }
    }
}
