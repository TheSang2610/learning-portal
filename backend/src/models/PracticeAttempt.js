const mongoose = require('mongoose');

// Mot lan lam bai luyen tap (trang /practice). De + cau hoi nam o frontend nen
// o day chi luu VI TRI cau / thu tu dap an / lua chon - du de dung lai dung bai
// da lam khi mo "Xem chi tiet bai lam". Xem utils/practiceAttempt.js.
const practiceAttemptSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        deId: { type: String, required: true },
        cau: { type: [Number], required: true },
        dapAn: { type: [[Number]], default: [] },
        chon: { type: [[Number]], default: [] },
        soDung: { type: Number, required: true },
        soCau: { type: Number, required: true },
        giay: { type: Number, required: true },
    },
    { timestamps: true },
);

// Lich su cua toi trong mot de, moi nhat truoc
practiceAttemptSchema.index({ user: 1, deId: 1, createdAt: -1 });

module.exports = mongoose.model('PracticeAttempt', practiceAttemptSchema);
