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