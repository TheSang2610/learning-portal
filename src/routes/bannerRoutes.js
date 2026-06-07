const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');

const { uploadCloud } = require('../utils/uploadCloud'); 

router.get('/', bannerController.getBanners);

router.post('/', uploadCloud.single('image'), bannerController.createBanner);

router.put('/:id', uploadCloud.single('image'), bannerController.updateBanner);

router.delete('/:id', bannerController.deleteBanner);

module.exports = router;