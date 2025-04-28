"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const config_1 = require("../config/config");
const s3 = new aws.S3({
    accessKeyId: config_1.config.ACCESS_KEY,
    secretAccessKey: config_1.config.SECRET_KEY,
    region: config_1.config.BUCKET_REGION,
});
// Set up multer for handling file uploads
const GalleryImages = multer({
    storage: multerS3({
        s3: s3,
        bucket: config_1.config.BUCKET_NAME,
        acl: "public-read",
        contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically set content type
        key: function (req, file, cb) {
            cb(null, `${config_1.config.IMAGES_FOLDER_PATH}${file.originalname.replace(/\s+/g, "")}`);
        },
    }),
});
module.exports = {
    GalleryImages,
};
