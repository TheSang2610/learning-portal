const Category = require('../models/categoryModel');
const Course = require('../models/Course');

// Hàm helper chuyển đổi Tiếng Việt có dấu thành Slug gọn đẹp
const slugify = (str) => {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/[^a-z0-9 -]/g, ""); // Xóa ký tự đặc biệt
    str = str.replace(/\s+/g, "-"); // Thay khoảng trắng bằng dấu -
    str = str.replace(/-+/g, "-"); // Tránh lặp dấu -
    return str;
};

// @desc    Tạo mới danh mục (Chỉ Admin/Instructor)
// @route   POST /api/categories
const createCategory = async (req, res) => {
    try {
        const { name, icon } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Vui lòng nhập tên danh mục' });
        }

        // Tự động tạo slug từ name
        const slug = slugify(name);

        // Kiểm tra trùng lặp trùng tên hoặc trùng slug
        const categoryExists = await Category.findOne({ $or: [{ name }, { slug }] });
        if (categoryExists) {
            return res.status(400).json({ message: 'Danh mục này đã tồn tại' });
        }

        const category = new Category({
            name,
            slug,
            icon: icon || ""
        });

        const createdCategory = await category.save();
        res.status(201).json(createdCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy tất cả danh mục (Ai cũng xem được)
// @route   GET /api/categories
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Sua danh muc
// @route   PUT /api/categories/:id
const updateCategory = async (req, res) => {
    try {
        const { name, icon } = req.body;

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        if (name && name !== category.name) {
            const slug = slugify(name);
            // Ten va slug deu unique -> phai loai chinh no ra khi kiem tra trung
            const dup = await Category.findOne({
                _id: { $ne: category._id },
                $or: [{ name }, { slug }]
            });
            if (dup) {
                return res.status(400).json({ message: 'Danh mục này đã tồn tại' });
            }
            category.name = name;
            category.slug = slug;
        }

        if (icon !== undefined) category.icon = icon;

        const updated = await category.save();
        res.json(updated);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Tên hoặc slug danh mục đã tồn tại' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xoa danh muc
// @route   DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Danh mục không tồn tại' });
        }

        // Chan xoa neu con khoa hoc dang dung -> tranh de lai tham chieu mo coi
        const inUse = await Course.countDocuments({ category: category._id });
        if (inUse > 0) {
            return res.status(400).json({
                message: `Không thể xóa: còn ${inUse} khóa học đang thuộc danh mục này`,
                coursesCount: inUse
            });
        }

        await category.deleteOne();
        res.json({ message: 'Đã xóa danh mục' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};