import multer from "multer";

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    const allowed = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv"
    ];

    if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Solo archivos Excel o CSV"));
    }

    cb(null, true);
};

export const excelUploadFactory = () =>
    multer({
        storage: multer.memoryStorage(),
        fileFilter,
        limits: {
            fileSize: 10 * 1024 * 1024
        }
    });
