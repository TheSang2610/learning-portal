const { Readable } = require('stream');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const getCloudinary = require('../config/cloudinary');
const { phanTrang: paginate } = require('../utils/queryParams');
const { uploadToCloudinary } = require('../utils/uploadCloud');
const { checkDocument, checkText } = require('../utils/contentFilter');
const { normalizeContent, stripTags } = require('../utils/postHtml');
const { createSlug } = require('../utils/textUtils');
const DocumentActivity = require('../models/DocumentActivity');
const DocumentSubject = require('../models/DocumentSubject');
const DocumentCategory = require('../models/DocumentCategory');
const DocumentUniversity = require('../models/DocumentUniversity');
const { validateSchool } = require('./documentUniversityController');
const DocumentComment = require('../models/DocumentComment');
const SavedItem = require('../models/SavedItem');
const { validateComment, rootCommentId, buildCommentTree } = require('../utils/documentComments');
const { parseRawSubjects, fixFileName } = require('../utils/documentInput');
const { filterExternalImages, demAnh: countImages } = require('../utils/documentImages');
const {
    normalizeSubject,
    subjectsOf,
    summarizeHistory,
    groupHistoryByDocument,
    splitKeywords,
    rankDocuments,
} = require('../utils/rankDocuments');

const ALLOWED_TYPES = ['pdf', 'doc', 'docx'];

// Noi dung bai: du dai cho bai huong dan nhieu buoc co anh. Khop maxlength o model.
const CONTENT_LIMIT = 20000;
const MAX_IMAGES = 20;

/** Tien to URL anh tren kho Cloudinary cua du an - xem utils/documentImages.js. */
const imagePrefix = () => {
    const entryName = getCloudinary().config().cloud_name;
    return entryName ? `https://res.cloudinary.com/${entryName}/image/upload/` : '';
};

/**
 * Loc noi dung bai: HTML sach (normalizeContent) + chi giu anh cua he thong.
 * Dung cho CA HAI duong ghi (dang bai, sua bai).
 */
const filterContent = (tho) => filterExternalImages(normalizeContent(tho), imagePrefix());

// Cac truong tra ra ngoai cho moi duong doc cong khai.
//
// Gom ve mot cho: truoc day chuoi nay chep lai o BA noi (danh sach, chi tiet,
// sau khi dang), them mot truong la phai sua ca ba - sot mot cho la mot trang
// thieu du lieu ma khong co loi nao bao ra.
//
// KHONG co filePublicId: do la chi tiet noi bo cua Cloudinary, nguoi xem khong
// can va cang khong nen biet. Cung KHONG co fileUrl: duong delivery do bi
// Cloudinary chan (401), giao dien luon mo file qua GET /:id/file?i=.
const PUBLIC_FIELDS =
    'title description monHoc truong files.fileName files.fileExt files.fileSize uploader downloadCount luotXem createdAt';

/**
 * Cac file cua mot tai lieu (ban .lean()).
 *
 * Tai lieu cu truoc khi chuyen du lieu chi co cac truong le fileUrl/fileName...
 * - doc ca dang do de khong phu thuoc viec script migrate da chay hay chua.
 */
const filesOf = (doc) => {
    if (doc && Array.isArray(doc.files) && doc.files.length) return doc.files;
    if (doc && doc.fileUrl) {
        return [{
            fileUrl: doc.fileUrl,
            filePublicId: doc.filePublicId || '',
            fileName: doc.fileName || '',
            fileExt: doc.fileExt || 'pdf',
            fileSize: doc.fileSize || 0,
        }];
    }
    return [];
};

// Cloudinary chua cau hinh thi upload se nem loi kho hieu tan sau.
// Kiem o day de tra ve dung nguyen nhan.
const cloudinaryReady = () => {
    const c = getCloudinary().config();
    return Boolean(c.cloud_name && c.api_key && c.api_secret);
};

const fileExtension = (name = '') => String(name).split('.').pop().toLowerCase();

// Dieu kien "dang hien" cho MOI duong doc cong khai. Xem ghi chu o truong
// daAn trong models/Document.js ve vi sao la $ne: true chu khong phai false.
const VISIBLE = { daAn: { $ne: true } };

/**
 * Doi CAC mon nguoi dung chon ra mon THAT trong danh sach admin quan ly.
 *
 * Dung chung cho createDocument va updateDocument - HAI duong ghi mon hoc
 * phai theo MOT bo luat.
 *
 * Nhan ca ten ("Cấu trúc dữ liệu") lan khoa ("cau truc du lieu"): ca hai chuan
 * hoa ra cung mot khoa. Tra ve ten va khoa LAY TU DANH SACH, khong lay tu chu
 * nguoi gui - de moi tai lieu cung mon mang cung mot cach viet. Giu dung thu
 * tu nguoi dung chon, bo trung.
 *
 * Tra ve { ok: true, monHoc: [], monHocKey: [] } hoac { ok: false, body }.
 */
const validateSubjects = async (tho) => {
    const course = [...new Set(parseRawSubjects(tho).map(normalizeSubject).filter(Boolean))];
    const errorMessage = (message) => ({ ok: false, body: { message, field: 'monHoc' } });
    if (!course.length) return errorMessage('Vui lòng chọn ít nhất một môn học của tài liệu');
    if (course.length > Document.MAX_SUBJECTS) {
        return errorMessage(`Chọn tối đa ${Document.MAX_SUBJECTS} môn học cho một tài liệu`);
    }
    // $in voi mang CHUOI da chuan hoa - khong co cach nao chen toan tu vao.
    const docRows = await DocumentSubject.find({ key: { $in: course } }).select('ten key').lean();
    const byKey = new Map(docRows.map((m) => [m.key, m]));
    if (course.some((k) => !byKey.has(k))) {
        // Mon vua bi admin xoa, hoac request gui tay mot mon khong co.
        return errorMessage('Có môn học không còn trong danh sách. Vui lòng chọn lại.');
    }
    return { ok: true, monHoc: course.map((k) => byKey.get(k).ten), monHocKey: course };
};

// Bo dau + thay ky tu la, de lam public_id tren Cloudinary.
// Tab loai tai lieu o trang tat ca tai lieu. Mot bai kem ca PDF lan Word thi
// nam o ca hai tab - dung: nguoi tim PDF van can thay no.
const WORD_EXTENSIONS = ['doc', 'docx'];
const TYPE_FILTERS = {
    pdf: { 'files.fileExt': 'pdf' },
    word: { 'files.fileExt': { $in: WORD_EXTENSIONS } },
    // Bai huong dan kieu blog: khong kem file nao.
    baiViet: { 'files.0': { $exists: false } },
};

/**
 * Dem theo loai + tong luot tai + so nguoi chia se, trong MOT lan quet.
 * `filter` co the chua $text - $match dung dau pipeline nen van hop le.
 */
const countByType = async (filter) => {
    const extension = { $ifNull: ['$files.fileExt', []] };
    const [outcome] = await Document.aggregate([
        { $match: filter },
        {
            $group: {
                _id: null,
                tong: { $sum: 1 },
                luotTai: { $sum: { $ifNull: ['$downloadCount', 0] } },
                nguoi: { $addToSet: '$uploader' },
                pdf: { $sum: { $cond: [{ $in: ['pdf', extension] }, 1, 0] } },
                word: { $sum: { $cond: [{ $gt: [{ $size: { $setIntersection: [extension, WORD_EXTENSIONS] } }, 0] }, 1, 0] } },
                baiViet: { $sum: { $cond: [{ $eq: [{ $size: { $ifNull: ['$files', []] } }, 0] }, 1, 0] } },
            },
        },
    ]);
    if (!outcome) return { tong: 0, luotTai: 0, soNguoiChiaSe: 0, pdf: 0, word: 0, baiViet: 0 };
    return {
        tong: outcome.tong,
        luotTai: outcome.luotTai,
        soNguoiChiaSe: outcome.nguoi.length,
        pdf: outcome.pdf,
        word: outcome.word,
        baiViet: outcome.baiViet,
    };
};

