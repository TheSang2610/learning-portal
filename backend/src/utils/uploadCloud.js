const multer = require('multer');
const layCloudinary = require('../config/cloudinary');


const storage = multer.memoryStorage();


// GIOI HAN BAT BUOC. memoryStorage nghia la ca file nam trong RAM cua may chu.
// Truoc day cho nay khong dat limits: mot nguoi dung co quyen dang bai co the
// day len file vai GB va lam het bo nho may chu.
//
// 100MB de con cho video bai hoc. Anh bia va logo nho hon nhieu nhung dung
// chung mot bo nay; hai duong moi hon (tai lieu, anh dai dien) co bo multer
// rieng voi han chat hon - xem documentRoutes.js va userRoutes.js.
const MAX_UPLOAD_MB = 100;

const uploadCloud = multer({
  storage: storage,
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
});

const uploadLessonFiles = uploadCloud.fields([
  { name: 'video', maxCount: 1 },
  { name: 'document', maxCount: 1 }
]);

// Tham so thu ba `options` la tuy chon va duoc gop de len cau hinh mac dinh,
// nen moi lenh goi cu (chi truyen buffer, hoac buffer + resourceType) van chay
// y nguyen. Them vao de phia tai lieu dat duoc folder va public_id rieng:
// file raw phai co duoi trong public_id thi Cloudinary moi tra ve dung kieu noi dung.
const uploadToCloudinary = (fileBuffer, resourceType = 'auto', options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = layCloudinary().uploader.upload_stream(
      {
        folder: 'learning-portal',
        resource_type: resourceType,
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};

module.exports = { uploadCloud, uploadLessonFiles, uploadToCloudinary };  