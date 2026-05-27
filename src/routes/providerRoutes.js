const express = require("express");
const router = express.Router();

// 1. Import chính xác middleware uploadCloud từ file của bạn
const { uploadCloud } = require("../utils/uploadCloud"); 

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
    .get(getProviders) // Công khai cho học viên xem danh sách logo đối tác
    .post(protect, admin, uploadCloud.single("logo"), createProvider); // 🎯 Dùng uploadCloud.single để bắt file ảnh logo

router.route("/:id")
    .put(protect, admin, uploadCloud.single("logo"), updateProvider) // 🎯 Cho phép cập nhật/đổi logo mới
    .delete(protect, admin, deleteProvider);

router.get("/slug/:slug", getProviderBySlug);

module.exports = router;