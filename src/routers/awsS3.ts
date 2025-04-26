const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
import { config } from "../config/config";

const s3 = new aws.S3({
  accessKeyId: config.ACCESS_KEY,
  secretAccessKey: config.SECRET_KEY,
  region: config.BUCKET_REGION,
});

// Set up multer for handling file uploads
const GalleryImages = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.BUCKET_NAME,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically set content type
    key: function (req: any, file: any, cb: any) {
      cb(
        null,
        `${config.IMAGES_FOLDER_PATH}${file.originalname.replace(/\s+/g, "")}`
      );
    },
  }),
});

module.exports = {
  GalleryImages,
};