// Mot luot tai nang ky hon mot luot xem: tai ve la da can that, xem co khi
// chi la bam nham.
const DOWNLOAD_WEIGHT = 3;

/**
 * Tai lieu theo diem pho bien = luotXem + 3 x luot tai, cao truoc; bang diem
 * thi moi hon truoc. Sap theo bieu thuc thi phai qua aggregate - lay id theo
 * thu tu roi moi find + populate nhu cac duong khac.
 */
const getByPopularity = async (filter, skip, limit) => {
    const ids = (await Document.aggregate([
        { $match: filter },
        {
            $addFields: {
                popularityScore: {
                    $add: [
                        { $ifNull: ['$luotXem', 0] },
                        { $multiply: [{ $ifNull: ['$downloadCount', 0] }, DOWNLOAD_WEIGHT] },
                    ],
                },
            },
        },
        { $sort: { popularityScore: -1, createdAt: -1, _id: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $project: { _id: 1 } },
    ])).map((d) => String(d._id));
    const docs = await Document.find({ _id: { $in: ids } })
        .select(PUBLIC_FIELDS)
        .populate('uploader', 'name avatar');
    const theoId = new Map(docs.map((d) => [String(d._id), d]));
    return ids.map((id) => theoId.get(id)).filter(Boolean);
};

// @desc    Danh sach tai lieu (cong khai)
// @route   GET /api/documents?page=1&limit=12&q=tu-khoa&mon=cau-truc-du-lieu&loai=pdf&thongKe=1
//
// KHONG ghi lich su tim kiem o day, du day chinh la cho nguoi dung tim: duong
// nay gan setCache(60) trong documentRoutes, nghia la CDN co the tra ban luu
// san ma khong goi toi ham nay - code ghi se lang le khong chay. Ghi chu o
// middlewares/cacheControl.js cam dung dieu nay. Lich su tim di qua duong rieng
// POST /api/documents/tim-kiem.
const getDocuments = async (req, res) => {
    try {
        const { trang: page, soDong: limit, skip: skip } = paginate(req.query, {
            defaults: 12,
            toiDa: 50,
        });
        const q = (req.query.q || '').trim();
        // Loc theo KHOA mon, khong theo ten hien thi - xem monHocKey trong model.
        const subjectItem = normalizeSubject(req.query.mon);
        // Loc theo LINH VUC (?nhom=luat): moi tai lieu co it nhat mot mon thuoc
        // linh vuc do. Tai lieu khong tro thang toi linh vuc - doi ra danh sach
        // khoa mon truoc.
        const group = normalizeSubject(req.query.nhom);
        // Loc theo TRUONG dai hoc (?truong=hoc-vien-cong-nghe-...).
        const school = normalizeSubject(req.query.truong);

        const filter = { ...VISIBLE };
        if (q) filter.$text = { $search: q };
        if (subjectItem) filter.monHocKey = subjectItem;
        if (school) filter.truongKey = school;
        if (group) {
            const field = await DocumentCategory.findOne({ key: group }).select('_id').lean();
            const subjectSlugKey = field
                ? (await DocumentSubject.find({ nhom: field._id }).select('key').lean()).map((m) => m.key)
                : [];
            // Linh vuc la / chua co mon nao: $in rong -> khong khop gi, dung y.
            // Co ca ?mon thi phai thoa CA HAI - $all gop hai dieu kien tren cung truong.
            filter.monHocKey = subjectItem
                ? { $all: [subjectItem], $in: subjectSlugKey }
                : { $in: subjectSlugKey };
        }

        // So lieu cho dai dau trang tat ca tai lieu (?thongKe=1): tinh tren bo
        // loc CHUA tach loai, de cac tab "PDF / Word / Bai viet" hien du so cua
        // ca ba du dang dung o tab nao.
        // Ban SAO: ngay duoi day filter con bi them dieu kien loai.
        const stats = req.query.thongKe === '1' ? countByType({ ...filter }) : null;

        // ?loai=pdf|word|baiViet - tab loai tai lieu. Chi nhan dung ba gia tri.
        if (Object.hasOwn(TYPE_FILTERS, req.query.loai || '')) {
            Object.assign(filter, TYPE_FILTERS[req.query.loai]);
        }

        // ?sapXep=luotTai: tai nhieu nhat truoc (muc "Noi bat" o trang chu khu
        // tai lieu). ?sapXep=phoBien: xem + tai nhieu nhat (goi y cho moi
        // nguoi). Mac dinh moi nhat truoc. Chi nhan dung cac gia tri nay -
        // khong dua thang chuoi nguoi dung vao .sort().
        const sort = req.query.sapXep === 'luotTai'
            ? { downloadCount: -1, createdAt: -1 }
            : { createdAt: -1 };

        // Dem va lay du lieu chay song song - hai truy van doc lap nhau.
        const [documents, total, figures] = await Promise.all([
            req.query.sapXep === 'phoBien'
                ? getByPopularity(filter, skip, limit)
                : Document.find(filter)
                    .select(PUBLIC_FIELDS)
                    .populate('uploader', 'name avatar')
                    .sort(sort)
                    .skip(skip)
                    .limit(limit),
            Document.countDocuments(filter),
            stats,
        ]);

        res.json({
            documents,
            total,
            page,
            totalPages: Math.ceil(total / limit) || 1,
            ...(figures ? { thongKe: figures } : {}),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Chi tiet mot tai lieu (cong khai)
// @route   GET /api/documents/:id
const getDocumentById = async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, ...VISIBLE })
            .select(PUBLIC_FIELDS)
            .populate('uploader', 'name avatar');

        if (!doc) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
        res.json(doc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Dang tai lieu moi
// @route   POST /api/documents
const createDocument = async (req, res) => {
    try {
        const title = (req.body.title || '').trim();

        // PHAI loc HTML o day. Truoc day cho nay chi .trim() roi luu thang, va
        // giao dien thi do mo ta ra bang dangerouslySetInnerHTML (xem
        // frontend ArticleWithOutline, no tu doan chuoi nao giong HTML thi ve
        // nguyen). Ai dang duoc tai lieu la nhet duoc <script> chay trong
        // trinh duyet cua MOI nguoi mo tai lieu do - XSS luu tru.
        //
        // postController da di qua normalizeContent tu lau; duong nay bi bo sot.
        // Them duong ghi mo ta moi thi cung phai goi ham nay.
        const description = filterContent(req.body.description);

        if (!title || !description) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ tiêu đề và nội dung' });
        }
        if (title.length > 200) {
            return res.status(400).json({ message: 'Tiêu đề tối đa 200 ký tự' });
        }

        // Mon hoc bat buoc voi tai lieu MOI - goi y theo mon dua het vao day.
        const subjectItem = await validateSubjects(req.body.monHoc);
        if (!subjectItem.ok) return res.status(400).json(subjectItem.body);
        const { monHoc: subject, monHocKey: subjectKey } = subjectItem;
        // Truong dai hoc: khong bat buoc, nhung co gui thi phai co trong danh sach.
        const tr = await validateSchool(req.body.truong);
        if (!tr.ok) return res.status(400).json(tr.body);
        // Do dai dem SAU khi loc: bo loc cat bot nen ban tho dai hon nguong ma
        // phan giu lai van vua thi khong co ly do tu choi.
        if (description.length > CONTENT_LIMIT) {
            return res.status(400).json({ message: `Nội dung tối đa ${CONTENT_LIMIT} ký tự` });
        }
        if (countImages(description) > MAX_IMAGES) {
            return res.status(400).json({ message: `Tối đa ${MAX_IMAGES} ảnh trong một bài` });
        }

        // Loc noi dung TRUOC khi day file len Cloudinary, de bai vi pham
        // khong kip chiem dung luong.
        //
        // stripTags() de bo loc tu ngu doc CHU chu khong doc the: de nguyen HTML
        // thi ten the va ten thuoc tinh lot vao phep dem tu, vua bao dong nham
        // vua che mat tu that nam giua hai the.
        const moderate = checkDocument({ title, description: stripTags(description) });
        if (!moderate.ok) {
            return res.status(400).json({
                message: moderate.message,
                field: moderate.field,
                category: moderate.category,
            });
        }

        // File KHONG bat buoc: bai huong dan kieu blog co the chi co chu va anh.
        const tep = Array.isArray(req.files) ? req.files : [];
        if (tep.length > Document.MAX_FILES) {
            return res.status(400).json({ message: `Tối đa ${Document.MAX_FILES} file cho một tài liệu` });
        }
        if (tep.some((f) => !ALLOWED_TYPES.includes(fileExtension(f.originalname)))) {
            return res.status(400).json({ message: 'Chỉ chấp nhận file PDF, DOC hoặc DOCX' });
        }

        if (tep.length && !cloudinaryReady()) {
            return res.status(503).json({
                message:
                    'Máy chủ chưa cấu hình nơi lưu trữ file. Cần đặt CLOUDINARY_CLOUD_NAME, ' +
                    'CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET trong file .env của backend.',
            });
        }

        // resource_type 'raw' cho file khong phai anh. Duoi file phai nam trong
        // public_id thi link tai ve moi dung dinh dang. So thu tu -1, -2...
        // giu cac file cung bai khong de len nhau.
        const origin = `${createSlug(title, { dai: 60, defaults: 'tai-lieu' })}-${Date.now()}`;
        const result = await Promise.allSettled(
            tep.map((f, i) =>
                uploadToCloudinary(f.buffer, 'raw', {
                    folder: 'learning-portal/documents',
                    public_id: `${origin}-${i + 1}.${fileExtension(f.originalname)}`,
                    use_filename: false,
                    unique_filename: false,
                }),
            ),
        );
        const downloaded = result.filter((k) => k.status === 'fulfilled').map((k) => k.value);

        // Hong MOT file la hong ca bai: dang bai thieu chuong con te hon la bao
        // loi de nguoi dung gui lai. Don cac file da len kho de khong bo rac.
        const cleanupUploadedFiles = () =>
            Promise.all(
                downloaded.map((u) =>
                    getCloudinary()
                        .uploader.destroy(u.public_id, { resource_type: 'raw', invalidate: true })
                        .catch(() => {}),
                ),
            );
        if (downloaded.length !== tep.length) {
            await cleanupUploadedFiles();
            const errorMessage = result.find((k) => k.status === 'rejected');
            throw errorMessage ? errorMessage.reason : new Error('Không tải được file lên kho lưu trữ');
        }

        let doc;
        try {
            doc = await Document.create({
                title,
                description,
                monHoc: subject,
                monHocKey: subjectKey,
                truong: tr.truong,
                truongKey: tr.truongKey,
                files: tep.map((f, i) => ({
                    fileUrl: downloaded[i].secure_url,
                    filePublicId: downloaded[i].public_id,
                    fileName: fixFileName(f.originalname),
                    fileExt: fileExtension(f.originalname),
                    fileSize: f.size,
                })),
                uploader: req.user._id,
            });
        } catch (e) {
            await cleanupUploadedFiles();
            throw e;
        }

        const saved = await Document.findById(doc._id)
            .select(PUBLIC_FIELDS)
            .populate('uploader', 'name avatar');

        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Tang so luot tai
// @route   POST /api/documents/:id/download
const incrementDownload = async (req, res) => {
    try {
        const doc = await Document.findOneAndUpdate(
            { _id: req.params.id, ...VISIBLE },
            { $inc: { downloadCount: 1 } },
            { returnDocument: 'after', select: 'downloadCount monHocKey' },
        );
        if (!doc) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });

        // Duong nay KHONG bat dang nhap (khach van tai duoc). req.user chi co
        // khi optionalUser doc ra token - khach thi khong ghi gi ca.
        if (req.user) {
            await logActivity(req.user._id, 'tai', { document: doc._id, monHocKey: doc.monHocKey });
        }

        res.json({ downloadCount: doc.downloadCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xoa tai lieu (chu bai hoac admin)
// @route   DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
    try {
        // .lean() de doc duoc ca truong le filePublicId cua tai lieu cu - xem filesOf.
        const doc = await Document.findById(req.params.id).lean();
        if (!doc) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });

        const isPostOwner = String(doc.uploader) === String(req.user._id);
        if (!isPostOwner && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn chỉ có thể xóa tài liệu do mình đăng' });
        }

        // Xoa MOI file tren Cloudinary truoc. File nao hong thi van xoa ban ghi,
        // vi de lai ban ghi tro toi file da mat con te hon la thua mot file.
        const publicIds = [...new Set(filesOf(doc).map((f) => f.filePublicId).filter(Boolean))];
        if (publicIds.length && cloudinaryReady()) {
            await Promise.all(
                publicIds.map((id) =>
                    // invalidate: true de xoa luon ban CDN dang nho. Khong co no thi file
                    // da xoa van tai ve duoc hang gio qua duong dan cu - da do duoc: xoa
                    // xong goi lai URL van tra 200. Voi bai vi pham bi go thi do la lo hong that.
                    getCloudinary()
                        .uploader.destroy(id, { resource_type: 'raw', invalidate: true })
                        .catch((err) => console.error('Không xóa được file trên Cloudinary:', err.message)),
                ),
            );
        }

        // Binh luan khong con tai lieu thi khong con cho nao hien - xoa theo.
        await DocumentComment.deleteMany({ document: doc._id });
        // Cung vay voi luot "da luu" cua moi nguoi tro toi tai lieu nay.
        await SavedItem.deleteMany({ loai: 'taiLieu', doiTuong: doc._id });
        await Document.deleteOne({ _id: doc._id });
        res.json({ message: 'Đã xóa tài liệu' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Kieu MIME theo duoi file, de trinh duyet biet mo bang gi.
const MIME_BY_EXTENSION = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

// Ten file cho header Content-Disposition.
//
// Dat theo TIEU DE tai lieu chu khong phai doc.fileName: fileName trong CSDL
// dang hong ma hoa (UTF-8 bi doc thanh Latin-1), vi du "Cáº¥u trÃºc dá»¯ liá»u"
// dang le la "Cấu trúc dữ liệu". Tieu de thi nguoi dang go thang vao form nen
// luon dung.
//
// Tra ve hai dang theo RFC 5987: mot ban ASCII cho trinh duyet cu, mot ban
// UTF-8 cho trinh duyet nay. Trinh duyet nao hieu filename* thi uu tien no.
//
// Bai NHIEU file thi tieu de khong phan biet duoc file nao - luc do dung ten
// file goc ("Chương 1.pdf"), da qua fixFileName de sua loi ma hoa noi tren.
const downloadName = (doc, file, i, fileCount) => {
    const extension = file.fileExt || 'pdf';
    const fileName = fixFileName(file.fileName).trim();
    let origin = `${doc.title || 'tai-lieu'}.${extension}`;
    if (fileCount > 1) {
        origin = fileName || `${doc.title || 'tai-lieu'} (${i + 1}).${extension}`;
        if (!origin.toLowerCase().endsWith(`.${extension}`)) origin += `.${extension}`;
    }
    const ascii = origin.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_');
    return `filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(origin)}`;
};

// @desc    Truyen file that ve cho trinh duyet
// @route   GET /api/documents/:id/file          (mo file dau de doc)
// @route   GET /api/documents/:id/file?i=2      (file thu 3 - dem tu 0)
// @route   GET /api/documents/:id/file?tai=1    (tai ve may)
//
// VI SAO PHAI CO ROUTE NAY, khong dung thang fileUrl trong CSDL:
// fileUrl la duong delivery cong khai dang res.cloudinary.com/.../raw/upload/...
// Tai khoan Cloudinary nay CHAN phat PDF o tang delivery, nen duong do tra ve
// 401 "deny or ACL failure" - nut tai file tren giao dien vi vay bam vao chi ra
// trang loi, du bo dem luot tai van tang.
//
// Da THU ba cach truoc khi chon cach nay:
//   - secure_url lay tu Admin API              -> 401
//   - cloudinary.url(..., { sign_url: true })  -> 401 (ky URL khong vuot duoc
//     chan o tang delivery, no chi vuot duoc strict transformations)
//   - private_download_url(..., attachment:true) -> 404
// Chi private_download_url voi type:'upload' di qua api.cloudinary.com - tuc la
// TANG API chu khong phai tang delivery - moi tra ve 206 application/pdf.
//
// VI SAO TU TRUYEN chu khong 302 sang URL ky (ban truoc lam vay, da bo):
// URL ky chi song 10 phut. Chuyen huong sang no thi trinh duyet GHI NHO chinh
// URL Cloudinary do, khong phai URL nay. Nut tai ⬇ nam trong trinh doc PDF cua
// trinh duyet bam vao dung duong da ghi nho ay - qua 10 phut la Cloudinary tra
// JSON loi, Chrome luu thanh "download.json" va bao "File wasn't available on
// site". Dung loi nguoi dung gap phai.
// Tu truyen thi trinh duyet chi thay duong nay, khong bao gio het han, va dat
// duoc ten file tu te. Doi lai la bang thong di qua may chu.
//
// Chuyen tiep header Range de trinh doc PDF nhay toi trang giua file ma khong
// phai tai het 5MB truoc - thieu no thi mo tai lieu day trang rat cham.
const getDocumentFile = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id)
            .select('files filePublicId fileUrl fileName fileExt fileSize title daAn')
            .lean();
        if (!doc) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
        // An thi FILE cung phai an - khong thi ai giu duong dan cu van tai ve
        // duoc. Rieng admin van mo duoc de xem xet (route gan optionalUser).
        if (doc.daAn && !(req.user && req.user.role === 'admin')) {
            return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
        }
        const dsFile = filesOf(doc);
        // ?i= la VI TRI file, dem tu 0. Chi nhan so nguyen trong khoang - chuoi
        // la hay so am deu la 404, khong doan.
        const i = req.query.i === undefined ? 0 : Number(req.query.i);
        const file = Number.isInteger(i) && i >= 0 ? dsFile[i] : undefined;
        if (!file || (!file.filePublicId && !file.fileUrl)) {
            return res.status(404).json({ message: 'Tài liệu không có file này' });
        }

        let source = file.fileUrl;
        if (file.filePublicId) {
            if (!cloudinaryReady()) {
                return res.status(500).json({ message: 'Máy chủ chưa cấu hình Cloudinary' });
            }
            source = getCloudinary().utils.private_download_url(file.filePublicId, null, {
                resource_type: 'raw',
                type: 'upload',
                expires_at: Math.floor(Date.now() / 1000) + 600,
            });
        }

        const top = await fetch(source, {
            headers: req.headers.range ? { Range: req.headers.range } : {},
        });

        if (!top.ok && top.status !== 206) {
            return res.status(502).json({ message: 'Không lấy được file từ kho lưu trữ' });
        }

        // NGOAI LE cho rieng duong nay, go bot hai header ma index.js dat cho
        // MOI phan hoi API: X-Frame-Options: DENY va frame-ancestors 'none'.
        //
        // Ghi chu o index.js viet "API khong bao gio can nam trong iframe" -
        // dung voi moi duong khac, nhung KHONG dung voi duong nay: trang chi
        // tiet tai lieu nhung chinh no vao mot <iframe> de nguoi dung doc tai
        // cho. De nguyen thi trinh duyet chan, khung doc trong tron va console
        // bao "Framing ... violates frame-ancestors 'none'".
        //
        // Loi nay TRUOC DAY khong lo ra vi ban cu 302 sang Cloudinary, phan hoi
        // cuoi den tu ho nen khong mang header cua may chu nay. Tu luc may chu
        // tu truyen file thi header di theo.
        //
        // Noi long toi 'self' chu khong phai '*': chi trang cung mien moi nhung
        // duoc, ben thu ba van khong the nhung tai lieu cua nguoi dung vao
        // trang ho. FRONTEND_URL them vao cho truong hop goi thang vao mien cua
        // backend thay vi di qua duong chuyen tiep cua Next.
        const embedSource = ["'self'", process.env.FRONTEND_URL].filter(Boolean).join(' ');
        res.removeHeader('X-Frame-Options');
        res.set('Content-Security-Policy', `default-src 'none'; frame-ancestors ${embedSource}`);

        res.status(top.status);
        res.set('Content-Type', MIME_BY_EXTENSION[file.fileExt] || 'application/octet-stream');
        res.set('Content-Disposition',
            `${req.query.tai ? 'attachment' : 'inline'}; ${downloadName(doc, file, i, dsFile.length)}`);
        res.set('Accept-Ranges', 'bytes');
        for (const h of ['content-length', 'content-range']) {
            const v = top.headers.get(h);
            if (v) res.set(h, v);
        }
        // Rieng tu: file co the bi go xuong, khong de CDN chung giu ban sao.
        res.set('Cache-Control', 'private, max-age=600');

        Readable.fromWeb(top.body).pipe(res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Tai mot anh len de chen vao noi dung bai (anh chup man hinh cac buoc)
// @route   POST /api/documents/anh   (multipart, truong "anh")
//
// Tra ve URL tren Cloudinary cua du an - filterContent chi giu anh co tien to nay.
const uploadContentImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn một ảnh' });
        if (!cloudinaryReady()) {
            return res.status(503).json({ message: 'Máy chủ chưa cấu hình nơi lưu trữ ảnh' });
        }
        const outcome = await uploadToCloudinary(req.file.buffer, 'image', {
            folder: 'learning-portal/documents/anh',
        });
        res.status(201).json({ url: outcome.secure_url, rong: outcome.width, cao: outcome.height });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===========================================================================
// Lich su va goi y
// ===========================================================================

// Tai lai trang hay bam tai hai lan trong khoang nay chi tinh MOT lan. Khong
// chong trung thi mot nguoi F5 muoi lan la muoi lan "xem", va mon do bi thoi
// phong trong so thich cua ho.
const DEDUPE_WINDOW_MS = 30 * 60 * 1000;

/**
 * Ghi mot hanh dong vao lich su.
 *
 * Chong trung bang chi muc unique tren khoaChongTrung, KHONG bang "kiem roi
 * ghi" - xem ghi chu o chi muc trong models/DocumentActivity.js ve vi sao cach
 * kiem roi ghi da hong tren du lieu that.
 *
 * Khung la khung CO DINH 30 phut (10:00-10:30, 10:30-11:00...), khong phai 30
 * phut truot tu lan truoc. Xem luc 10:29 va 10:31 se ghi hai lan - chap nhan
 * duoc, doi lai CSDL tu dam bao duoc ma khong can khoa hay giao dich nao.
 *
 * KHONG BAO GIO nem loi ra ngoai: lich su chi phuc vu goi y, la viec phu. Ghi
 * hong ma lam hong luot tai file cua nguoi dung thi la dat cai phu len tren
 * cai chinh.
 */
const logActivity = async (userId, loai, { document = null, monHocKey: subjectKey = [], tuKhoa: keyword = '' } = {}) => {
    // Tim thi chong trung theo tu khoa DA CHUAN HOA: "Đồ thị" va "do thi" la
    // cung mot lan tim, khong phai hai.
    const target = loai === 'tim' ? normalizeSubject(keyword) : String(document);
    const khung = Math.floor(Date.now() / DEDUPE_WINDOW_MS);
    try {
        await DocumentActivity.create({
            user: userId,
            loai,
            document,
            monHocKey: subjectKey,
            tuKhoa: keyword,
            khoaChongTrung: `${userId}:${loai}:${target}:${khung}`,
        });
        return true;
    } catch (err) {
        // E11000 = da ghi trong khung nay roi. Dung la dieu mong muon, khong
        // phai loi - khong in ra cho khoi lam rac log.
        if (err && err.code === 11000) return false;
        console.error('Không ghi được lịch sử tài liệu:', err.message);
        return false;
    }
};

// @desc    Ghi mot luot xem trang chi tiet
// @route   POST /api/documents/:id/xem
//
// Duong RIENG, khong ghi trong getDocumentById: trang chi tiet duoc Next dung
// san o may chu va luu lai 30 giay (revalidate), nen luot goi GET do khong
// tuong ung voi mot nguoi that dang xem, va cung khong mang cookie cua ho.
// Trinh duyet goi duong nay sau khi trang mo ra thi moi dung nguoi, dung luc.
const logView = async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, ...VISIBLE }).select('monHocKey').lean();
        if (!doc) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });

        // Da dang nhap: chi dem khi lich su ghi MOI (F5 trong 30 phut khong
        // dem them). Khach: khong co gi de chong trung - dem moi lan, gioi han
        // tan suat o route (viewLimit) chan viec bom so.
        const compute = req.user
            ? await logActivity(req.user._id, 'xem', { document: doc._id, monHocKey: doc.monHocKey })
            : true;
        if (compute) await Document.updateOne({ _id: doc._id }, { $inc: { luotXem: 1 } });
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Ghi mot lan tim kiem
// @route   POST /api/documents/tim-kiem   { q }
//
// Tach khoi GET /api/documents vi duong do co setCache - xem ghi chu o
// getDocuments.
const logSearch = async (req, res) => {
    try {
        if (!req.user) return res.status(204).end();

        const q = String((req.body && req.body.q) || '').replace(/\s+/g, ' ').trim().slice(0, 100);

        // Chuoi toan tu qua chung ("tai lieu mon hoc") khong day duoc gi ve
        // so thich - luu vao chi ton cho.
        if (!splitKeywords(q).length) return res.status(204).end();

        await logActivity(req.user._id, 'tim', { tuKhoa: q });
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Danh sach mon hoc (do admin quan ly), kem so tai lieu DANG HIEN moi mon
// @route   GET /api/documents/mon-hoc
//
// Tra ca mon chua co tai lieu nao (soTaiLieu = 0): form dang bai can chon duoc
// ca mon moi tao. Hang the loc o trang danh sach tu an cac mon 0 tai lieu.
const getSubjects = async (req, res) => {
    try {
        const [subjectList, tally] = await Promise.all([
            DocumentSubject.find().select('ten key nhom').sort({ ten: 1 }).lean(),
            Document.aggregate([
                { $match: VISIBLE },
                // Mot tai lieu nhieu mon duoc dem cho MOI mon cua no.
                { $unwind: '$monHocKey' },
                { $match: { monHocKey: { $gt: '' } } },
                { $group: { _id: '$monHocKey', so: { $sum: 1 } } },
            ]),
        ]);
        const countByKey = new Map(tally.map((d) => [d._id, d.so]));
        res.json(
            subjectList.map((m) => ({
                _id: m._id,
                key: m.key,
                ten: m.ten,
                nhom: m.nhom ? String(m.nhom) : null,
                soTaiLieu: countByKey.get(m.key) || 0,
            })),
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Truong tra ve cho goi y. KHONG co description: moi mo ta toi 5000 ky tu
// HTML, sau goi y la gan 30KB thua ma the goi y khong hien mo ta nao.
const SUGGESTION_FIELDS =
    'title monHoc monHocKey files.fileExt files.fileSize uploader downloadCount createdAt';

// So ung vien dem ra cham diem. Cham trong bo nho - voi kho vai tram tai lieu
// thi nhanh hon ca mot truy van phuc tap. Kho lon han nhieu thi phai doi sang
// loc bang chi muc truoc roi moi cham.
const NEW_CANDIDATES = 200;
const SUBJECT_CANDIDATES = 100;

// @desc    Goi y tai lieu
// @route   GET /api/documents/goi-y?id=<tai lieu dang xem>&limit=6
//
// Hai che do:
//   co ?id   - trang chi tiet: "tai lieu lien quan" toi tai lieu dang xem, dua
//              tren cung mon va tu trong tieu de. Da dang nhap thi them mon
//              tu lich su.
//   khong id - trang danh sach: "goi y cho ban" tu lich su xem/tai/tim.
//
// Da dang nhap hay chua deu tra loi duoc - khach thi chi co tin hieu tu tai
// lieu dang xem va do pho bien.
const getRecommendations = async (req, res) => {
    try {
        const count = Math.max(1, Math.min(parseInt(req.query.limit, 10) || 6, 24));

        // guardObjectIds chi kiem tham so DUONG DAN (:id), khong kiem query. Tu
        // kiem o day, khong thi ?id=abc lam Mongoose nem CastError -> 500.
        const viewingId = String(req.query.id || '');
        const viewing = mongoose.Types.ObjectId.isValid(viewingId)
            ? await Document.findOne({ _id: viewingId, ...VISIBLE }).select('title monHoc monHocKey').lean()
            : null;
        // Mang khoa mon - mot tai lieu co nhieu mon.
        const viewingSubject = viewing ? subjectsOf(viewing).map((m) => m.key) : [];

        let history = { interestSubjects: new Map(), daTai: new Set(), tuKhoa: [] };
        if (req.user) {
            const activity = await DocumentActivity.find({ user: req.user._id })
                .sort({ createdAt: -1 })
                .limit(200)
                .select('loai document monHocKey tuKhoa')
                .lean();
            history = summarizeHistory(activity);
        }

        // Ung vien = tai lieu moi nhat + tai lieu thuoc cac mon lien quan.
        // Chi lay moi nhat thi tai lieu cung mon nhung dang tu lau se khong bao
        // gio duoc cham diem, du no chinh la thu hop nhat.
        const relatedSubjects = [...new Set([...viewingSubject, ...history.interestSubjects.keys()].filter(Boolean))];
        const [latest, bySubject] = await Promise.all([
            Document.find(VISIBLE)
                .select(SUGGESTION_FIELDS)
                .populate('uploader', 'name avatar')
                .sort({ createdAt: -1 })
                .limit(NEW_CANDIDATES)
                .lean(),
            relatedSubjects.length
                ? Document.find({ ...VISIBLE, monHocKey: { $in: relatedSubjects } })
                      .select(SUGGESTION_FIELDS)
                      .populate('uploader', 'name avatar')
                      .sort({ createdAt: -1 })
                      .limit(SUBJECT_CANDIDATES)
                      .lean()
                : [],
        ]);
        const candidates = [...new Map([...latest, ...bySubject].map((d) => [String(d._id), d])).values()];

        const exclude = new Set(history.daTai);
        if (viewing) exclude.add(String(viewing._id));

        const result = rankDocuments(
            candidates,
            {
                viewingSubject,
                interestSubjects: history.interestSubjects,
                // Trang chi tiet: tu khoa lay tu TIEU DE tai lieu dang xem.
                // Trang danh sach: lay tu lich su tim. Hai nguon cho hai cau
                // giai thich khac nhau - xem scoreDocument.
                tuKhoa: viewing ? splitKeywords(viewing.title) : history.tuKhoa,
                keywordSource: viewing ? 'tieuDe' : 'tim',
                exclude,
            },
            count,
        ).map(({ monHocKey: subjectKey, ...d }) => d); // monHocKey la khoa noi bo, khong tra ra

        res.json({
            documents: result,
            // Cho giao dien biet co nen goi day la "goi y cho BAN" hay khong.
            // Chua co lich su gi thi ket qua chi la moi nhat/pho bien - goi la
            // "danh cho ban" la noi qua su that.
            caNhanHoa: Boolean(req.user) && (history.interestSubjects.size > 0 || history.tuKhoa.length > 0),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lich su xem/tai cua CHINH nguoi dang dang nhap
// @route   GET /api/documents/lich-su
const getMyHistory = async (req, res) => {
    try {
        const activity = await DocumentActivity.find({
            user: req.user._id,
            loai: { $in: ['xem', 'tai'] },
        })
            .sort({ createdAt: -1 })
            .limit(300)
            .select('loai document createdAt')
            .lean();

        // Hien toi da 50 tai lieu gan nhat - lich su dai hon khong ai cuon het.
        const rows = groupHistoryByDocument(activity).slice(0, 50);

        const documentRecord = await Document.find({ ...VISIBLE, _id: { $in: rows.map((d) => d.document) } })
            .select(SUGGESTION_FIELDS)
            .populate('uploader', 'name avatar')
            .lean();
        const theoId = new Map(documentRecord.map((d) => [String(d._id), d]));

        const items = rows
            .map((d) => {
                const t = theoId.get(d.document);
                // Tai lieu da bi go xuong: bo han khoi danh sach. Hien mot dong
                // "tai lieu khong con" thi bam vao cung chi ra trang 404.
                if (!t) return null;
                const { monHocKey: subjectKey, ...remaining } = t;
                return { ...remaining, lanCuoi: d.lanCuoi, daTai: d.daTai };
            })
            .filter(Boolean);

        res.json({ items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xoa toan bo lich su cua CHINH nguoi dang dang nhap
// @route   DELETE /api/documents/lich-su
//
// Da cho nguoi dung xem du lieu hanh vi cua ho thi cung phai cho ho xoa. Xoa
// ca lich su tim, vi goi y cung dua tren no - xoa xem/tai ma giu tim thi goi y
// van "nho" nguoi do quan tam gi.
const clearMyHistory = async (req, res) => {
    try {
        const outcome = await DocumentActivity.deleteMany({ user: req.user._id });
        res.json({ daXoa: outcome.deletedCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Sua tai lieu (chu bai hoac admin)
// @route   PATCH /api/documents/:id   { title?, description?, monHoc? }
//
// Chi sua PHAN CHU - tieu de, noi dung, mon. KHONG doi file o day (theo chot
// voi chu du an): doi file thi phai xoa file cu tren Cloudinary, va tai file
// moi hong giua chung la mot duong loi rieng. Muon doi file thi xoa bai dang lai.
//
// Truong nao khong gui thi giu nguyen - admin gan mon cho tai lieu cu chi can
// gui { monHoc }.
//
// Moi truong gui len di qua DUNG bo luat cua createDocument: loc HTML, gioi han
// do dai, bo loc tu ngu. Sua la mot cua ghi thu hai - thieu mot buoc o day la
// lo hong da va o duong dang bai mo lai qua duong sua.
const updateDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id).select('uploader');
        if (!doc) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });

        // Cung luat voi deleteDocument.
        const isPostOwner = String(doc.uploader) === String(req.user._id);
        if (!isPostOwner && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn chỉ có thể sửa tài liệu do mình đăng' });
        }

        const body = req.body || {};
        const update = {};

        if (body.title !== undefined) {
            const title = String(body.title).trim();
            if (!title) return res.status(400).json({ message: 'Tiêu đề không được để trống', field: 'title' });
            if (title.length > 200) {
                return res.status(400).json({ message: 'Tiêu đề tối đa 200 ký tự', field: 'title' });
            }
            update.title = title;
        }

        if (body.description !== undefined) {
            // PHAI qua normalizeContent - xem ghi chu XSS o createDocument.
            const description = filterContent(body.description);
            if (!description) {
                return res.status(400).json({ message: 'Nội dung không được để trống', field: 'description' });
            }
            if (description.length > CONTENT_LIMIT) {
                return res.status(400).json({ message: `Nội dung tối đa ${CONTENT_LIMIT} ký tự`, field: 'description' });
            }
            if (countImages(description) > MAX_IMAGES) {
                return res.status(400).json({ message: `Tối đa ${MAX_IMAGES} ảnh trong một bài`, field: 'description' });
            }
            update.description = description;
        }

        if (body.monHoc !== undefined) {
            const subjectItem = await validateSubjects(body.monHoc);
            if (!subjectItem.ok) return res.status(400).json(subjectItem.body);
            // Gan CA HAI truong cung luc - xem ghi chu o monHocKey trong model.
            update.monHoc = subjectItem.monHoc;
            update.monHocKey = subjectItem.monHocKey;
        }

        // Truong: gui chuoi rong = bo truong.
        if (body.truong !== undefined) {
            const tr = await validateSchool(body.truong);
            if (!tr.ok) return res.status(400).json(tr.body);
            update.truong = tr.truong;
            update.truongKey = tr.truongKey;
        }

        if (!Object.keys(update).length) {
            return res.status(400).json({ message: 'Không có gì để cập nhật' });
        }

        if (update.title !== undefined || update.description !== undefined) {
            const moderate = checkDocument({
                title: update.title || '',
                description: update.description ? stripTags(update.description) : '',
            });
            if (!moderate.ok) {
                return res.status(400).json({
                    message: moderate.message,
                    field: moderate.field,
                    category: moderate.category,
                });
            }
        }

        await Document.updateOne({ _id: doc._id }, update);
        const recent = await Document.findById(doc._id)
            .select(`${PUBLIC_FIELDS} daAn`)
            .populate('uploader', 'name avatar');
        res.json(recent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Tai lieu do CHINH nguoi dang dang nhap dang - cho trang ca nhan
// @route   GET /api/documents/cua-toi?page=&limit=
//
// GOM CA tai lieu da bi admin an: chu bai can thay bai cua minh dang bi an de
// biet vi sao nguoi khac khong tim thay. Tra kem description vi trang ca nhan
// la noi sua bai - form sua can noi dung day du.
//
// Loc theo req.user._id tu cookie, khong nhan id nguoi dung tu query - nhan
// thi ai cung doc duoc bai an cua nguoi khac.
const getMyDocuments = async (req, res) => {
    try {
        const { trang: page, soDong: limit, skip: skip } = paginate(req.query, {
            defaults: 10,
            toiDa: 50,
        });
        const filter = { uploader: req.user._id };

        const [documents, total] = await Promise.all([
            Document.find(filter)
                .select(`${PUBLIC_FIELDS} daAn`)
                .populate('uploader', 'name avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Document.countDocuments(filter),
        ]);

        res.json({ documents, total, page, totalPages: Math.ceil(total / limit) || 1 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===========================================================================
// Quan tri tai lieu
// ===========================================================================

// @desc    Danh sach tai lieu cho quan tri - GOM CA tai lieu da an
// @route   GET /api/documents/quan-tri?page=&limit=&q=
//
// Duong RIENG, khong them ?tatCa=1 vao GET /api/documents: duong do gan
// setCache, CDN luu phan hoi 60 giay THEO URL. Neu no tra tai lieu an khi nguoi
// goi la admin, ban luu cua admin nam tren CDN va AI goi dung URL do cung nhan
// duoc - tai lieu da an lo ra ngoai.
const getDocumentsAdmin = async (req, res) => {
    try {
        const { trang: page, soDong: limit, skip: skip } = paginate(req.query, {
            defaults: 20,
            toiDa: 50,
        });
        const q = (req.query.q || '').trim();
        const filter = q ? { $text: { $search: q } } : {};

        const [documents, total] = await Promise.all([
            Document.find(filter)
                .select(`${PUBLIC_FIELDS} daAn`)
                .populate('uploader', 'name avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Document.countDocuments(filter),
        ]);

        res.json({ documents, total, page, totalPages: Math.ceil(total / limit) || 1 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    An / hien mot tai lieu (admin)
// @route   PATCH /api/documents/:id/an   { daAn: true | false }
const hideDocument = async (req, res) => {
    try {
        const hidden = req.body && req.body.daAn;
        // Chi nhan dung true/false. Chuoi "false" la truthy - nhan bua la bam
        // "hien lai" ma tai lieu van an.
        if (typeof hidden !== 'boolean') {
            return res.status(400).json({ message: 'daAn phải là true hoặc false' });
        }
        const doc = await Document.findByIdAndUpdate(
            req.params.id,
            { daAn: hidden },
            { returnDocument: 'after', select: 'daAn' },
        );
        if (!doc) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
        res.json({ daAn: doc.daAn });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===========================================================================
// Danh sach mon hoc (admin quan ly)
// ===========================================================================

/** Kiem ten mon admin nhap. Tra ve { ok, ten, key } hoac { ok: false, message }. */
const validateSubjectName = (tho) => {
    const entryName = String(tho || '').replace(/\s+/g, ' ').trim();
    const key = normalizeSubject(entryName);
    if (!key) return { ok: false, message: 'Vui lòng nhập tên môn học' };
    if (entryName.length > 80) return { ok: false, message: 'Tên môn học tối đa 80 ký tự' };
    return { ok: true, ten: entryName, key };
};

// @desc    Them mon (admin)
// @route   POST /api/documents/mon-hoc   { ten }
const createSubject = async (req, res) => {
    try {
        const k = validateSubjectName(req.body && req.body.ten);
        if (!k.ok) return res.status(400).json({ message: k.message });

        // "Toán" va "toan" la mot mon - so bang khoa, khong bang ten.
        if (await DocumentSubject.exists({ key: k.key })) {
            return res.status(409).json({ message: 'Môn này đã có trong danh sách' });
        }
        const subjectItem = await DocumentSubject.create({ ten: k.ten, key: k.key });
        res.status(201).json({ _id: subjectItem._id, key: subjectItem.key, ten: subjectItem.ten, soTaiLieu: 0 });
    } catch (error) {
        // Hai admin them cung mon mot luc: chi muc unique chan ben thu hai.
        if (error && error.code === 11000) {
            return res.status(409).json({ message: 'Môn này đã có trong danh sách' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Doi ten mon (admin)
// @route   PUT /api/documents/mon-hoc/:id   { ten }
//
// Tai lieu CHEP ten mon vao chinh no (xem models/DocumentSubject.js), nen doi
// ten o day phai cap nhat lai moi tai lieu dang dung mon nay - khong thi the
// mon tren tai lieu cu van ghi ten cu. Lich su cung doi khoa theo, de goi y
// van "nho" nguoi dung quan tam mon nay sau khi doi ten.
const updateSubject = async (req, res) => {
    try {
        const subjectItem = await DocumentSubject.findById(req.params.id);
        if (!subjectItem) return res.status(404).json({ message: 'Không tìm thấy môn học' });

        const body = req.body || {};

        // Doi LINH VUC (co the kem hoac khong kem doi ten). null = bo khoi nhom.
        if ('nhom' in body) {
            if (body.nhom === null || body.nhom === '') {
                subjectItem.nhom = null;
            } else if (typeof body.nhom === 'string' && mongoose.Types.ObjectId.isValid(body.nhom)) {
                if (!(await DocumentCategory.exists({ _id: body.nhom }))) {
                    return res.status(400).json({ message: 'Lĩnh vực không tồn tại' });
                }
                subjectItem.nhom = body.nhom;
            } else {
                return res.status(400).json({ message: 'Lĩnh vực không hợp lệ' });
            }
            // Chi doi linh vuc: luu roi tra luon, khong di qua duong doi ten.
            if (body.ten === undefined) {
                await subjectItem.save();
                return res.json({ _id: subjectItem._id, key: subjectItem.key, ten: subjectItem.ten, nhom: subjectItem.nhom ? String(subjectItem.nhom) : null, soTaiLieuDaCapNhat: 0 });
            }
        }

        const k = validateSubjectName(body.ten);
        if (!k.ok) return res.status(400).json({ message: k.message });

        const oldKey = subjectItem.key;
        if (k.key !== oldKey && (await DocumentSubject.exists({ key: k.key }))) {
            return res.status(409).json({ message: 'Đã có môn khác trùng tên này' });
        }

        subjectItem.ten = k.ten;
        subjectItem.key = k.key;
        await subjectItem.save();

        // Danh muc mon cua cac truong luu KHOA - doi theo.
        if (k.key !== oldKey) {
            await DocumentUniversity.updateMany({ monHoc: oldKey }, { $set: { 'monHoc.$': k.key } });
        }

        // Tai lieu nhieu mon: chi thay DUNG phan tu cua mon nay, giu nguyen
        // cac mon khac va thu tu. Cap nhat bang pipeline de ca hai mang doi
        // trong mot lan ghi - monHoc[i] va monHocKey[i] khong lech nhau duoc.
        const replaceKey = {
            $map: {
                input: '$monHocKey',
                as: 'x',
                in: { $cond: [{ $eq: ['$$x', oldKey] }, { $literal: k.key }, '$$x'] },
            },
        };
        const { modifiedCount } = await Document.updateMany({ monHocKey: oldKey }, [
            {
                $set: {
                    monHoc: {
                        $map: {
                            input: { $range: [0, { $size: '$monHocKey' }] },
                            as: 'i',
                            in: {
                                $cond: [
                                    { $eq: [{ $arrayElemAt: ['$monHocKey', '$$i'] }, oldKey] },
                                    { $literal: k.ten },
                                    { $arrayElemAt: ['$monHoc', '$$i'] },
                                ],
                            },
                        },
                    },
                    monHocKey: replaceKey,
                },
            },
            // Mongoose 9 chan cap nhat dang mang (pipeline) neu khong bat co nay.
        ], { updatePipeline: true });
        if (k.key !== oldKey) {
            await DocumentActivity.updateMany(
                { monHocKey: oldKey },
                [{ $set: { monHocKey: replaceKey } }],
                { updatePipeline: true },
            );
        }

        res.json({
            _id: subjectItem._id,
            key: subjectItem.key,
            ten: subjectItem.ten,
            nhom: subjectItem.nhom ? String(subjectItem.nhom) : null,
            soTaiLieuDaCapNhat: modifiedCount,
        });
    } catch (error) {
        if (error && error.code === 11000) {
            return res.status(409).json({ message: 'Đã có môn khác trùng tên này' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xoa mon (admin) - chi khi CHUA co tai lieu nao dung
// @route   DELETE /api/documents/mon-hoc/:id
//
// Chan thay vi xoa kem: xoa mon dang co tai lieu thi cac tai lieu do mang mot
// mon khong con trong danh sach - sua bai la bi bao "mon khong co", va the loc
// khong con nut de loc ra chung.
const deleteSubject = async (req, res) => {
    try {
        const subjectItem = await DocumentSubject.findById(req.params.id);
        if (!subjectItem) return res.status(404).json({ message: 'Không tìm thấy môn học' });

        const inUse = await Document.countDocuments({ monHocKey: subjectItem.key });
        if (inUse > 0) {
            return res.status(409).json({
                message: `Môn này đang có ${inUse} tài liệu. Chuyển các tài liệu đó sang môn khác trước khi xóa.`,
            });
        }
        await subjectItem.deleteOne();
        await DocumentUniversity.updateMany({ monHoc: subjectItem.key }, { $pull: { monHoc: subjectItem.key } });
        res.json({ message: 'Đã xóa môn học' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===========================================================================
// Binh luan
// ===========================================================================

const COMMENTER_FIELDS = 'name avatar role';

// @desc    Binh luan cua mot tai lieu, dang cay mot cap
// @route   GET /api/documents/:id/binh-luan
//
// Doc nguoi dung neu co (optionalUser): admin thay ca binh luan da an de
// bo an duoc. Vi ket qua doi theo nguoi goi nen route gan noStore.
const getComments = async (req, res) => {
    try {
        const doc = await Document.findOne({ _id: req.params.id, ...VISIBLE }).select('uploader').lean();
        if (!doc) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });

        const laAdmin = Boolean(req.user && req.user.role === 'admin');
        const docRows = await DocumentComment.find({ document: doc._id })
            .sort({ createdAt: 1 })
            .populate('user', COMMENTER_FIELDS)
            .lean();

        const cay = buildCommentTree(docRows, { laAdmin });
        const totalCount = cay.reduce((n, g) => n + 1 + g.cacTraLoi.length, 0);

        // Tra kem id chu bai de giao dien gan nhan "Tác giả" cho binh luan cua
        // nguoi da dang tai lieu.
        res.json({ binhLuan: cay, tong: totalCount, chuBai: String(doc.uploader) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Viet binh luan / tra loi
// @route   POST /api/documents/:id/binh-luan   { noiDung, traLoi? }
const createComment = async (req, res) => {
    try {
        // Kiem do dai TRUOC khi di CSDL - cung nep voi hoi dap bai hoc.
        const check = validateComment(req.body && req.body.noiDung);
        if (!check.ok) return res.status(400).json({ message: check.message });

        // Cung bo loc tu ngu voi tai lieu: trang nay cong khai va quy dinh dang
        // bai ghi ro se tu choi noi dung chui the, ky thi, kich dong.
        const query = checkText(check.noiDung);
        if (!query.ok) {
            return res.status(400).json({
                message: `Bình luận vi phạm quy định (${query.label}). Vui lòng sửa lại.`,
                category: query.category,
            });
        }

        const doc = await Document.findOne({ _id: req.params.id, ...VISIBLE }).select('_id').lean();
        if (!doc) return res.status(404).json({ message: 'Không tìm thấy tài liệu' });

        let reply = null;
        const targetId = req.body && req.body.traLoi;
        if (targetId) {
            // guardObjectIds chi kiem tham so DUONG DAN, khong kiem body.
            if (!mongoose.Types.ObjectId.isValid(targetId)) {
                return res.status(400).json({ message: 'Bình luận cần trả lời không hợp lệ' });
            }
            // Phai la binh luan CUA CHINH tai lieu nay - khong thi gui id cua
            // tai lieu khac vao la tra loi "xuyen" sang trang khac.
            const destination = await DocumentComment.findOne({
                _id: targetId,
                document: doc._id,
                daAn: { $ne: true },
            })
                .select('_id traLoi')
                .lean();
            if (!destination) return res.status(404).json({ message: 'Bình luận bạn trả lời không còn nữa' });
            reply = rootCommentId(destination);
        }

        const recent = await DocumentComment.create({
            document: doc._id,
            user: req.user._id,
            noiDung: check.noiDung,
            traLoi: reply,
        });
        const day = await DocumentComment.findById(recent._id).populate('user', COMMENTER_FIELDS).lean();

        res.status(201).json({ binhLuan: { ...day, cacTraLoi: [] } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xoa binh luan (nguoi viet hoac admin)
// @route   DELETE /api/documents/binh-luan/:id
//
// Xoa binh luan goc thi xoa luon cac tra loi: tra loi mo coi khong con hien o
// dau duoc (xem buildCommentTree), de lai chi ton cho.
const deleteComment = async (req, res) => {
    try {
        const bl = await DocumentComment.findById(req.params.id).select('user');
        if (!bl) return res.status(404).json({ message: 'Không tìm thấy bình luận' });

        const isAuthor = String(bl.user) === String(req.user._id);
        if (!isAuthor && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn chỉ có thể xóa bình luận của mình' });
        }

        const outcome = await DocumentComment.deleteMany({ $or: [{ _id: bl._id }, { traLoi: bl._id }] });
        res.json({ message: 'Đã xóa bình luận', daXoa: outcome.deletedCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    An / hien binh luan (admin)
// @route   PATCH /api/documents/binh-luan/:id/an   { daAn: true | false }
const hideComment = async (req, res) => {
    try {
        const hidden = req.body && req.body.daAn;
        if (typeof hidden !== 'boolean') {
            return res.status(400).json({ message: 'daAn phải là true hoặc false' });
        }
        const bl = await DocumentComment.findByIdAndUpdate(
            req.params.id,
            { daAn: hidden },
            { returnDocument: 'after', select: 'daAn' },
        );
        if (!bl) return res.status(404).json({ message: 'Không tìm thấy bình luận' });
        res.json({ daAn: bl.daAn });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadContentImage,
    getDocuments,
    getDocumentById,
    createDocument,
    incrementDownload,
    getDocumentFile,
    deleteDocument,
    logView,
    logSearch,
    getSubjects,
    getRecommendations,
    updateDocument,
    getMyDocuments,
    getMyHistory,
    clearMyHistory,
    getDocumentsAdmin,
    hideDocument,
    createSubject,
    updateSubject,
    deleteSubject,
    getComments,
    createComment,
    deleteComment,
    hideComment,
};
