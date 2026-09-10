# Learning Portal — Backend

REST API cho nền tảng học trực tuyến: khoá học, bài học, ghi danh, bài kiểm tra,
chứng chỉ, ví coin và thanh toán chuyển khoản.

**API đang chạy:** https://learning-portal-backend-ten.vercel.app
**Giao diện:** https://learning-portal-s.vercel.app

Frontend nằm ở [`../frontend`](../frontend/README.md) trong cùng kho mã nguồn này.

---

## Công nghệ

| | |
|---|---|
| Máy chủ | Express **5**, JavaScript CommonJS |
| Cơ sở dữ liệu | MongoDB Atlas qua Mongoose **9.6** |
| Ảnh | Cloudinary |
| Đăng nhập | JWT trong cookie `httpOnly` + Google OAuth 2.0 |
| Mail | Nodemailer qua Gmail app password |
| Kiểm thử | `node:test` — **148 test**, chạy trên CI mỗi lần đẩy |

Cần **Node >= 20**.

---

## Chạy tại máy

```bash
npm install
cp .env.example .env      # rồi điền giá trị thật
npm run dev               # → http://localhost:5000
```

### Biến môi trường

`.env` **không** được commit và phải giữ nguyên như vậy — trong đó có
`JWT_SECRET`, chuỗi kết nối cơ sở dữ liệu và khoá Cloudinary.

| Biến | Bắt buộc | Ý nghĩa |
|---|---|---|
| `MONGO_URI` | có | Chuỗi kết nối MongoDB |
| `JWT_SECRET` | có | Khoá ký token phiên |
| `FRONTEND_ORIGINS` | có | Các origin được phép gọi CORS, ngăn cách bằng dấu phẩy |
| `CLOUDINARY_URL` | có | Dạng gộp `cloudinary://key:secret@cloud` |
| `GOOGLE_CLIENT_ID` | không | Bật đăng nhập bằng Google |
| `MAIL_USER` | không | Gmail dùng để **gửi** thông báo |
| `MAIL_APP_PASSWORD` | không | App password 16 ký tự, **không** phải mật khẩu Gmail |
| `MAIL_ADMIN` | không | Địa chỉ **nhận** thông báo; bỏ trống thì gửi về `MAIL_USER` |
| `SO_TAI_KHOAN` `TEN_TAI_KHOAN` `NGAN_HANG` | không | Thông tin hiển thị ở màn hình chuyển khoản |

Thiếu ba biến `MAIL_*` thì API vẫn chạy bình thường — hàm gửi mail tự bỏ qua và
ghi cảnh báo, **không** ném lỗi. Chủ ý là vậy: một đơn hàng đã lưu đúng không nên
báo lỗi cho học viên chỉ vì mail hỏng, họ sẽ chuyển khoản lần nữa.

### Kiểm tra kết nối bên ngoài

```bash
npm run check:db          # thử kết nối MongoDB
npm run check:cloudinary  # thử tải ảnh lên
npm run check:mail        # gửi thử một mail thật
```

---

## Kiểm thử

```bash
npm test                  # node --test "src/**/*.test.js"
npm run test:filter -- <tên>
```

**148 test trong 15 tệp.** Tệp test đặt ngay cạnh tệp được kiểm, tên `*.test.js`.

Test là **hàm thuần**: không mở kết nối cơ sở dữ liệu, không gọi Cloudinary. CI
không có secret nào, và `MONGO_URI` trỏ tới cụm dữ liệu thật đang chạy — test
chạm vào đó là hỏng dữ liệu thật.

CI còn chạy `node --check` trên mọi tệp `.js`. Dự án chưa có linter, nên đó là
lưới an toàn duy nhất bắt lỗi cú pháp ở những tệp không test nào chạm tới.

---

## Cấu trúc

```
index.js              điểm vào
src/
  config/             kết nối CSDL, Cloudinary, mail
  controllers/        logic nghiệp vụ
  middlewares/        xác thực, CSRF, giới hạn tần suất, kiểm tra id
  models/             17 lược đồ Mongoose
  routes/             16 tệp khai báo đường dẫn, ~135 endpoint
  utils/              công cụ dùng chung + tệp *.test.js
```

---

## Phân quyền

`middlewares/authMiddleware.js` xuất ra ba lớp bảo vệ:

| | Cho qua ai |
|---|---|
| `protect` | đã đăng nhập (đọc token từ cookie `httpOnly`) |
| `instructor` | **giảng viên và quản trị** |
| `admin` | chỉ quản trị |

