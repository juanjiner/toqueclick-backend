import multer from "multer";

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png"];

    if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Solo imágenes JPG o PNG"));
    }

    cb(null, true);
};

export const uploadFactory = () =>
    multer({
        storage: multer.memoryStorage(),
        fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024
        }
    });

const mediaFileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    const allowed = [
        // Images
        "image/jpeg", "image/png", "image/webp", "image/gif",
        // Audio
        "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a", "audio/x-m4a", "audio/webm",
        // Video
        "video/mp4", "video/webm", "video/ogg", "video/quicktime"
    ];

    if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Solo se permiten imágenes (JPG, PNG, WEBP, GIF), audios (MP3, WAV, M4A, OGG) y videos (MP4, WEBM, MOV)"));
    }

    cb(null, true);
};

export const uploadBlogMediaFactory = () =>
    multer({
        storage: multer.memoryStorage(),
        fileFilter: mediaFileFilter,
        limits: {
            fileSize: 100 * 1024 * 1024 // 100MB
        }
    });