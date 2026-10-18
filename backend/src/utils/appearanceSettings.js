// Cai dat giao dien do admin chinh (trang /admin/appearance): bat/tat cac cot
// "Pho bien nhat / Moi phat hanh / Dang thinh hanh" va mau cua hai dai quang
// cao (cho khach, cho hoc vien).
//
// Tach khoi controller de kiem duoc khong can CSDL. Moi gia tri tu trinh duyet
// deu di qua day: mau CHI nhan ma hex - mau di thang vao thuoc tinh style cua
// trang chu, nhan chuoi tuy y la mo duong chen CSS.

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

const SECTION_KEYS = ['mostPopular', 'newReleases', 'trendingNow'];
const BANNER_KEYS = ['guestPromo', 'memberPromo'];
const COLOR_KEYS = ['bgFrom', 'bgTo', 'text', 'buttonBg', 'buttonText', 'buttonHoverBg', 'buttonHoverText'];

/** Mac dinh = dung mau dang dung trong code truoc khi co trang cai dat. */
const DEFAULTS = Object.freeze({
    homeSections: { mostPopular: true, newReleases: true, trendingNow: true },
    banners: {
        guestPromo: {
            enabled: true,
            bgFrom: '#4f2bff',
            bgTo: '#00bfb3',
            text: '#ffffff',
            buttonBg: '#ffffff',
            buttonText: '#4f2bff',
            buttonHoverBg: '#ffc93c',
            buttonHoverText: '#0b0c1e',
        },
        memberPromo: {
            enabled: true,
            bgFrom: '#f4f1ff',
            bgTo: '#ffffff',
            text: '#0b0c1e',
            buttonBg: '#0b0c1e',
            buttonText: '#ffffff',
            buttonHoverBg: '#2c14b8',
            buttonHoverText: '#ffffff',
        },
    },
});

const clone = (v) => JSON.parse(JSON.stringify(v));

/**
 * Gop `input` (tu trinh duyet hoac tu CSDL) vao `base`: truong hop le thi lay,
 * truong sai kieu / thieu thi giu gia tri cua base. Khong bao gio nem.
 */
const mergeAppearance = (input, base = DEFAULTS) => {
    const out = clone(base);
    if (!input || typeof input !== 'object') return out;

    const sections = input.homeSections;
    if (sections && typeof sections === 'object') {
        for (const k of SECTION_KEYS) {
            if (typeof sections[k] === 'boolean') out.homeSections[k] = sections[k];
        }
    }

    const banners = input.banners;
    if (banners && typeof banners === 'object') {
        for (const b of BANNER_KEYS) {
            const src = banners[b];
            if (!src || typeof src !== 'object') continue;
            if (typeof src.enabled === 'boolean') out.banners[b].enabled = src.enabled;
            for (const c of COLOR_KEYS) {
                const v = typeof src[c] === 'string' ? src[c].trim() : '';
                if (HEX.test(v)) out.banners[b][c] = v.toLowerCase();
            }
        }
    }
    return out;
};

module.exports = { DEFAULTS, mergeAppearance, SECTION_KEYS, BANNER_KEYS, COLOR_KEYS };
