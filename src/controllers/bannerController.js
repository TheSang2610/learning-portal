const Banner = require('../models/Banner');
const { uploadToCloudinary } = require('../utils/uploadCloud'); 
const cloudinary = require('../config/cloudinary');

/**
 * 1. LẤY DANH SÁCH BANNER (Lọc theo từng Page & đồng bộ format)
 * GET /api/banners?page=HOME
 */
const getBanners = async (req, res) => {
  try {
    const { page, admin } = req.query; // 🔥 Thêm biến 'admin' nhận từ URL query
    
    const filter = {};
    
    // Nếu KHÔNG PHẢI admin gọi, hoặc admin truyền lên là false thì mới ép bộ lọc chỉ lấy banner đang bật
    if (admin !== 'true') {
      filter.isActive = true;
    }
    
    if (page) {
      filter.page = page.toUpperCase(); 
    }

    const banners = await Banner.find(filter).sort({ order: 1 });
    
    // Trả về theo cấu trúc Object chuẩn hóa
    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Lỗi khi lấy danh sách banner", 
      error: error.message 
    });
  }
};

/**
 * 2. TẠO MỚI BANNER
 * POST /api/banners
 */
const createBanner = async (req, res) => {
  try {
    const bannerData = { ...req.body };

    if (!bannerData.page) {
      return res.status(400).json({ success: false, message: "Vui lòng cung cấp vị trí hiển thị (page)" });
    }
    bannerData.page = bannerData.page.toUpperCase();

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'image');
      bannerData.imageUrl = result.secure_url;     
      bannerData.cloudinaryId = result.public_id;   
    }

    const newBanner = new Banner(bannerData);
    await newBanner.save();

    res.status(201).json({
      success: true,
      message: `Tạo banner thành công cho trang ${bannerData.page}!`,
      data: newBanner
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Lỗi khi tạo banner", 
      error: error.message 
    });
  }
};

/**
 * 3. SỬA BANNER
 * PUT /api/banners/:id
 */
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    let banner = await Banner.findById(id);
    
    if (!banner) {
      return res.status(404).json({ success: false, message: "Không tìm thấy banner cần sửa" });
    }

    const updateData = { ...req.body };
    if (updateData.page) updateData.page = updateData.page.toUpperCase();

    if (req.file) {
      if (banner.cloudinaryId) {
        await cloudinary.uploader.destroy(banner.cloudinaryId);
      }
      
      const result = await uploadToCloudinary(req.file.buffer, 'image');
      updateData.imageUrl = result.secure_url;
      updateData.cloudinaryId = result.public_id;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, { 
      new: true,          
      runValidators: true 
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật banner thành công!",
      data: updatedBanner
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Lỗi khi cập nhật banner", 
      error: error.message 
    });
  }
};

/**
 * 4. XÓA BANNER
 * DELETE /api/banners/:id
 */
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({ success: false, message: "Không tìm thấy banner cần xóa" });
    }

    if (banner.cloudinaryId) {
      await cloudinary.uploader.destroy(banner.cloudinaryId);
    }

    await Banner.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Đã xóa banner khỏi hệ thống hoàn toàn!"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Lỗi khi xóa banner", 
      error: error.message 
    });
  }
};

module.exports = {
  createBanner,
  updateBanner,
  deleteBanner,
  getBanners
};