// Nap cloudinary theo kieu LUOI.
//
// Do duoc: require('cloudinary') mat ~295ms, tuc gan 1/4 tong thoi gian nap
// module cua ca may chu (~1.8 giay). Tren Vercel moi lan cold start deu tra
// khoan do, ke ca khi yeu cau chi la GET /api/posts - mot duong khong dung
// den Cloudinary bao gio.
//
// Node co san bo nho dem module, nen require nam trong ham chi cham o lan goi
// dau tien; nhung lan sau lay ngay tu dem.
//
// Dung: const layCloudinary = require('../config/cloudinary');
//       layCloudinary().uploader.destroy(id)

let cloudinary = null;

function layCloudinary() {
    if (cloudinary) return cloudinary;

    cloudinary = require('cloudinary').v2;

    // Nhan hai cach khai bao:
    //
    //   CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
    //     Mot dong duy nhat, Cloudinary in san tren trang Dashboard nen chi
    //     viec copy - de nhat va it go nham nhat.
    //
    //   Hoac ba bien roi CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET.
    //
    // Uu tien CLOUDINARY_URL: co no thi goi config(true) de SDK tu tach chuoi.
    if (process.env.CLOUDINARY_URL) {
        cloudinary.config(true);
    } else {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    return cloudinary;
}

module.exports = layCloudinary;
