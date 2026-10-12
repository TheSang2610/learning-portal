// Chuan hoa tham so loc/phan trang lay tu req.query.
//
// Moi thu trong req.query deu la chuoi do NGUOI GOI tu dat, khong co gi bao dam
// no la so hay la chuoi vo hai. Dung thang vao Mongo thi vo o hai cho:
//
//   1. skip am  -> Mongo tu choi ca cau truy van, tra 500.
//   2. $regex   -> chuoi tim kiem cung la mau regex, nen mot dau "(" don doc
//                  la mau khong hop le va cung nem 500.
//
// Ca hai deu tung xay ra that tren 5 duong /api/admin/*.

// Trang va so dong moi trang, da ep ve so nguyen trong khoang hop le.
//
// Vi sao co tran `toiDa`: khong co no thi ?limit=100000 keo ca bang ve RAM.
// 100 la con so lon nhat ma giao dien hien dang xin (trang duyet danh gia),
// nen dat o day khong doi hanh vi cua bat ky man hinh nao.
const paginate = (query = {}, { defaults = 10, toiDa: max = 100 } = {}) => {
    // `|| defaults` bat duoc ca NaN ("abc") lan 0 - ca hai deu khong phai y dinh
    // hop le. So am thi Math.max keo ve 1.
    const pageSize = Math.min(max, Math.max(1, Math.floor(Number(query.limit)) || defaults));
    const page = Math.max(1, Math.floor(Number(query.page)) || 1);

    return { trang: page, soDong: pageSize, skip: (page - 1) * pageSize };
};

// Thoat ky tu dac biet de chuoi nguoi dung go duoc tim NHU CHU, khong phai nhu
// mau regex. Khong co ham nay thi go "(" la 500, con go "a+" lai ra ket qua sai
// vi dau + bi hieu la toan tu.
const REGEX_CHARS = /[.*+?^${}()|[\]\\]/g;

const thoatRegex = (chuoi) => String(chuoi ?? '').replace(REGEX_CHARS, '\\$&');

// Dung truc tiep trong filter: { name: fuzzyRegex(search) }
const fuzzyRegex = (chuoi) => ({ $regex: thoatRegex(chuoi), $options: 'i' });

module.exports = { phanTrang: paginate, thoatRegex, fuzzyRegex };
