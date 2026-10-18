const express = require('express');
const router = express.Router();

const { getAppearance, updateAppearance } = require('../controllers/settingsController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { setCache, noStore } = require('../middlewares/cacheControl');

// Doc: cong khai, giong nhau cho moi nguoi -> cho CDN giu 30 giay.
router.get('/appearance', setCache(30), getAppearance);
// Ghi: chi admin.
router.put('/appearance', noStore, protect, admin, updateAppearance);

module.exports = router;
