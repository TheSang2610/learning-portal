/**
 * Du lieu MAU cho bieu do "Hoat dong" o /admin/dashboard: nguoi dung moi,
 * luot ghi danh va luot dang nhap rai deu 90 ngay qua.
 *
 *   node scripts/seed-dashboard-demo.js          # xem truoc, KHONG ghi
 *   node scripts/seed-dashboard-demo.js --ghi    # ghi that
 *   node scripts/seed-dashboard-demo.js --xoa    # go SACH moi thu script nay da tao
 *
 * Moi ban ghi tao ra deu mang `seeded: true` (ghi thang qua driver nen truong
 * nay khong can co trong schema). `--xoa` chi xoa dung nhung ban ghi do va tru
 * lai `studentsCount` cua tung khoa da cong - du lieu that khong bi dung toi.
 *
 * Tai khoan mau dung email @example.com (ten mien danh rieng cho vi du, khong
 * ai nhan thu) va mat khau ngau nhien khong ai biet: khong dang nhap duoc.
 *
 * Chay lai `--ghi` khi da co du lieu mau thi dung lai: `--xoa` truoc.
 */
require('dotenv').config({ quiet: true });
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Enrollment = require('../src/models/Enrollment');
const LoginActivity = require('../src/models/LoginActivity');
const { vnDateKey } = require('../src/utils/dailySeries');

const WRITE = process.argv.includes('--ghi');
const REMOVE = process.argv.includes('--xoa');

const DAYS = 90;
const DEMO_USERS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;

// Ngau nhien CO HAT GIONG: chay xem truoc va chay ghi ra cung mot bo so.
let seed = 20261021;
const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (list) => list[Math.floor(rand() * list.length)];
const between = (a, b) => a + Math.floor(rand() * (b - a + 1));

const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Ngô', 'Dương', 'Lý'];
const DEM = ['Văn', 'Thị', 'Minh', 'Ngọc', 'Thanh', 'Quốc', 'Gia', 'Hoài', 'Đức', 'Thu', 'Hải', 'Bảo', 'Khánh', 'Anh'];
const TEN = ['An', 'Bình', 'Châu', 'Dũng', 'Giang', 'Hà', 'Hiếu', 'Huy', 'Khoa', 'Lan', 'Linh', 'Long', 'Mai', 'Nam', 'Nhi', 'Phúc', 'Quân', 'Tâm', 'Thảo', 'Trang', 'Tú', 'Uyên', 'Vy', 'Yến'];

// Ngay trong 90 ngay qua, nghieng ve gan day (bieu do di len), KHONG lay hom
// nay - hom nay de danh cho luot dang nhap that dang ghi vao.
// rand()^1.5 don ve so nho = gan hom nay.
const pastDay = () => Math.max(1, Math.round(DAYS * Math.pow(rand(), 1.5)));
const atDay = (daysAgo) => {
    const d = new Date(Date.now() - daysAgo * DAY_MS);
    // Gio hoc hop ly theo gio VN (7h-23h) = 0h-16h UTC.
    d.setUTCHours(between(0, 16), between(0, 59), between(0, 59), 0);
    return d;
};

async function remove() {
    const enrolls = await Enrollment.collection.find({ seeded: true }).project({ course: 1, status: 1 }).toArray();
    const perCourse = new Map();
    for (const e of enrolls) {
        if (e.status === 'dropped') continue; // bo hoc thi luc bo da tru roi
        const k = String(e.course);
        perCourse.set(k, (perCourse.get(k) || 0) + 1);
    }
    const counts = {
        users: await User.collection.countDocuments({ seeded: true }),
        enrollments: enrolls.length,
        logins: await LoginActivity.collection.countDocuments({ seeded: true }),
        courses: perCourse.size,
    };
    console.log('Se xoa:', counts);
    if (!WRITE && !process.argv.includes('--chac')) {
        console.log('\nXem truoc. Them --chac de xoa that:  node scripts/seed-dashboard-demo.js --xoa --chac');
        return;
    }
    for (const [course, n] of perCourse) {
        await Course.collection.updateOne({ _id: new mongoose.Types.ObjectId(course) }, { $inc: { studentsCount: -n } });
    }
    await Enrollment.collection.deleteMany({ seeded: true });
    await LoginActivity.collection.deleteMany({ seeded: true });
    await User.collection.deleteMany({ seeded: true });
    console.log('Da xoa xong.');
}

