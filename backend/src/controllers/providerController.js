const Provider = require("../models/providerModel"); 
const { uploadToCloudinary } = require("../utils/uploadCloud");


const slugify = (str) => {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/[^a-z0-9 -]/g, ""); 
    str = str.replace(/\s+/g, "-"); 
    str = str.replace(/-+/g, "-"); 
    return str;
};

// @desc    Lấy toàn bộ danh sách đối tác (Sắp xếp mới nhất lên đầu)
// @route   GET /api/providers
const getProviders = async (req, res) => {
    try {
        const providers = await Provider.find({}).sort({ createdAt: -1 });
        res.status(200).json(providers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Tạo mới một đối tác (Đã tích hợp luồng Cloudinary Stream)
// @route   POST /api/providers
const createProvider = async (req, res) => {
    try {
        const { name, type } = req.body;
        const slug = slugify(name);

        const providerExists = await Provider.findOne({ slug });
        if (providerExists) {
            return res.status(400).json({ message: "Đối tác hoặc trường học này đã tồn tại tên." });
        }

        // 🎯 ĐÃ SỬA: Xử lý đẩy buffer của Multer lên Cloudinary Stream
        let logoUrl = "";
        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer);
            logoUrl = uploadResult.secure_url; // Lấy link ảnh an toàn trả về từ Cloudinary
        } else {
            logoUrl = req.body.logo || "https://res.cloudinary.com/demo/image/upload/sample.jpg";
        }

        const provider = await Provider.create({
            name,
            slug,
            logo: logoUrl,
            type: type || "company"
        });

        res.status(201).json(provider);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cập nhật thông tin đối tác (Có hỗ trợ thay đổi logo)
// @route   PUT /api/providers/:id
const updateProvider = async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id);

        if (!provider) {
            return res.status(404).json({ message: "Không tìm thấy đối tác cần cập nhật." });
        }

        // Nếu Admin thay đổi tên đối tác, tự động cập nhật lại hệ thống SEO Slug
        if (req.body.name && req.body.name !== provider.name) {
            const newSlug = slugify(req.body.name);
            const slugExists = await Provider.findOne({ slug: newSlug, _id: { $ne: provider._id } });
            if (slugExists) {
                return res.status(400).json({ message: "Tên đối tác mới bị trùng link với đơn vị khác." });
            }
            provider.name = req.body.name;
            provider.slug = newSlug;
        }

        // 🎯 ĐÃ BỔ SUNG: Cho phép update đè logo mới lên Cloudinary nếu Admin chọn file mới
        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer);
            provider.logo = uploadResult.secure_url;
        }

        if (req.body.type) {
            provider.type = req.body.type;
        }

        const updatedProvider = await provider.save();
        res.status(200).json(updatedProvider);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xóa đối tác kèm ràng buộc dữ liệu khóa học
// @route   DELETE /api/providers/:id
const deleteProvider = async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id);
        if (!provider) {
            return res.status(404).json({ message: "Không tìm thấy đối tác cần xóa." });
        }

        // Ràng buộc bảo mật: Nếu có khóa học nào thuộc trường/công ty này, không cho phép xóa bừa bãi
        const Course = require("../models/Course");
        const hasCourse = await Course.findOne({ provider: provider._id });
        if (hasCourse) {
            return res.status(400).json({ 
                message: "Không thể xóa! Hiện tại đang có khóa học thuộc quyền quản lý của trường/công ty đối tác này." 
            });
        }

        await provider.deleteOne();
        res.status(200).json({ message: "Đã xóa đối tác thành công khỏi hệ thống dữ liệu." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy chi tiết đối tác theo slug (Phục vụ SEO trang đối tác)
// @route   GET /api/providers/slug/:slug
const getProviderBySlug = async (req, res) => {
    try {
        const provider = await Provider.findOne({ slug: req.params.slug });
        if (!provider) {
            return res.status(404).json({ message: "Không tìm thấy đối tác" });
        }
        res.status(200).json(provider);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getProviders, 
    createProvider, 
    updateProvider, 
    deleteProvider, 
    getProviderBySlug 
};