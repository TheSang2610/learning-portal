const express = require('express');
const router = express.Router();
const { capIdHopLe } = require('../middlewares/idHopLe');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/idHopLe.js
capIdHopLe(router);
const bannerController = require('../controllers/bannerController');

const { uploadCloud } = require('../utils/uploadCloud');
const { datCache } = require('../middlewares/cacheControl');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', datCache(120), bannerController.getBanners);

router.post('/', protect, admin, uploadCloud.single('image'), bannerController.createBanner);

router.put('/:id', protect, admin, uploadCloud.single('image'), bannerController.updateBanner);

router.delete('/:id', protect, admin, bannerController.deleteBanner);

module.exports = router;