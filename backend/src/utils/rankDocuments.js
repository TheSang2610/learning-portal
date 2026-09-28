/**
 * Xep hang tai lieu chia se de goi y.
 *
 * Anh em voi utils/rankSuggestions.js (goi y KHOA HOC) nhung CO Y tach rieng,
 * khong dung chung: kho tai lieu la mot luong doc lap voi khoa hoc va bai hoc,
 * chu du an muon giu hai luong khong dinh vao nhau. Vi vay o day khong dung
 * Category cua khoa hoc - mon hoc cua tai lieu la mot truong rieng (monHoc).
 *
 * Toan bo file la HAM THUAN - khong CSDL, khong mang - nen test duoc tren CI
 * (CI khong co MONGO_URI). Viec doc CSDL nam o documentController.
 *
 * VI SAO DUNG QUY TAC CHU KHONG DUNG MO HINH HOC MAY: cung ly do nhu ben goi y
 * khoa hoc. Kho moi co vai tai lieu, mot mo hinh se hoc ra nhieu la hon quy
 * luat. Va quy tac GIAI THICH DUOC: moi goi y tra kem mot cau "vi sao".
 */

// ---------------------------------------------------------------------------
// Chuan hoa chu
// ---------------------------------------------------------------------------

/** Bo dau tieng Viet. "đ" khong phai dau ghep nen NFD khong tach duoc, phai
 *  thay rieng. */
const boDau = (s) =>
    String(s || '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');

/**
 * Khoa so sanh cua mot mon hoc.
 *
 * Nguoi dang go tay nen cung mot mon se ra nhieu cach viet: "Cấu trúc dữ liệu",
 * "cau truc du lieu", "Cấu  trúc dữ liệu " (thua dau cach). Khong gop lai thi
 * goi y theo mon coi chung la ba mon khac nhau, va muc "cung mon" gan nhu
 * khong bao gio trung.
 */
const chuanHoaMon = (s) =>
    boDau(s)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

// Tu xuat hien trong gan nhu moi tieu de tai lieu. Dem chung vao thi hai tai
// lieu bat ky deu "khop tu khoa" chi vi cung chu "tai lieu" - diem khop mat
// het y nghia.
//
// CAN THAN KHI THEM TU: so sanh dien ra SAU khi bo dau, nen mot chu khong dau
// o day chan luon moi chu co dau trung mat chu. Hai tu tung nam trong danh
// sach nay va da bi go, test bat duoc:
//   'thi' - nham la lien tu "thì", nhung no cung la "thị" (đồ thị) va "thi"
//           (đề thi, ôn thi). Voi kho tai lieu hoc tap, "de thi" la loai tai
//           lieu cot loi, chan no la mat tin hieu quy nhat.
//   'co'  - nham la "có", nhung no cung la "cơ" trong "Cơ sở dữ liệu".
const TU_BO_QUA = new Set([
    'tai', 'lieu', 'mon', 'hoc', 'va', 'cua', 'cho', 'cac', 'nhung', 'la',
    'voi', 'trong', 'de', 'bai', 'giang', 'giao', 'trinh', 'phan',
    'chuong', 'on', 'tap', 'ki', 'ky', 'nam', 'file', 'pdf', 'doc', 'docx',
    'mot', 'hai', 'ba', 'khong', 'duoc', 'theo', 've', 'tu', 'den',
]);

/**
 * Doi mot gia tri "mon" ve MANG. Tai lieu va lich su moi luu mang (mot tai
 * lieu nhieu mon); ban ghi cu con la chuoi. Nhan ca hai de khong phu thuoc
 * viec script chuyen du lieu da chay hay chua.
 */
const thanhMang = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);

/**
 * Cac mon cua mot tai lieu: [{ key, ten }], cung thu tu nhu tren tai lieu.
 * Thieu khoa thi tu chuan hoa tu ten.
 */
const cacMonCua = (taiLieu) => {
    const ten = thanhMang(taiLieu && taiLieu.monHoc).map((t) => String(t).trim());
    const khoa = thanhMang(taiLieu && taiLieu.monHocKey);
    if (!khoa.length) return ten.map((t) => ({ key: chuanHoaMon(t), ten: t })).filter((m) => m.key);
    return khoa.map((k, i) => ({ key: k, ten: ten[i] || k }));
};

/** Tach chuoi thanh cac tu khoa co nghia, khong trung nhau. */
const tachTuKhoa = (s) => [
    ...new Set(
        chuanHoaMon(s)
            .split(' ')
            // Bo tu 1 ky tu: "c", "a" khop voi moi thu.
            .filter((t) => t.length >= 2 && !TU_BO_QUA.has(t)),
    ),
];