Riêng quyền xuất bản khoá học được kiểm **trong controller**
(`courseController.publishCourse`) chứ không ở tầng route — đừng cho rằng cứ nhìn
route thấy thiếu middleware là chỗ đó không được bảo vệ.

---

## Vài quyết định kỹ thuật đáng chú ý

**Nội dung có phí đi qua đúng một cửa.**
`utils/quyenNoiDung.js` xuất ra `duocXemNoiDung(course, user)`. Mọi đường trả về
nội dung bài học **bắt buộc** gọi hàm này.

Lý do ghi ngay đầu tệp: trước đây cổng 402 chỉ đặt ở đường ghi danh, còn đường
đọc bài thì không kiểm gì. Mở một tài khoản miễn phí rồi gọi thẳng
`GET /api/lessons/:id` là lấy được `videoUrl` của khoá có phí. Thêm đường đọc nội
dung mới mà quên gọi hàm này là mở lại đúng lỗ hổng đó.

**Trừ tiền bằng một lệnh ghi duy nhất.**

```js
findOneAndUpdate(
  { _id, soDuCoin: { $gte: soTien } },
  { $inc: { soDuCoin: -soTien } }
)
```

Điều kiện đủ tiền nằm **bên trong** lệnh ghi, không phải một lệnh đọc riêng trước
đó. Hai yêu cầu chạy song song không thể cùng thấy "đủ tiền" rồi cùng trừ. Tách
thành đọc-rồi-ghi là mở đường cho tiêu âm số dư.

Xác nhận đơn hàng dùng đúng khuôn đó: `findOneAndUpdate({ code, status: 'pending' })`
trả về `null` nếu một quản trị viên khác vừa xác nhận xong.

**Chặn dò mật khẩu bằng hai khoá đếm.**
`middlewares/loginRateLimit.js` đếm theo `ip|email` *và* theo `ip` riêng. Chỉ đếm
theo `ip|email` thì kẻ tấn công đổi email là bộ đếm về 0 — thử một mật khẩu phổ
biến trên hàng nghìn tài khoản vẫn lọt.

**Cookie phiên chỉ đặt ở một nơi.**
`utils/cookieToken.js` là chỗ duy nhất đặt cookie, đã xử lý sẵn `httpOnly`,
`sameSite: 'none'` + `secure` khi chạy production và `'lax'` khi phát triển.
Đừng đặt cookie ở chỗ khác.

**Quy đổi tiền làm tròn lên.**
`Math.ceil(price / 1000)` — làm tròn **lên** để hệ thống không bao giờ thu thiếu.

---

## Triển khai

Chạy trên Vercel dưới dạng hàm serverless, project `learning-portal-s-api`.

Tính tới 07/09/2026, **Git integration chưa được nối** vào repo này, nên đẩy
`main` sẽ *không* tự deploy. Cập nhật bằng tay:

```bash
npx vercel --prod
```

### Một cái bẫy đã dính, đừng dính lại

`sanitize-html` bị **ghim ở đúng bản 2.17.0**. Bản 2.17.7 nâng phụ thuộc
`htmlparser2` từ `^8` lên `^12`, mà `htmlparser2` từ bản 10 trở đi là ESM thuần.
`utils/htmlBaiViet.js` gọi nó bằng `require()` thường, và runtime của Vercel từ
chối `require()` một module ESM — **toàn bộ hàm chết ngay lúc nạp**, mọi đường
dẫn trả 500, kể cả những đường không liên quan gì tới lọc HTML.

Lỗi này **không tái hiện được ở máy phát triển**: Node 22 trở lên cho phép
`require()` module ESM nếu module đó không có top-level await. Chạy `npm run dev`
thấy êm ru, lên production mới sập.

Ghim bằng số chính xác chứ không phải `^2.17.0`, vì chính dấu `^` đã cho 2.17.7
lọt vào.

---

## Kiểm lại các con số ở trên

```bash
# số endpoint — phải đếm cả các verb nối sau router.route(),
# grep "router.get(" không thôi sẽ ra thiếu
node -e "const fs=require('fs');let n=0;for(const f of fs.readdirSync('src/routes')){const s=fs.readFileSync('src/routes/'+f,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');n+=(s.match(/\.(get|post|put|patch|delete)\s*\(/g)||[]).length}console.log(n)"

# số model — trừ tệp *.test.js lẫn trong đó
ls src/models/*.js | grep -v '\.test\.js' | wc -l

# số test
npm test 2>&1 | grep -E '^. (tests|pass|fail)'
```
