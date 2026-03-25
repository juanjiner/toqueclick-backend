import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { storageConfig } from "../config/storage.js";

const s3 = new S3Client({
    region: storageConfig.region
});

export class StorageService {

    private getKey(folder: string, filename: string): string {
        return `static/${folder}/${filename}`;
    }

    async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {

        const filename = file.originalname;
        const key = this.getKey(folder, filename);

        await s3.send(new PutObjectCommand({
            Bucket: storageConfig.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        }));

        return key;
    }

    async deleteFile(fileUrl?: string): Promise<void> {
        if (!fileUrl) return;

        await s3.send(new DeleteObjectCommand({
            Bucket: storageConfig.bucket,
            Key: fileUrl
        }));
    }
}