// ---------------------------------------------------------------------------
// Trong so
// ---------------------------------------------------------------------------
//
// Bon nguon tin hieu, xep theo do tin cay giam dan:
//
//   CUNG_MON_DANG_XEM - manh nhat. Nguoi dang doc tai lieu mon "Cau truc du
//     lieu" thi tai lieu cung mon gan nhu chac chan lien quan.
//
//   MON_QUAN_TAM - mon rut ra tu lich su xem/tai. Tai tinh gap ba xem: bam vao
//     xem co the chi la to mo, con tai ve la da can that.
//
//   TU_KHOA - khop tu trong tieu de/mon voi tu nguoi dung da tim, hoac voi
//     tieu de tai lieu dang xem. Co tran de mot tieu de dai nhieu tu khong
//     vuot mat tai lieu cung mon.
//
//   PHO_BIEN - yeu nhat, chi de pha the hoa khi cac muc tren bang nhau.
const DIEM_CUNG_MON_DANG_XEM = 50;
const DIEM_MOI_TRONG_SO_MON = 10;
const DIEM_MON_QUAN_TAM_TOI_DA = 30;
const DIEM_MOI_TU_KHOA = 8;
const DIEM_TU_KHOA_TOI_DA = 24;
const DIEM_PHO_BIEN_TOI_DA = 10;

// Qua 20 luot tai thi coi nhu pho bien toi da: chenh lech phia tren chi phan
// anh tai lieu nao dang truoc, khong phan anh tai lieu nao hop hon.
const NGUONG_PHO_BIEN = 20;

// Trong so cua tung loai hanh dong khi gom lich su.
const TRONG_SO_HANH_DONG = { xem: 1, tai: 3 };

// Chi lay tu khoa tu chung nay lan tim gan nhat: so thich thay doi, tim tu
// thang truoc it noi len dieu nguoi dung can hom nay.
const SO_LAN_TIM_GAN_NHAT = 10;
const SO_TU_KHOA_TOI_DA = 12;

// ---------------------------------------------------------------------------
// Gom lich su
// ---------------------------------------------------------------------------

/**
 * Doi danh sach hanh dong cua mot nguoi thanh boi canh de cham diem.
 *
 * `hoatDong` sap MOI NHAT TRUOC. Moi phan tu: { loai: 'xem'|'tai'|'tim',
 * document, monHocKey, tuKhoa }.
 */
const tongHopLichSu = (hoatDong) => {
    const monQuanTam = new Map();
    const daTai = new Set();
    const tuKhoa = [];
    let soLanTim = 0;

    for (const h of Array.isArray(hoatDong) ? hoatDong : []) {
        if (!h || !h.loai) continue;

        if (h.loai === 'tim') {
            if (soLanTim >= SO_LAN_TIM_GAN_NHAT) continue;
            soLanTim += 1;
            for (const t of tachTuKhoa(h.tuKhoa)) {
                if (!tuKhoa.includes(t)) tuKhoa.push(t);
            }
            continue;
        }

        const trongSo = TRONG_SO_HANH_DONG[h.loai];
        if (!trongSo) continue;

        // Mot tai lieu nhieu mon: moi mon cua no deu duoc tinh la "quan tam".
        for (const k of thanhMang(h.monHocKey)) {
            monQuanTam.set(k, (monQuanTam.get(k) || 0) + trongSo);
        }
        if (h.loai === 'tai' && h.document) daTai.add(String(h.document));
    }

    return { monQuanTam, daTai, tuKhoa: tuKhoa.slice(0, SO_TU_KHOA_TOI_DA) };
};

/**
 * Gom lich su xem/tai thanh MOT dong moi tai lieu, cho tab "Lich su" hien ra.
 *
 * Bang goc ghi tung hanh dong, nen mot tai lieu xem ba lan roi tai mot lan la
 * bon dong. Hien nguyen ra thi danh sach lap lai mot ten bon lan. O day moi
 * tai lieu con mot dong: lan gan nhat, va co danh dau "da tai" neu tung tai
 * du chi mot lan.
 *
 * `hoatDong` sap MOI NHAT TRUOC. Tra ve mang theo dung thu tu do. Bo qua loai
 * 'tim' vi tim khong gan voi tai lieu nao.
 */
const gopLichSuTheoTaiLieu = (hoatDong) => {
    const theoTaiLieu = new Map();
    for (const h of Array.isArray(hoatDong) ? hoatDong : []) {
        if (!h || !h.document || (h.loai !== 'xem' && h.loai !== 'tai')) continue;
        const id = String(h.document);
        const cu = theoTaiLieu.get(id);
        if (!cu) {
            // Gap lan dau = lan GAN NHAT, vi danh sach da sap moi nhat truoc.
            theoTaiLieu.set(id, { document: id, lanCuoi: h.createdAt, daTai: h.loai === 'tai' });
        } else if (h.loai === 'tai') {
            cu.daTai = true;
        }
    }
    return [...theoTaiLieu.values()];
};

// ---------------------------------------------------------------------------
// Cham diem
// ---------------------------------------------------------------------------

/**
 * Cham diem MOT tai lieu.
 *
 * `boi`:
 *   monDangXem   khoa mon (chuoi hoac mang) cua tai lieu dang mo o trang chi
 *                tiet; rong neu khong
 *   monQuanTam   Map<khoa mon, trong so> tu lich su
 *   tuKhoa       mang tu khoa da chuan hoa
 *   nguonTuKhoa  'tim' (tu lich su tim) | 'tieuDe' (tu tai lieu dang xem) -
 *                chi de chon cau giai thich cho dung
 *
 * Tra ve ca `vi` - cau hien duoi moi goi y. Mot goi y khong noi duoc ly do thi
 * nguoi dung coi no la quang cao.
 */
