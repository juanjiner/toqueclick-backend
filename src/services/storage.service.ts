import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { storageConfig } from "../config/storage.js";
import sharp from "sharp";
import path from "path";

const s3 = new S3Client({
    region: storageConfig.region
});

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

const MAX_DIMENSION = 1200;
const WEBP_QUALITY = 82;

export class StorageService {

    private getKey(folder: string, filename: string): string {
        return `static/${folder}/${filename}`;
    }

    private async processImage(buffer: Buffer): Promise<Buffer> {
        return sharp(buffer)
            .rotate()
            .resize({
                width: MAX_DIMENSION,
                height: MAX_DIMENSION,
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: WEBP_QUALITY })
            .toBuffer();
    }

    async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {

        let buffer = file.buffer;
        let filename = file.originalname;
        let contentType = file.mimetype;

        if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
            buffer = await this.processImage(file.buffer);
            filename = path.basename(filename, path.extname(filename)) + '.webp';
            contentType = 'image/webp';
        }

        const key = this.getKey(folder, filename);

        await s3.send(new PutObjectCommand({
            Bucket: storageConfig.bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            CacheControl: "public, max-age=31536000, immutable"
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
