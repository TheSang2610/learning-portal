const express = require("express");
const router = express.Router();
const { capIdHopLe } = require('../middlewares/idHopLe');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/idHopLe.js
capIdHopLe(router);

// 1. Import chính xác middleware uploadCloud từ file của bạn
const { uploadCloud } = require("../utils/uploadCloud"); 
const { datCache } = require('../middlewares/cacheControl');

const { 
    getProviders, 
    createProvider, 
    getProviderBySlug,
    updateProvider,
    deleteProvider
} = require("../controllers/providerController");

const { protect, admin } = require("../middlewares/authMiddleware");

// Tuyến đường cơ sở: /api/providers
router.route("/")
    .get(datCache(300), getProviders) // Công khai cho học viên xem danh sách logo đối tác
    .post(protect, admin, uploadCloud.single("logo"), createProvider); // 🎯 Dùng uploadCloud.single để bắt file ảnh logo

router.route("/:id")
    .put(protect, admin, uploadCloud.single("logo"), updateProvider) // 🎯 Cho phép cập nhật/đổi logo mới
    .delete(protect, admin, deleteProvider);

router.get("/slug/:slug", getProviderBySlug);

module.exports = router;