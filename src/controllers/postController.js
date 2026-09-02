const Post = require('../models/Post');
const { phanTrang } = require('../utils/truyVan');
const { CHU_DE, TEN_CHU_DE } = require('../models/Post');
const { checkText } = require('../utils/contentFilter');
const { taoSlug, tachTags } = require('../utils/vanBan');

const TRUONG_DANH_SACH =
    'title slug excerpt thumbnail topic tags author views createdAt';

// slug phai duy nhat. Trung thi them -2, -3... thay vi bao loi cho nguoi dung:
// hai bai trung ten la chuyen binh thuong.
async function slugDuyNhat(title) {
    const goc = taoSlug(title);
    let slug = goc;
    let n = 1;
    while (await Post.exists({ slug })) {
        n += 1;
        slug = `${goc}-${n}`;
    }
    return slug;
}

// @desc    Danh sach bai viet (cong khai)
// @route   GET /api/posts?page=1&limit=10&topic=ai-llm&tag=react&q=...
const getPosts = async (req, res) => {
    try {
        const { trang: page, soDong: limit, boQua: skip } = phanTrang(req.query, {
            macDinh: 10,
            toiDa: 50,
        });

        const filter = { isPublished: true };
        if (req.query.topic && CHU_DE.includes(req.query.topic)) {
            filter.topic = req.query.topic;
        }
        if (req.query.tag) filter.tags = req.query.tag;
        if (req.query.q?.trim()) filter.$text = { $search: req.query.q.trim() };

        const [posts, total] = await Promise.all([
            Post.find(filter)
                .select(TRUONG_DANH_SACH)
                .populate('author', 'name avatar role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Post.countDocuments(filter),
        ]);

        res.json({ posts, total, page, totalPages: Math.ceil(total / limit) || 1 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Danh sach chu de kem so bai
// @route   GET /api/posts/topics
const getTopics = async (req, res) => {
    try {
        const dem = await Post.aggregate([
            { $match: { isPublished: true } },
            { $group: { _id: '$topic', count: { $sum: 1 } } },
        ]);
        const map = Object.fromEntries(dem.map((d) => [d._id, d.count]));

        // Tra ve DU ca 6 chu de ke ca chu de chua co bai: thanh ben canh phai
        // on dinh, khong nhay khi bai viet moi duoc dang.
        res.json(CHU_DE.map((slug) => ({
            slug,
            name: TEN_CHU_DE[slug],
            count: map[slug] || 0,
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Chi tiet bai viet theo duong dan
// @route   GET /api/posts/:slug
const getPostBySlug = async (req, res) => {
    try {
        const post = await Post.findOne({ slug: req.params.slug, isPublished: true })
            .populate('author', 'name avatar role');

        if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết' });

        // Dem luot xem. Khong await de nguoi doc khong phai cho mot lan ghi.
        Post.updateOne({ _id: post._id }, { $inc: { views: 1 } }).catch(() => {});

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Kiem duyet ca ba truong, khong chi tieu de. Tra ve chuoi loi hoac null.
// Dung chung cho ca dang moi lan sua: sua bai cung phai qua bo loc, neu khong
// nguoi ta dang bai sach roi sua thanh bai ban la lot.
function loiKiemDuyet(title, excerpt, content) {
    for (const [ten, giaTri] of [
        ['Tiêu đề', title],
        ['Mô tả ngắn', excerpt],
        ['Nội dung', content],
    ]) {
        const r = checkText(giaTri);
        if (!r.ok) {
            return {
                message: `${ten} vi phạm quy định (${r.label}). Vui lòng sửa lại rồi đăng.`,
                category: r.category,
            };
        }
    }
    return null;
}

// @desc    Dang bai viet moi
// @route   POST /api/posts
const createPost = async (req, res) => {
    try {
        const title = (req.body.title || '').trim();
        const excerpt = (req.body.excerpt || '').trim();
        const content = (req.body.content || '').trim();

        if (!title || !excerpt || !content) {
            return res.status(400).json({
                message: 'Vui lòng nhập đầy đủ tiêu đề, mô tả ngắn và nội dung',
            });
        }

        // Cung bo loc dung cho tai lieu chia se.
        const loi = loiKiemDuyet(title, excerpt, content);
        if (loi) return res.status(400).json(loi);

        const tags = tachTags(req.body.tags);

        const post = await Post.create({
            title,
            slug: await slugDuyNhat(title),
            excerpt,
            content,
            thumbnail: (req.body.thumbnail || '').trim(),
            topic: CHU_DE.includes(req.body.topic) ? req.body.topic : 'others',
            tags,
            author: req.user._id,
            // Khong truyen gi thi dang luon, dung mac dinh cua model.
            isPublished: req.body.isPublished !== false,
        });

        const daLuu = await Post.findById(post._id).populate('author', 'name avatar role');
        res.status(201).json(daLuu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---------------------------------------------------------------------------
// Ba ham duoi day chi danh cho khu quan tri (protect + admin).
//
// Phai tach rieng khoi getPosts / getPostBySlug vi hai ham do co dinh loc
// isPublished: true. Admin can thay ca bai nhap de sua tiep, con doc gia thi
// khong duoc thay.
// ---------------------------------------------------------------------------

// @desc    Danh sach bai viet cho admin (ke ca bai nhap)
// @route   GET /api/posts/admin/all
const getAdminPosts = async (req, res) => {
    try {
        const { trang: page, soDong: limit, boQua: skip } = phanTrang(req.query, {
            macDinh: 20,
            toiDa: 50,
        });

        const filter = {};
        if (req.query.topic && CHU_DE.includes(req.query.topic)) {
            filter.topic = req.query.topic;
        }
        if (req.query.status === 'draft') filter.isPublished = false;
        if (req.query.status === 'published') filter.isPublished = true;
        if (req.query.q?.trim()) filter.$text = { $search: req.query.q.trim() };

        const [posts, total] = await Promise.all([
            Post.find(filter)
                // Khong lay 'content': mot bai toi da 50.000 ky tu, ca trang
                // danh sach se nang vo ich. Trinh soan lay rieng qua /admin/:id.
                .select(`${TRUONG_DANH_SACH} isPublished updatedAt`)
                .populate('author', 'name avatar role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Post.countDocuments(filter),
        ]);

        res.json({ posts, total, page, totalPages: Math.ceil(total / limit) || 1 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mot bai viet day du cho trinh soan (ke ca bai nhap)
// @route   GET /api/posts/admin/:id
const getAdminPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name avatar role');
        if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Sua bai viet
// @route   PUT /api/posts/:id
const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết' });

        const title = (req.body.title ?? post.title).trim();
        const excerpt = (req.body.excerpt ?? post.excerpt).trim();
        const content = (req.body.content ?? post.content).trim();

        if (!title || !excerpt || !content) {
            return res.status(400).json({
                message: 'Vui lòng nhập đầy đủ tiêu đề, mô tả ngắn và nội dung',
            });
        }

        const loi = loiKiemDuyet(title, excerpt, content);
        if (loi) return res.status(400).json(loi);

        // Doi tieu de KHONG doi duong dan cua bai da dang: link nguoi ta da
        // chia se ra ngoai se chet. Bai con nhap thi chua ai co link nen sua
        // thoai mai.
        if (!post.isPublished && title !== post.title) {
            post.slug = await slugDuyNhat(title);
        }

        post.title = title;
        post.excerpt = excerpt;
        post.content = content;
        if (req.body.thumbnail !== undefined) post.thumbnail = String(req.body.thumbnail).trim();
        if (CHU_DE.includes(req.body.topic)) post.topic = req.body.topic;
        if (req.body.tags !== undefined) post.tags = tachTags(req.body.tags);
        if (typeof req.body.isPublished === 'boolean') post.isPublished = req.body.isPublished;

        await post.save();

        const daLuu = await Post.findById(post._id).populate('author', 'name avatar role');
        res.json(daLuu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xoa bai viet (tac gia hoac admin)
// @route   DELETE /api/posts/:id
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết' });

        const laTacGia = String(post.author) === String(req.user._id);
        if (!laTacGia && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn chỉ có thể xóa bài viết của mình' });
        }

        await post.deleteOne();
        res.json({ message: 'Đã xóa bài viết' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPosts,
    getTopics,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost,
    getAdminPosts,
    getAdminPostById,
};
