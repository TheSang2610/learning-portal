const SiteSetting = require('../models/SiteSetting');
const { mergeAppearance } = require('../utils/appearanceSettings');

const KEY = 'appearance';

const readAppearance = async () => {
    const doc = await SiteSetting.findOne({ key: KEY }).lean();
    // Gia tri trong CSDL cung di qua mergeAppearance: ban ghi cu thieu truong
    // moi thi tu lap bang mac dinh, khong de giao dien doc ra undefined.
    return mergeAppearance(doc?.value);
};

// @desc    Cai dat giao dien (cong khai - trang chu doc de ve)
// @route   GET /api/settings/appearance
const getAppearance = async (req, res) => {
    try {
        res.json(await readAppearance());
    } catch (error) {
        console.error('[settings/appearance]', error.message);
        res.status(500).json({ message: 'Không lấy được cài đặt giao diện.' });
    }
};

// @desc    Luu cai dat giao dien (admin)
// @route   PUT /api/settings/appearance
//
// Gop vao ban dang luu: truong nao khong gui thi giu nguyen, truong sai kieu
// thi bo qua (mau chi nhan ma hex - xem utils/appearanceSettings.js).
const updateAppearance = async (req, res) => {
    try {
        const next = mergeAppearance(req.body, await readAppearance());
        await SiteSetting.updateOne(
            { key: KEY },
            { $set: { value: next, updatedBy: req.user._id } },
            { upsert: true }
        );
        res.json(next);
    } catch (error) {
        console.error('[settings/appearance PUT]', error.message);
        res.status(500).json({ message: 'Không lưu được cài đặt giao diện.' });
    }
};

module.exports = { getAppearance, updateAppearance };
