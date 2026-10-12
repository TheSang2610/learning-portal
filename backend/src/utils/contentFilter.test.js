// Kiem tra bo loc noi dung.  Chay:  npm run test:filter
//
// Danh sach tu trong contentFilter.js chac chan se con duoc them bot. Moi lan
// them mot tu la mot lan co the chan nham tai lieu that - nen truoc khi sua
// danh sach, them cau vao MUST_PASS/MUST_BLOCK roi chay lai file nay.
//
// MUST_PASS quan trong hon MUST_BLOCK: chan nham mot bai giang hop le lam nguoi
// dung bo di, con lot mot cau chui thi con nut bao cao va admin xoa duoc.

const { checkText } = require('./contentFilter');

// Nhung cau nay PHAI duoc dang. Phan lon la bay thuc te: bo dau tieng Viet
// lam tu chui trung voi tu thong dung trong moi truong hoc.
const MUST_PASS = [
    'Đề cương ôn tập các môn học kỳ 1',
    'Gửi các bạn tài liệu ôn thi',
    'Hướng dẫn cài đặt tài khoản admin',
    'Bài tập Vật Lý đại cương - VL1',
    'Đề thi VL chương 3',                        // 'vl'  != vai lon
    'Đổi đơn vị: 1 m = 10 dm = 100 cm',          // 'dm'  = de-xi-met
    'Lịch sử: nạn diệt chủng ở Campuchia',       // de tai lich su
    'Chủ nghĩa khủng bố quốc tế - tiểu luận',    // de tai chinh tri
    'Mã độc phá hoại dữ liệu và cách phòng chống',
    'Thế điện động chậm (retarded potential)',   // thuat ngu vat ly
    'Món ăn: trứng chim cút luộc',
    'Cắt xéo góc 45 độ trong AutoCAD',
    'Thang cho diem bai thi cuoi ky',            // 'thang cho' hop le
    'Buoi hoc thu 3 va cac buoi tiep theo',      // 'buoi' = buoi hoc
    'So sanh lon hon nho hon trong C++',         // 'lon'  = lon hon
    'Cau truc du lieu va giai thuat',            // 'du'   = du lieu
    'Deo kinh bao ho khi lam thi nghiem',        // 'deo'  = deo kinh
    'Tai lieu do ai nam giu thi lien he lop truong',
    'Lam vay cho de nhin hon',                   // 'cho de' = cho de
    'Con lai bao nhieu phan tram',
    'Day du cac thanh phan cua he thong',        // 'cac'  = cac
    'Ba tau chien cua hai quan Phap nam 1858',
    'Nhat ky thuc tap tot nghiep',
    'Bo mon Vat Ly - de cuong VL2',
];

// Nhung cau nay PHAI bi chan, ca khi go co dau lan khong dau.
const MUST_BLOCK = [
    'đm cái đề này khó quá',
    'thằng chó đó ra đề ngu',
    'anh em vào chửi thằng này đi',
    'bọn tàu khựa ăn cắp công nghệ',
    'thằng bê đê kia im mồm',
    'this is fucking stupid',
    'nigger go home',
    'vào spam trang này cho nó sập',
    'đánh chết nó đi',
    'v c l đề khó thật',                          // viet tach chu de lach
    'sh1t homework',                              // thay chu bang so
    'gây war với lớp bên cạnh',
    'thang cho nay ra de kho qua',
    'anh em vao chui no di',
    'bon tau khua an cap cong nghe',
    'danh chet no di',
    'gay war voi lop ben canh',
    'do khon nan that su',
    'thang be de kia',
    'vao spam trang nay cho no sap',
    'd.m.m de kho vai',
    'bon bac ky lam an gian doi',
];

let falseBlock = 0;
let slipThrough = 0;

for (const questionItem of MUST_PASS) {
    const r = checkText(questionItem);
    if (!r.ok) {
        console.log(`  CHAN NHAM: ${JSON.stringify(questionItem)}  (dinh tu: "${r.matched}")`);
        falseBlock++;
    }
}

for (const questionItem of MUST_BLOCK) {
    const r = checkText(questionItem);
    if (r.ok) {
        console.log(`  LOT LUOI : ${JSON.stringify(questionItem)}`);
        slipThrough++;
    }
}

console.log(
    `hop le: ${MUST_PASS.length - falseBlock}/${MUST_PASS.length} qua  |  ` +
    `vi pham: ${MUST_BLOCK.length - slipThrough}/${MUST_BLOCK.length} bi chan`,
);

if (falseBlock || slipThrough) {
    console.error(`\nTHAT BAI - chan nham ${falseBlock}, lot luoi ${slipThrough}`);
    process.exit(1);
}
console.log('OK');
