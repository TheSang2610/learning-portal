const mongoose = require('mongoose');

// Danh sach chu de co dinh. De cung o day thay vi tao bang rieng: sau mot nam
// danh sach nay gan nhu khong doi, ma them mot bang thi moi truy van danh sach
// bai viet phai populate them mot lan.
const CHU_DE = [
    'front-end-mobile-apps',
    'back-end-devops',
    'ai-llm',
    'tester-testing',
    'ui-ux-design',
    'others',
];

const TEN_CHU_DE = {
    'front-end-mobile-apps': 'Front-end / Mobile apps',
    'back-end-devops': 'Back-end / Devops',
    'ai-llm': 'AI / LLM',
    'tester-testing': 'Tester / Testing',
    'ui-ux-design': 'UI / UX / Design',
    'others': 'Others',
};

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vui lòng nhập tiêu đề bài viết'],
        trim: true,
        maxlength: [200, 'Tiêu đề tối đa 200 ký tự']
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Doan mo ta ngan hien o danh sach. Khong lay tu dau bai viet vi cau mo dau
    // thuong khong tom tat duoc gi.
    excerpt: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả ngắn'],
        trim: true,
        maxlength: [400, 'Mô tả ngắn tối đa 400 ký tự']
    },

    content: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung bài viết'],
        maxlength: [50000, 'Nội dung tối đa 50000 ký tự']
    },

    thumbnail: {
        type: String,
        default: ''
    },

    topic: {
        type: String,
        enum: CHU_DE,
        default: 'others',
        index: true
    },

    tags: {
        type: [String],
        default: []
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    views: {
        type: Number,
        default: 0
    },

    isPublished: {
        type: Boolean,
        default: true,
        index: true
    }
}, { timestamps: true });

// Danh sach luon sap moi nhat truoc.
postSchema.index({ createdAt: -1 });
postSchema.index({ title: 'text', excerpt: 'text' });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
module.exports.CHU_DE = CHU_DE;
module.exports.TEN_CHU_DE = TEN_CHU_DE;