const chamDiem = (taiLieu, boi = {}) => {
    const monQuanTam = boi.monQuanTam instanceof Map ? boi.monQuanTam : new Map();
    const tuKhoa = Array.isArray(boi.tuKhoa) ? boi.tuKhoa : [];
    const cacMon = cacMonCua(taiLieu);
    const monDangXem = new Set(thanhMang(boi.monDangXem));

    let diem = 0;
    // Cac ly do co the co, cau cu the nhat dung truoc. Tinh het roi moi chon
    // de thu tu cong diem khong quyet dinh cau giai thich.
    const lyDo = [];

    // Trung MOT mon voi tai lieu dang xem la du diem "cung mon" - khong cong
    // don theo so mon trung, khong thi tai lieu gan nhieu mon luon thang.
    const monChung = cacMon.find((m) => monDangXem.has(m.key));
    // Mon quan tam: lay mon co trong so lich su CAO NHAT trong cac mon cua tai
    // lieu, cung ly do - mot tin hieu, khong cong don.
    const monHayXem = cacMon
        .filter((m) => monQuanTam.has(m.key))
        .sort((a, b) => monQuanTam.get(b.key) - monQuanTam.get(a.key))[0];

    if (monChung) {
        diem += DIEM_CUNG_MON_DANG_XEM;
        lyDo.push([1, `Cùng môn ${monChung.ten}`]);
    } else if (monHayXem) {
        // else: cung mon dang xem da la ly do manh hon, cong them diem lich su
        // cho cung mon ay la dem mot tin hieu hai lan.
        diem += Math.min(monQuanTam.get(monHayXem.key) * DIEM_MOI_TRONG_SO_MON, DIEM_MON_QUAN_TAM_TOI_DA);
        lyDo.push([3, `Môn ${monHayXem.ten} bạn hay xem`]);
    }

    if (tuKhoa.length) {
        const tuCuaTaiLieu = new Set(
            tachTuKhoa(`${taiLieu.title || ''} ${cacMon.map((m) => m.ten).join(' ')}`),
        );
        const trung = tuKhoa.filter((t) => tuCuaTaiLieu.has(t));
        if (trung.length) {
            diem += Math.min(trung.length * DIEM_MOI_TU_KHOA, DIEM_TU_KHOA_TOI_DA);
            if (boi.nguonTuKhoa === 'tim') {
                lyDo.push([2, `Liên quan tới "${trung[0]}" bạn đã tìm`]);
            } else {
                lyDo.push([4, 'Nội dung gần với tài liệu đang xem']);
            }
        }
    }

    const luotTai = Number(taiLieu.downloadCount) || 0;
    if (luotTai > 0) {
        diem += Math.min(luotTai / NGUONG_PHO_BIEN, 1) * DIEM_PHO_BIEN_TOI_DA;
        lyDo.push([5, 'Được tải nhiều']);
    }

    lyDo.sort((a, b) => a[0] - b[0]);
    return { diem, vi: lyDo.length ? lyDo[0][1] : 'Mới được chia sẻ' };
};

/**
 * Xep hang va cat lay N tai lieu.
 *
 * `boi.loaiTru` - Set id PHAI bo: tai lieu dang xem va tai lieu nguoi dung da
 * tai ve. Goi y lai dung thu nguoi ta vua tai la loi de thay nhat cua mot muc
 * goi y.
 */
const xepHangTaiLieu = (danhSach, boi = {}, soLuong = 6) => {
    if (!Array.isArray(danhSach)) return [];
    const loaiTru = boi.loaiTru instanceof Set ? boi.loaiTru : new Set();

    return danhSach
        .filter((d) => d && d._id && !loaiTru.has(String(d._id)))
        .map((d) => {
            const { diem, vi } = chamDiem(d, boi);
            return { ...d, diemGoiY: diem, viSaoGoiY: vi };
        })
        .sort((a, b) => {
            if (b.diemGoiY !== a.diemGoiY) return b.diemGoiY - a.diemGoiY;
            // Bang diem thi moi hon len truoc. Khong co nac nay thi thu tu phu
            // thuoc CSDL tra ve the nao, doi giua hai lan tai trang.
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        })
        .slice(0, Math.max(1, Math.min(soLuong, 24)));
};

module.exports = {
    boDau,
    chuanHoaMon,
    thanhMang,
    cacMonCua,
    tachTuKhoa,
    tongHopLichSu,
    gopLichSuTheoTaiLieu,
    chamDiem,
    xepHangTaiLieu,
    DIEM_CUNG_MON_DANG_XEM,
    DIEM_MON_QUAN_TAM_TOI_DA,
    DIEM_MOI_TU_KHOA,
    DIEM_TU_KHOA_TOI_DA,
    DIEM_PHO_BIEN_TOI_DA,
    TRONG_SO_HANH_DONG,
};
