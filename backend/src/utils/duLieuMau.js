// Do du lieu mau cho bai giang: video xem duoc that, va moi bai mot bai tap.
//
// VI SAO CAN: 48 bai giang deu co videoUrl, nhung tro toi cdn.example.com -
// ten mien khong ton tai. Trinh phat quay mai roi bao loi, nen nhin thi tuong
// da co video ma thuc te khong bai nao xem duoc. Va chi 8/48 bai co bai tap.
//
// CHAY THU (khong ghi gi, chi in ra se lam gi):
//
//   node src/utils/duLieuMau.js
//
// GHI THAT:
//
//   AP_DUNG=1 node src/utils/duLieuMau.js
//
// Chay lai nhieu lan khong sao: chi dong vao bai co video gia, va chi tao bai
// tap cho bai chua co.

require('dotenv').config();

const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

// Nguon video cong khai, da kiem tra tung dia chi tra ve 200 truoc khi ghi vao
// day. Ban dau dinh dung bo mau cua Google (gtv-videos-bucket) nhung no da
// khoa lai, tra 403 - nen moi phai doi sang may nguon nay.
//
// Tron ca MP4 lan HLS la co chu dich: trang hoc co hai nhanh xu ly khac nhau
// cho hai dinh dang, de mot loai thi mot nhanh khong bao gio duoc chay thu.
const VIDEO = [
    'https://media.w3.org/2010/05/sintel/trailer.mp4',
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    'https://media.w3.org/2010/05/bunny/trailer.mp4',
    'https://stream.mux.com/v69RSHhFelSm4701snP22dYz2jICy4E4FUyk02rW4gxRM.m3u8',
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    'https://test-streams.mux.dev/pts_shift/master.m3u8',
    'https://media.w3.org/2010/05/bunny/movie.mp4',
    'https://test-streams.mux.dev/tos_ismc/main.m3u8',
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
    'https://media.w3.org/2010/05/video/movie_300.mp4',
];

// Video "gia": can thay. Bo qua moi dia chi khac - nguoi dung co the da tu tai
// video that len Cloudinary, ghi de len la mat.
const laVideoGia = (url) =>
    !url || !String(url).trim() || String(url).includes('cdn.example.com');

// Bai tap 3 cau cho mot bai giang. Cau hoi bam theo tieu de bai de khong phai
// 48 ban sao giong het nhau.
const taoCauHoi = (tenBai) => [
    {
        _id: new mongoose.Types.ObjectId(),
        text: `Nội dung chính của bài "${tenBai}" là gì?`,
        type: 'multiple_choice',
        options: [
            { text: `Các khái niệm cốt lõi được trình bày trong "${tenBai}"`, isCorrect: true },
            { text: 'Lịch sử hình thành của ngành công nghệ thông tin', isCorrect: false },
            { text: 'Hướng dẫn cài đặt hệ điều hành', isCorrect: false },
            { text: 'Cách đăng ký tài khoản trên hệ thống', isCorrect: false },
        ],
        explanation: 'Đáp án đúng bám sát nội dung được trình bày trong bài giảng.',
        points: 1,
    },
    {
        _id: new mongoose.Types.ObjectId(),
        text: 'Nên xem hết video bài giảng trước khi làm bài tập.',
        type: 'true_false',
        options: [
            { text: 'Đúng', isCorrect: true },
            { text: 'Sai', isCorrect: false },
        ],
        explanation: 'Bài tập kiểm tra kiến thức được trình bày trong video.',
        points: 1,
    },
    {
        _id: new mongoose.Types.ObjectId(),
        text: `Hãy tóm tắt trong 2-3 câu điều bạn học được từ bài "${tenBai}".`,
        type: 'short_answer',
        correctAnswer: 'Câu trả lời mở - giảng viên chấm tay.',
        explanation: 'Không có đáp án cố định; viết theo cách hiểu của bạn.',
        points: 2,
    },
];

const chay = async () => {
    const apDung = process.env.AP_DUNG === '1';

    await connectDB();

    const dsBai = await Lesson.find().sort({ courseId: 1, order: 1 }).lean();
    if (dsBai.length === 0) {
        console.log('Khong co bai giang nao.');
        return;
    }

    // --- Phan 1: video ----------------------------------------------------

    const canSuaVideo = dsBai.filter((b) => laVideoGia(b.videoUrl));

    console.log(`Bai giang            : ${dsBai.length}`);
    console.log(`  video gia can thay : ${canSuaVideo.length}`);
    console.log(`  video that giu lai : ${dsBai.length - canSuaVideo.length}`);

    if (apDung && canSuaVideo.length > 0) {
        // Chia deu theo thu tu chu khong ngau nhien: chay lai lan hai ra dung
        // ket qua nhu lan dau, de doi chieu khi co gi sai.
        const lenh = canSuaVideo.map((bai, i) => ({
            updateOne: {
                filter: { _id: bai._id },
                update: { $set: { videoUrl: VIDEO[i % VIDEO.length] } },
            },
        }));
        const kq = await Lesson.bulkWrite(lenh);
        console.log(`  -> da cap nhat     : ${kq.modifiedCount} bai`);
    }

    // --- Phan 2: bai tap --------------------------------------------------

    const daCoQuiz = await Quiz.find({ lesson: { $ne: null } }).select('lesson').lean();
    const tapDaCo = new Set(daCoQuiz.map((q) => String(q.lesson)));
    const canTaoQuiz = dsBai.filter((b) => !tapDaCo.has(String(b._id)));

    console.log(`Bai tap`);
    console.log(`  bai da co bai tap  : ${dsBai.length - canTaoQuiz.length}`);
    console.log(`  bai can tao them   : ${canTaoQuiz.length}`);

    if (apDung && canTaoQuiz.length > 0) {
        let dem = 0;
        for (const bai of canTaoQuiz) {
            const cauHoi = taoCauHoi(bai.title);
            await Quiz.create({
                course: bai.courseId,
                lesson: bai._id,
                title: `Bài tập: ${bai.title}`,
                description: `Bài tập ngắn kiểm tra kiến thức của bài "${bai.title}".`,
                questions: cauHoi,
                passingScore: 70,
                timeLimit: 10,
                attempts: 3,
                showAnswers: true,
                isPublished: true,
            });
            dem += 1;
        }
        console.log(`  -> da tao          : ${dem} bai tap`);
    }

    if (!apDung) {
        console.log('');
        console.log('Day moi la chay thu, CHUA ghi gi. Ghi that thi chay:');
        console.log('  AP_DUNG=1 node src/utils/duLieuMau.js');
    }
};

chay()
    .catch((loi) => {
        console.error('That bai:', loi.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.connection.close());
