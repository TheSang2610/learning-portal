const mongoose = require('mongoose');

/**
 * Cai dat chung cua trang, moi `key` mot dong (vd. "appearance"). Gia tri luu
 * nguyen khoi va LUON di qua ham kiem tra rieng cua tung key truoc khi ghi /
 * doc - xem utils/appearanceSettings.js.
 */
const siteSettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, minimize: false });

module.exports = mongoose.model('SiteSetting', siteSettingSchema);
