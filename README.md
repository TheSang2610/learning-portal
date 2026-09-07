# Learning Portal

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-9-880000?logo=mongoose&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?logo=cloudinary&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

Nền tảng học trực tuyến full-stack: học viên mua và học khoá học, làm bài kiểm
tra và nhận chứng chỉ; giảng viên soạn bài; quản trị duyệt nội dung và xác nhận
thanh toán chuyển khoản. Phân quyền ba vai, ví coin nội bộ, đăng nhập Google
OAuth 2.0, phiên đăng nhập bằng cookie `httpOnly`.

**Demo:** [learning-portal-s.vercel.app](https://learning-portal-s.vercel.app)

**Tài liệu API:** [thesang2610.github.io/learning-portal](https://thesang2610.github.io/learning-portal/)

---

## Tính năng

### Học viên

- Duyệt khoá học theo danh mục, nhà cung cấp, từ khoá
- Ghi danh khoá miễn phí; khoá có phí mua bằng **ví coin** nội bộ
- Nạp coin bằng **chuyển khoản ngân hàng**, sinh mã VietQR theo từng đơn
- Học bài: video, tài liệu đính kèm, theo dõi tiến độ
- Làm **bài trắc nghiệm**, xem lại bài đã nộp, nhận **chứng chỉ** khi đạt
- Đánh giá khoá học, bình chọn đánh giá hữu ích
- Chia sẻ tài liệu (PDF/DOC/DOCX) cho học viên khác
- Blog, câu hỏi thường gặp
- Công cụ tính GPA, quy đổi thang 10 sang thang 4

### Giảng viên

- Tạo và sửa khoá học, bài học của mình
- Soạn bài trắc nghiệm, xem thống kê kết quả

### Quản trị

- Bảng điều khiển thống kê
- Duyệt và **xuất bản** khoá học (chỉ quản trị mới có quyền này)
- Quản lý người dùng, ghi danh, đánh giá, chứng chỉ
- **Xác nhận đơn chuyển khoản**, cộng coin, nhận mail báo đơn mới
- Sắp xếp trang chủ: banner, khoá nổi bật, khoá mới, đang thịnh hành
- Quản lý danh mục, nhà cung cấp, bài viết, FAQ

---

## Tech Stack

### Frontend

| | |
| --- | --- |
| Framework | Next.js 16 — App Router, Turbopack |
| UI | React 19, TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Chất lượng | ESLint, Prettier, `tsc --noEmit`, husky + lint-staged |

### Backend

| | |
| --- | --- |
| Máy chủ | Express 5 (CommonJS) |
| CSDL | MongoDB Atlas qua Mongoose 9 |
| Xác thực | JWT trong cookie `httpOnly`, Google OAuth 2.0 |
| Lưu trữ | Cloudinary (ảnh, video, tài liệu) |
| Mail | Nodemailer qua Gmail app password |
| Kiểm thử | `node:test` — 158 test |

### Hạ tầng

| | |
| --- | --- |
| Triển khai | Vercel (hai project riêng) |
| CI | GitHub Actions — hai job song song |
| Tài liệu API | Swagger UI trên GitHub Pages |

---

## Kiến trúc hệ thống

```
                    ┌──────────────────────────┐
   Trình duyệt ───► │  Next.js  (Vercel)       │
                    │  learning-portal-s       │
                    │  SSR + tĩnh hoá tại biên │
                    └───────────┬──────────────┘
                                │ fetch, credentials: include
                                ▼
                    ┌──────────────────────────┐
                    │  Express 5  (Vercel)     │   ◄── Google OAuth 2.0
                    │  learning-portal-s-api   │   ──► Gmail SMTP
                    │  serverless function     │
                    └───┬──────────────────┬───┘
                        │                  │
                        ▼                  ▼
              ┌──────────────────┐  ┌──────────────┐
              │  MongoDB Atlas   │  │  Cloudinary  │
              │  17 collection   │  │  media, tệp  │
              └──────────────────┘  └──────────────┘
```

Frontend và API nằm **khác site** (`.vercel.app` thuộc Public Suffix List), nên
cookie phiên phải là `sameSite: none`. Hệ quả: trình duyệt gửi cookie kèm cả
request từ site khác, và middleware `chongCsrf` trở thành lớp chặn CSRF **duy
nhất** — không có `sameSite` đỡ lưng.

---

## Cấu trúc dự án

```
learning-portal/
├── frontend/
│   ├── app/                 App Router — 56 trang, 4 nhóm route
│   │   ├── (portal)/        khu học viên
│   │   ├── (admin)/         khu quản trị
│   │   └── (instructor)/    khu giảng viên
│   ├── src/
│   │   ├── components/      13 nhóm giao diện
│   │   ├── services/        21 tệp gọi API, mỗi tệp một miền dữ liệu
│   │   └── hooks/
│   └── public/
│
├── backend/
│   ├── index.js
│   └── src/
│       ├── config/          kết nối CSDL, Cloudinary, mail
│       ├── controllers/     logic nghiệp vụ
│       ├── middlewares/     xác thực, CSRF, giới hạn tần suất
│       ├── models/          17 lược đồ Mongoose
│       ├── routes/          16 tệp, 135 endpoint
│       └── utils/           công cụ dùng chung + tệp *.test.js
│
├── docs/                    Swagger UI + openapi.json (GitHub Pages)
└── .github/workflows/       CI hai job
```

`docs/` **phải** ở gốc kho — GitHub Pages chỉ đọc thư mục gốc hoặc `/docs` ở
gốc, để nó trong thư mục con là trang tài liệu chết.

---

## Cài đặt và chạy

### Yêu cầu

- **Node >= 20.9** (yêu cầu tối thiểu của Next 16)
- Một cụm MongoDB (Atlas hoặc cục bộ)
- Tài khoản Cloudinary

### 1. Tải mã nguồn

```bash
git clone https://github.com/TheSang2610/learning-portal.git
cd learning-portal
```

### 2. Chạy Backend

```bash
cd backend
npm install
cp .env.example .env      # rồi điền giá trị thật
npm run dev               # http://localhost:5000
```

Biến môi trường trong `backend/.env`:

| Biến | Bắt buộc | Ý nghĩa |
| --- | --- | --- |
| `MONGO_URI` | có | Chuỗi kết nối MongoDB |
| `JWT_SECRET` | có | Khoá ký token phiên |
| `FRONTEND_ORIGINS` | có | Origin được phép gọi CORS, cách nhau dấu phẩy |
| `CLOUDINARY_URL` | có | Dạng gộp `cloudinary://key:secret@cloud` |
| `GOOGLE_CLIENT_ID` | không | Bật đăng nhập Google |
| `MAIL_USER` · `MAIL_APP_PASSWORD` · `MAIL_ADMIN` | không | Mail báo đơn chuyển khoản |
| `SO_TAI_KHOAN` · `TEN_TAI_KHOAN` · `NGAN_HANG` | không | Hiển thị ở màn hình chuyển khoản |

Kiểm tra kết nối bên ngoài:

```bash
npm run check:db          # thử kết nối MongoDB
npm run check:cloudinary  # thử tải ảnh lên
npm run check:mail        # gửi thử một mail thật
```

### 3. Chạy Frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
npm run dev               # http://localhost:3000
```

Biến `NEXT_PUBLIC_*` bị nhúng thẳng vào JavaScript gửi xuống trình duyệt —
**không đặt bí mật nào vào đó**. Chúng cũng được cố định **lúc build**, nên đổi
giá trị trên Vercel xong phải deploy lại mới có tác dụng.

---

## API Endpoints

**135 endpoint / 16 nhóm.** Tài liệu đầy đủ, bấm thử được:
[Swagger UI](https://thesang2610.github.io/learning-portal/)

| Nhóm | Số lượng | Ví dụ |
| --- | --- | --- |
| Quản trị | 23 | `GET /api/admin/dashboard/statistics` |
| Khoá học | 14 | `PUT /api/courses/:id/publish` |
| Người dùng | 12 | `POST /api/users/login` · `POST /api/users/google` |
| Trắc nghiệm | 11 | `POST /api/quizzes/:id/submit` |
| Ghi danh | 10 | `PUT /api/enrollments/:id/progress` |
| Chứng chỉ | 9 | `GET /api/certificates/verify/:code` |
| Đánh giá | 9 | `POST /api/reviews/:id/helpful` |
| Bài viết | 8 | `GET /api/posts/:slug` |
| Ví coin | 5 | `GET /api/coins/lich-su` |
| Đơn hàng | 5 | `PUT /api/admin/orders/:code/confirm` |
| Tài liệu · Bài học · FAQ · Nhà cung cấp | 20 | |
| Banner · Danh mục | 8 | |

Ba lớp bảo vệ trong `middlewares/authMiddleware.js`:

| | Cho qua ai |
| --- | --- |
| `protect` | đã đăng nhập (đọc token từ cookie `httpOnly`) |
| `instructor` | **giảng viên và quản trị** |
| `admin` | chỉ quản trị |

---

## Vài quyết định kỹ thuật đáng chú ý

Ghi lại những chỗ nhìn qua tưởng làm phức tạp thừa, nhưng bỏ đi là mở lại một lỗ
hổng đã từng có thật.

**Nội dung có phí đi qua đúng một cửa.** `backend/src/utils/quyenNoiDung.js`
xuất ra `duocXemNoiDung(course, user)`, và mọi đường trả nội dung bài học đều
phải gọi nó. Trước đây cổng 402 chỉ đặt ở đường ghi danh, đường đọc bài không
kiểm gì — mở một tài khoản miễn phí rồi gọi thẳng `GET /api/lessons/:id` là lấy
được video của khoá có phí.

**Trừ tiền bằng một lệnh ghi duy nhất.** Điều kiện đủ tiền nằm **bên trong**
lệnh `findOneAndUpdate`, không phải một lệnh đọc riêng trước đó. Hai yêu cầu
chạy song song không thể cùng thấy "đủ tiền" rồi cùng trừ. Xác nhận đơn hàng
dùng đúng khuôn đó — truy vấn kèm trạng thái đang chờ sẽ trả về rỗng nếu một
quản trị viên khác vừa xác nhận xong.

**Chặn dò mật khẩu bằng hai khoá đếm.** `loginRateLimit` đếm theo cặp IP và
email, _và_ theo IP riêng. Chỉ đếm theo cặp thì kẻ tấn công đổi email là bộ đếm
về 0 — thử một mật khẩu phổ biến trên hàng nghìn tài khoản vẫn lọt.

**Lọc HTML theo dấu hiệu, không theo hình dạng.** Bộ lọc từng chỉ chạy khi chuỗi
trông giống bài viết, mà danh sách nhận diện không có thẻ `script` — nên nội
dung chỉ gồm một thẻ script bị xếp là văn bản thường và lưu nguyên vẹn. Giờ nó
lọc khi thấy dấu hiệu nguy hiểm, bất kể chuỗi trông giống gì.

**Quy đổi tiền làm tròn lên.** `Math.ceil(price / 1000)` — để hệ thống không bao
giờ thu thiếu.

---

## Kiểm thử và CI

```bash
cd frontend && npm run verify    # format + lint + typecheck + build
cd backend  && npm test          # 158 test
```

CI chạy đúng hai lệnh đó, tách thành **hai job song song** — frontend hỏng thì
vẫn biết backend còn xanh hay không.

Test của backend là **hàm thuần**: không mở kết nối CSDL, không gọi Cloudinary.
CI không có secret nào, và `MONGO_URI` trỏ tới cụm dữ liệu thật đang chạy. CI
còn chạy `node --check` trên mọi tệp `.js` — backend chưa có linter nên đó là
lưới an toàn duy nhất bắt lỗi cú pháp ở tệp không test nào chạm tới.

---

## Triển khai

Hai project Vercel riêng, mỗi cái build một thư mục:

| Thư mục | Project | Địa chỉ |
| --- | --- | --- |
| `frontend/` | `learning-portal-s` | learning-portal-s.vercel.app |
| `backend/` | `learning-portal-s-api` | learning-portal-backend-ten.vercel.app |

Hiện deploy bằng tay, chạy `npx vercel --prod` **trong đúng thư mục con**. Khi
nối Git integration thì mỗi project phải đặt **Root Directory** trỏ vào thư mục
con của nó — bỏ bước đó thì Vercel build từ gốc và không thấy `package.json` nào.

> **Không bao giờ commit tệp `.env`.** Kho này chỉ chứa `.env.example` với giá
> trị mẫu. Mật khẩu máy chủ, chuỗi kết nối CSDL, khoá SMTP không được đặt trong
> README hay bất kỳ tệp nào được commit — kho công khai thì cả thế giới đọc
> được, và xoá đi cũng không cứu được vì lịch sử Git vẫn giữ lại.

---

## Tác giả

**Nguyễn Thế Sang** — [github.com/TheSang2610](https://github.com/TheSang2610)

Toàn bộ frontend và backend.