async function create() {
    if (await User.collection.countDocuments({ seeded: true })) {
        console.log('Da co du lieu mau. Chay --xoa --chac truoc neu muon tao lai.');
        return;
    }

    const courses = await Course.find({ isPublished: true }).select('_id title').lean();
    if (!courses.length) throw new Error('Chua co khoa hoc nao da xuat ban de ghi danh.');
    const realUsers = await User.find({ status: { $ne: false } }).select('_id createdAt googleId').lean();
    const takenIds = new Set((await User.find().select('userId').lean()).map((u) => u.userId));

    // ---- nguoi dung mau
    const password = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
    const users = [];
    for (let i = 1; i <= DEMO_USERS; i++) {
        const name = `${pick(HO)} ${pick(DEM)} ${pick(TEN)}`;
        let userId;
        do userId = `USR${between(10000000, 99999999)}`;
        while (takenIds.has(userId));
        takenIds.add(userId);
        const createdAt = atDay(pastDay());
        const doc = new User({
            name,
            fullname: name,
            email: `hocvien.demo${String(i).padStart(2, '0')}@example.com`,
            password,
            role: 'student',
            emailVerified: true,
        }).toObject();
        Object.assign(doc, { userId, createdAt, updatedAt: createdAt, seeded: true });
        users.push(doc);
    }

    // ---- ghi danh mau: moi nguoi 1-3 khoa, sau ngay tao tai khoan
    const enrollments = [];
    const perCourse = new Map();
    for (const u of users) {
        const mine = [...courses].sort(() => rand() - 0.5).slice(0, between(1, Math.min(3, courses.length)));
        u.enrolledCourses = mine.map((c) => c._id);
        for (const c of mine) {
            const userAge = Math.max(1, Math.floor((Date.now() - u.createdAt.getTime()) / DAY_MS));
            const createdAt = atDay(between(1, userAge));
            const done = rand() < 0.2;
            const doc = new Enrollment({
                course: c._id,
                student: u._id,
                status: done ? 'completed' : 'active',
                totalProgress: done ? 100 : between(5, 90),
            }).toObject();
            Object.assign(doc, {
                createdAt,
                updatedAt: createdAt,
                lastAccessedAt: createdAt,
                ...(done ? { completedAt: new Date(Math.min(Date.now() - DAY_MS, createdAt.getTime() + between(3, 20) * DAY_MS)) } : {}),
                seeded: true,
            });
            enrollments.push(doc);
            perCourse.set(String(c._id), (perCourse.get(String(c._id)) || 0) + 1);
        }
    }

    // ---- luot dang nhap: moi ngay mot nhom nguoi (that + mau da co tai khoan)
    const everyone = [
        ...realUsers.map((u) => ({ _id: u._id, createdAt: u.createdAt, google: Boolean(u.googleId) })),
        ...users.map((u) => ({ _id: u._id, createdAt: u.createdAt, google: false })),
    ];
    const logins = [];
    for (let ago = DAYS; ago >= 1; ago--) {
        const dayStart = Date.now() - ago * DAY_MS;
        const pool = everyone.filter((u) => !u.createdAt || new Date(u.createdAt).getTime() <= dayStart);
        const weekday = new Date(dayStart + 7 * 60 * 60 * 1000).getUTCDay();
        const weekend = weekday === 0 || weekday === 6;
        // Ty le vao trong ngay tang dan ve gan day, cuoi tuan thap hon.
        const share = (0.12 + 0.18 * (1 - ago / DAYS)) * (weekend ? 0.6 : 1);
        for (const u of pool) {
            if (rand() > share) continue;
            const lastAt = atDay(ago);
            logins.push({
                user: u._id,
                day: vnDateKey(lastAt),
                method: u.google && rand() < 0.7 ? 'google' : 'password',
                count: rand() < 0.25 ? 2 : 1,
                lastAt,
                createdAt: lastAt,
                updatedAt: lastAt,
                seeded: true,
            });
        }
    }

    console.log({
        nguoiDungMau: users.length,
        ghiDanhMau: enrollments.length,
        luotDangNhap: logins.reduce((s, l) => s + l.count, 0),
        dongDangNhap: logins.length,
        khoaDuocCong: perCourse.size,
        nguoiThatDuocTinhDangNhap: realUsers.length,
    });

    if (!WRITE) {
        console.log('\nXem truoc. Them --ghi de ghi that.');
        return;
    }

    await User.collection.insertMany(users);
    await Enrollment.collection.insertMany(enrollments);
    await LoginActivity.collection.insertMany(logins, { ordered: false });
    for (const [course, n] of perCourse) {
        await Course.collection.updateOne({ _id: new mongoose.Types.ObjectId(course) }, { $inc: { studentsCount: n } });
    }
    console.log('Da ghi xong. Go lai: node scripts/seed-dashboard-demo.js --xoa --chac');
}

(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
        await (REMOVE ? remove() : create());
    } finally {
        await mongoose.disconnect();
    }
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
