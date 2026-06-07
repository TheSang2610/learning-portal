const multer = require('multer');
const cloudinary = require('../config/cloudinary'); 


const storage = multer.memoryStorage();


const uploadCloud = multer({ 
  storage: storage
});

const uploadLessonFiles = uploadCloud.fields([
  { name: 'video', maxCount: 1 },
  { name: 'document', maxCount: 1 }
]);

const uploadToCloudinary = (fileBuffer, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { 
        folder: 'learning-portal', 
        resource_type: resourceType
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