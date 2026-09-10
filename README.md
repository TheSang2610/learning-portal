# aLMS — Nền tảng học trực tuyến

Portal học viên, trang quản trị, trang giảng viên và bộ công cụ tính điểm GPA.
Frontend Next.js, backend Express + MongoDB, hai phần chạy độc lập.

| Đo được                    | Số liệu                                     |
| -------------------------- | ------------------------------------------- |
| Trang (`page.tsx`)         | 53, chia 3 route group                      |
| Endpoint API               | 121, trong 14 nhóm route                    |
| Model Mongoose             | 15                                          |
| Dòng mã frontend (ts/tsx)  | ~25.170, trong 121 file                     |
| Dòng mã backend (js)       | ~8.840, trong 70 file                       |

---

## Mục lục

| #   | Mục                                                     | Đọc khi                          |
| --- | ------------------------------------------------------- | -------------------------------- |
| 0   | [Tài liệu này đáng tin tới đâu](#0-tài-liệu-này-đáng-tin-tới-đâu) | **Đọc đầu tiên**        |
| 1   | [Công nghệ](#1-công-nghệ)                               | Lần đầu vào dự án                |
| 2   | [Chạy dự án](#2-chạy-dự-án)                             | Lần đầu vào dự án                |
| 3   | [Bản đồ mã nguồn](#3-bản-đồ-mã-nguồn)                   | Tìm chỗ đặt file                 |
| 4   | [Kiến trúc frontend](#4-kiến-trúc-frontend)             | **Bắt buộc, trước khi code FE**  |
| 5   | [Kiến trúc backend](#5-kiến-trúc-backend)               | **Bắt buộc, trước khi code BE**  |
| 6   | [Xác thực & phân quyền](#6-xác-thực--phân-quyền)        | **Bắt buộc, khi thêm endpoint**  |
| 7   | [Danh sách API](#7-danh-sách-api)                       | Nối frontend với backend         |
| 8   | [Ảnh](#8-ảnh)                                           | Hiển thị bất kỳ ảnh nào          |
| 9   | [Styling](#9-styling)                                   | Viết class                       |
| 10  | [Chất lượng mã](#10-chất-lượng-mã)                      | **Bắt buộc, trước khi commit**   |
| 11  | [Quy ước đặt tên](#11-quy-ước-đặt-tên)                  | Tạo file mới                     |
| 12  | [Công thức](#12-công-thức)                              | Thêm trang / endpoint / ảnh      |
| 13  | [Git & PR](#13-git--pr)                                 | **Bắt buộc, trước khi commit**   |
| 14  | [Nợ kỹ thuật](#14-nợ-kỹ-thuật)                          | Tìm việc để làm                  |

---

## 0. Tài liệu này đáng tin tới đâu

README chết là README nói sai về mã nguồn. Nên mỗi khẳng định dưới đây đều ghi rõ
nó đến từ đâu:

| Ký hiệu | Nghĩa                          | Kiểm lại bằng cách                        |
| ------- | ------------------------------ | ----------------------------------------- |
| **[Đ]** | **Đo** từ mã nguồn             | Chạy lệnh ghi kèm — ra số khác là README cũ |
| **[M]** | **Máy** bắt được               | `npm run verify` sẽ đỏ nếu vi phạm         |
| **[N]** | **Người** phải tự giữ          | Không công cụ nào bắt — chỉ có review      |

Điều quan trọng nhất: **[N] là phần dễ mục nhất.** Khi sửa mã mà thấy README nói
khác thực tế, sửa README ngay trong cùng PR đó.

Ba con số cần biết trước, vì chúng chặn CI:

```bash
cd frontend
npm run lint         # phải 0 lỗi VÀ 0 cảnh báo
npm run typecheck    # phải sạch
npm run format:check # phải xanh
```

Cả bốn bước của `npm run verify` hiện đều xanh. Trước đây `format:check` đỏ nên
CI hỏng ngay bước đầu và ba bước sau chưa từng chạy — xem mục 14 (P4).

---

## 1. Công nghệ

### Frontend — `frontend/`

| Thành phần | Phiên bản | Ghi chú                                              |
| ---------- | --------- | ---------------------------------------------------- |
| Next.js    | 16.2.5    | App Router + Turbopack. **Yêu cầu Node >= 20.9**      |
| React      | 19.2.4    | Có React Compiler → sinh thêm rule lint mới           |
| TypeScript | 5.x       | `strict: true`                                        |
| Tailwind   | v4        | Khai báo trong `app/globals.css`, **không có file config** |
| lucide-react | 1.16    | Icon                                                  |
| recharts   | 3.10      | Biểu đồ (thống kê admin, heatmap hoạt động)           |
| hls.js     | 1.6       | Phát video bài học                                    |

### Backend — `backend/`

| Thành phần | Phiên bản | Ghi chú                          |
| ---------- | --------- | -------------------------------- |
| Express    | 5.2       | ESM chưa dùng — toàn bộ là CommonJS |
| Mongoose   | 9.6       | MongoDB                          |
| jsonwebtoken | 9.0     | JWT trong header `Authorization` |
| bcryptjs   | 3.0       | Băm mật khẩu                     |
| multer     | 2.1       | Nhận file, lưu vào bộ nhớ        |
| compression | 1.8      | Nén phản hồi — xem mục 5.5       |
| cloudinary | 2.10      | Nơi chứa ảnh/video thật          |
| google-auth-library | 10.6 | Đăng nhập Google              |

> **[Đ]** `cat frontend/package.json backend/package.json`

**Không dùng:** state manager (Redux/Zustand), thư viện fetch (React Query/SWR),
thư viện form, thư viện test. Cần thêm thì bàn trước — mỗi thư viện mới là một
thứ người sau phải học.

---

## 2. Chạy dự án

### Yêu cầu

Node **>= 20.9** (Next 16 bắt buộc), MongoDB (Atlas hoặc cài máy).

### Backend trước

```bash
cd backend
npm install
cp .env.example .env     # rồi sửa lại
npm run dev              # nodemon → http://localhost:5000
```

Biến môi trường backend thực sự đọc trong mã:

| Biến                    | Bắt buộc | Có trong `.env.example`? | Thiếu thì hỏng gì            |
| ----------------------- | -------- | ------------------------ | ---------------------------- |
| `MONGO_URI`             | ✅       | ✅                       | Không chạy được              |
| `JWT_SECRET`            | ✅       | ✅                       | Không đăng nhập được         |
| `PORT`                  | –        | ✅                       | Mặc định 5000                |
| `NODE_ENV`              | –        | ✅                       | Mặc định development         |
| `CLOUDINARY_CLOUD_NAME` | –        | ✅                       | Mọi upload trả 503           |
| `CLOUDINARY_API_KEY`    | –        | ✅                       | Mọi upload trả 503           |
| `CLOUDINARY_API_SECRET` | –        | ✅                       | Mọi upload trả 503           |
| `GOOGLE_CLIENT_ID`      | –        | ✅                       | Riêng đăng nhập Google hỏng  |

> **[Đ]** `grep -rho "process\.env\.[A-Z_]*" backend/index.js backend/src/ | sort -u`

Bốn biến cuối để trống vẫn chạy được toàn bộ phần còn lại. Thiếu `CLOUDINARY_*`
thì các đường tải file lên trả **503 kèm thông báo nói rõ biến nào thiếu**, chứ
không im lặng hỏng.

Lấy khóa Cloudinary: đăng ký ở [cloudinary.com](https://cloudinary.com) (gói miễn
phí đủ dùng), vào **Settings → API Keys**. Trang đó in sẵn một dòng gộp cả ba giá
trị — copy nguyên dòng là xong, khỏi ghép tay:

```
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

Hoặc điền rời ba biến `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET`. Mã
nhận cả hai cách, ưu tiên `CLOUDINARY_URL`. Dán vào `backend/.env` rồi:

```bash
cd backend
npm run check:cloudinary   # nói thẳng khóa đúng hay sai, sai ở đâu
```

⚠️ **Cái bẫy đã dính một lần:** tài khoản Cloudinary mới **mặc định chặn giao file
PDF và ZIP**. File vẫn tải lên bình thường, chỉ khi người dùng bấm Tải về mới nhận
**401** — nên rất lâu mới phát hiện. Ảnh thì không bị, chỉ PDF/ZIP.

Sửa: Cloudinary Console → **Settings → Security** → bỏ dấu tích *Block delivery of
PDF and ZIP files*.

`npm run check:cloudinary` tự đẩy thử một PDF tí hon lên rồi gọi lại đúng đường dẫn
công khai để dò đúng cái này, và **thoát mã 1 nếu còn bị chặn** — trang chia sẻ tài
liệu sẽ hỏng nếu bỏ qua.

⚠️ **nodemon không theo dõi `.env`** — sửa file này xong phải Ctrl+C rồi
`npm run dev` lại, vì `dotenv` chỉ đọc một lần lúc khởi động. Deploy lên Vercel
thì phải khai lại ba biến đó trong Project Settings → Environment Variables,
`.env` không được đẩy lên git.

`JWT_SECRET` phải là chuỗi ngẫu nhiên dài. Ai biết secret là tự ký được token
admin, khi đó mọi `protect`/`admin` ở mục 6 trở thành vô nghĩa.

### Frontend sau

```bash
cd frontend
npm install
npm run dev              # → http://localhost:3000
```

`frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Chấp nhận cả `NEXT_PUBLIC_BACKEND_URL`; có `/api` ở cuối hay không đều được —
`apiHelper.ts` tự chuẩn hoá.

> ⚠️ `NEXT_PUBLIC_` nghĩa là **giá trị được nhúng thẳng vào JS gửi xuống trình
> duyệt.** Không bao giờ đặt khoá bí mật với tiền tố này.

Danh sách đầy đủ các biến frontend nằm trong `frontend/.env.example` — chép
thành `.env.local` rồi điền. Ngoài `NEXT_PUBLIC_API_URL` bắt buộc, còn bốn biến
cho nút đăng nhập Google (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`GOOGLE_ORIGIN`, `GOOGLE_REDIRECT_URI`) — bỏ trống thì `/api/auth/google` trả
500 kèm thông báo rõ, các cách đăng nhập còn lại vẫn chạy.

`.gitignore` của frontend dùng `.env*` nên trước đây nó chặn luôn cả file mẫu.
Đã thêm `!.env.example` — file mẫu **phải** được commit, không thì người mới
clone về không biết dự án cần biến nào.

CORS lúc dev tự chấp nhận mọi cổng `localhost`, nên Next nhảy sang 3001/3002 khi
3000 bận cũng không sao.

---

### Hoặc chạy bằng Docker

Hai `Dockerfile` là bản **production**, không phải bản để ngồi viết mã: không có
nodemon, không có hot reload, sửa file phải build lại. Muốn vừa viết vừa xem thì
dùng hai lệnh `npm run dev` ở trên.

```bash
# Backend — biến môi trường truyền lúc CHẠY
docker build -t alms-backend ./backend
docker run --rm -p 5000:5000 --env-file backend/.env alms-backend
```

`--env-file` là bắt buộc. Trước đây `.env` bị `COPY . .` nướng thẳng vào image,
ai kéo được image về là đọc được mật khẩu Mongo — và xoá ở lớp sau cũng không cứu
được vì mọi lớp còn nguyên trong `docker history`. Nay `.dockerignore` chặn nó
lại, nên image không còn tự biết mật khẩu nữa.

```bash
# Frontend — địa chỉ API phải có mặt lúc BUILD
docker build -t alms-frontend \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:5000/api ./frontend
docker run --rm -p 3000:3000 alms-frontend
```

Chỗ khác nhau giữa hai bên nằm ở đó: Next nhét mọi biến `NEXT_PUBLIC_*` thẳng
vào mã JavaScript lúc build chứ không đọc lúc chạy. Nên đổi địa chỉ API bên
frontend là phải **build lại image**, `--env-file` không có tác dụng gì.

---

## 3. Bản đồ mã nguồn

> Đây là mô tả **cây thư mục đang có thật**, không phải cây lý tưởng. Đừng dời
> file hàng loạt để cho "đúng chuẩn" — việc đó tạo diff khổng lồ mà không sửa
> được lỗi nào.

```
aLMS_Project/
├── backend/
│   ├── index.js               # app Express, CORS, gắn route, middleware lỗi
│   ├── .env.example
│   └── src/
│       ├── config/            # db.js (kết nối Mongo), cloudinary.js
│       ├── models/            # 13 schema Mongoose
│       ├── routes/            # 12 file, chỉ khai đường dẫn + middleware
│       ├── controllers/       # 13 file, toàn bộ logic nằm đây
│       ├── middlewares/       # authMiddleware.js, loginRateLimit.js
│       └── utils/             # uploadCloud.js (multer + Cloudinary)
│
└── frontend/
    ├── image-hosts.ts         # danh sách host ảnh — DÙNG CHUNG, xem mục 8
    ├── next.config.ts         # sinh remotePatterns từ image-hosts.ts
    ├── eslint.config.mjs      # phân loại rule, xem mục 10
    ├── app/
    │   ├── globals.css        # token Tailwind v4 (@theme)
    │   ├── api/auth/google/   # route handler cho OAuth Google
    │   ├── (portal)/          # 18 trang công khai + khu người dùng
    │   ├── (admin)/           # 25 trang quản trị
    │   └── (instructor)/      # 10 trang giảng viên
    └── src/
        ├── services/          # 14 file, TOÀN BỘ lời gọi API nằm đây
        └── components/
            ├── ui/            # Button, Card, Input, SafeImage
            ├── common/        # FeedCard, ArticleWithOutline, CardActions...
            ├── layout/        # Header, Footer, TopNav + headers/
            ├── home/          # 8 section trang chủ
            ├── gpa/           # 9 file — bộ tính điểm
            ├── quiz/ auth/ profile/ settings/ certificate/
            └── ...
```

**Ba thư mục nhiều người sửa nhất:**

| Muốn làm gì               | Vào đâu                                    |
| ------------------------- | ------------------------------------------ |
| Thêm/sửa một màn hình     | `frontend/app/(nhóm)/…/page.tsx`           |
| Thêm/sửa lời gọi API      | `frontend/src/services/`                   |
| Thêm/sửa logic nghiệp vụ  | `backend/src/controllers/`                 |

---

## 4. Kiến trúc frontend

### 4.1. Ba route group, bốn layout, không có layout gốc

```
app/(portal)/layout.tsx              → <html> + Header + Footer
app/(admin)/layout.tsx               → <html>
app/(admin)/admin/layout.tsx         → khung sidebar admin ("use client")
app/(instructor)/instructor/layout.tsx → <html> + khung giảng viên
```

**Không có `app/layout.tsx`.** Mỗi group tự dựng thẻ `<html>` của mình. Đây là
kiểu "nhiều root layout" của App Router: đổi group là trình duyệt tải lại trang,
không phải điều hướng phía client.

Hệ quả cần nhớ: **thêm cái gì dùng chung cho toàn site thì phải sửa cả ba layout**,
không có một chỗ duy nhất.

> **[Đ]** `find frontend/app -name layout.tsx`

### 4.2. Header đổi theo đường dẫn

`Header.tsx` chọn header con dựa vào `usePathname()`:

| Đường dẫn bắt đầu bằng           | Header               |
| -------------------------------- | -------------------- |
| `/blog`                          | `BlogHeader`         |
| `/share-document`                | `ShareDocumentHeader`|
| các route GPA (`GPA_ROUTES`)     | `GpaHeader`          |
| còn lại                          | `IndividualsHeader`  |

Thêm một khu vực có header riêng thì thêm nhánh ở đây, **đừng** dựng layout mới.

`Header` gọi `useSearchParams()` nên `(portal)/layout.tsx` bọc nó trong
`<Suspense>`. Bỏ Suspense đi là **toàn bộ trang portal mất khả năng prerender
tĩnh** — mỗi lượt xem tốn một lần chạy serverless. Đừng gỡ.

### 4.3. Tầng services — mọi lời gọi API đi qua đây

**[N] Component không được tự `fetch`.** Mọi lời gọi mạng nằm trong
`src/services/`, và mọi service đi qua `apiHelper.ts`.

`apiHelper.ts` làm sẵn bốn việc, viết `fetch` tay là mất cả bốn:

1. **Tự gắn token** từ `localStorage.authToken` vào header `Authorization`
2. **Gộp request GET trùng nhau** — trang chủ từng gọi `getCategories()` 4 lần
   (Header, Footer, CategoriesSection, CourseSection); nay 4 lời gọi chung một
   `fetch`, và kết quả được giữ 30 giây
3. **Xoá cache khi ghi** — mọi POST/PUT/DELETE xoá sạch cache, nên danh sách
   không bao giờ hiện dữ liệu cũ sau khi sửa. Kèm một **số thế hệ**: request GET
   bắt đầu *trước* lần xoá đó, khi về sẽ mang dữ liệu cũ và bị bỏ đi thay vì ghi
   đè lên cache vừa dọn sạch (xem 4.3b)
4. **Tự đăng xuất khi 401** hoặc khi backend báo tài khoản bị khoá

Lưu ý khi gửi file: cứ truyền thẳng `FormData` vào `body`, `apiHelper` tự gỡ
header `Content-Type` để trình duyệt tự sinh boundary. Tự đặt `Content-Type` là
hỏng upload.

#### 4.3b. Cuộc đua giữa bộ đệm và lệnh ghi

Bộ đệm GET sống 30 giây, và mọi POST/PUT/DELETE gọi `clearApiCache()` để danh
sách không hiện dữ liệu cũ. Nhưng bản đầu có một lỗ:

```
GET /courses bắt đầu  ──────────────► (đang bay)
                người dùng bấm Xoá ──► DELETE → clearApiCache()
GET cũ về, mang danh sách CŨ  ──────► ghi đè lên cache vừa dọn
```

Kết quả đúng bằng cái mà việc dọn cache sinh ra để tránh: **khoá học đã xoá còn
hiện thêm 30 giây nữa**.

Đã tái hiện bằng một bản mô phỏng chép nguyên logic đó:

```
TRƯỚC:  máy chủ có "Khoa A"  |  người dùng thấy "Khoa A, Khoa B"   => SAI
SAU :   máy chủ có "Khoa A"  |  người dùng thấy "Khoa A"           => ĐÚNG
```

Cách sửa là một số đếm: `clearApiCache()` tăng `theHe` lên một, mỗi request nhớ
`theHe` lúc bắt đầu, và chỉ ghi vào cache nếu lúc về hai số vẫn bằng nhau. Dữ
liệu vẫn trả cho người gọi — chỉ là không được đệm lại.

Cùng chỗ đó thêm một chặn trên 100 mục: bộ đệm chỉ sống 30 giây nhưng **không ai
dọn các mục hết hạn**, nên `Map` cứ phình ra suốt phiên làm việc.

**[N] Địa chỉ backend chỉ khai ở `services/diaChiApi.ts`.** Đừng đọc
`process.env.NEXT_PUBLIC_API_URL` ở chỗ khác. Trước đây ba file tự đọc, và
`api.ts` (đăng nhập/đăng ký) xếp thứ tự ưu tiên **ngược** với hai file kia:

| File | Ưu tiên |
| --- | --- |
| `apiHelper.ts`, `serverFetch.ts` | `NEXT_PUBLIC_API_URL` → `NEXT_PUBLIC_BACKEND_URL` |
| `api.ts` | `NEXT_PUBLIC_BACKEND_URL` → `NEXT_PUBLIC_API_URL` |

Đặt cả hai biến về hai máy khác nhau là đăng nhập đi một nơi còn mọi lời gọi
còn lại đi nơi khác — triệu chứng thì rất khó đoán: đăng nhập thành công nhưng
vào trang nào cũng trống. Hiện chỉ đặt `NEXT_PUBLIC_API_URL` nên chưa ai vấp,
nhưng cái bẫy đã đặt sẵn ở đó. Nay cả ba dùng chung `GOC_API`.

**[N] Kiểu trả về khai ở service, không khai lại trong trang.** `apiRequest` trả
`any` — đó là ranh giới kiểu duy nhất của cả tầng này. Mỗi hàm bọc phải tự khai
`Promise<T>` đúng theo `res.json(...)` của controller tương ứng. Trang nào tự
khai lại một bản `interface Enrollment` riêng thì sớm muộn cũng lệch với backend;
đã gom hết về service rồi.

**[N] Ba trường có nhiều hình dạng, phải đọc qua hàm dùng chung** (trong
`services/course.ts`):

| Trường | Đọc bằng | Vì sao |
| --- | --- | --- |
| `course.category` | `layIdChuDe()` / `tenChuDe()` | Là **mảng**, và tuỳ endpoint mà là id, object đã populate, hay `{ $oid }` |
| `course.instructor` | `tenGiangVien()` | Chuỗi ObjectId khi không populate |
| `lessonProgress.lesson` | `layIdBaiHoc()` (trong `learn/page.tsx`) | Chuỗi hoặc object tuỳ endpoint |

Đọc thẳng `.name` hay `._id` trên chúng là cách bộ lọc theo chủ đề ở `/courses`
từng im lặng trả về rỗng — xem mục 4.6.

### 4.4. Trang chủ và /courses dựng sẵn ở máy chủ

Cả hai từng là `"use client"` và tự gọi API sau khi trình duyệt tải xong JS —
người dùng nhìn khung xám, máy tìm kiếm không đọc được gì.

Nay `page.tsx` của hai trang là **Server Component**: lấy hết dữ liệu một lần,
song song, rồi truyền xuống qua `initialData`. Kết quả build:

```
┌ ○ /            1m   1y
├ ○ /courses     1m   1y
```

`○` là dựng sẵn tĩnh — trên Vercel phục vụ thẳng từ CDN, không đánh thức hàm
serverless mỗi lượt xem. HTML trang chủ đi từ 49KB (toàn khung xám) lên 150KB
(có nội dung thật).

Ba quy tắc khi sửa mấy trang này:

1. **Rỗng thì truyền `null`, đừng truyền `[]`.** Các section coi "có
   `initialData`" là tín hiệu thôi gọi API. Máy chủ lấy hụt mà vẫn truyền `[]`
   thì trang hiện mục trống và không bao giờ thử lại.
2. **Hàm dùng chung phải nằm ngoài module `"use client"`.** `locKhoaHoc.ts`
   tách riêng vì lý do đó — gọi hàm xuất từ module client trong Server
   Component sẽ ném *"Attempted to call ... from the server"*.
3. **`useSearchParams()` phải nằm trong `<Suspense>`**, nếu không cả trang mất
   khả năng dựng tĩnh. Ô đăng nhập tách thành `AuthModalGate` vì lý do này.

---

### 4.5. Xử lý lỗi

Dùng `getErrorMessage(err)` trong `apiHelper.ts`, đừng đọc `err.message` trực
tiếp. Ở chế độ `strict`, biến trong `catch` có kiểu `unknown` — `err.message`
không biên dịch được, và backend có khi trả lỗi ở `err.response.data.message`.
`getErrorMessage` thử lần lượt các dạng đó rồi mới rơi về câu mặc định.

---

### 4.6. Mười đoạn mã chết mà việc gõ kiểu lôi ra

Khi dọn `any` (mục 14, P4), việc sửa kiểu cho khớp với model backend làm lộ ra
một loạt đoạn **đọc trường không hề tồn tại**. Chúng không ném lỗi: JavaScript
trả `undefined` rồi rơi xuống nhánh dự phòng, nên nhìn bề ngoài trang vẫn chạy.

Ghi lại đây vì đây là **kiểu lỗi mà `any` sinh ra**, không phải chuyện vặt về
phong cách viết:

| Chỗ | Đọc gì | Hệ quả |
| --- | --- | --- |
| `learn/page.tsx` | `enrollData.currentLessonId` | Model `Enrollment` không có trường này → **"học tiếp từ chỗ đang dở" chưa bao giờ chạy**, luôn rơi về bài đầu |
| `learn/page.tsx` | `newStats.completedCount` | Tên thật là `completedLessons` → vế phải của điều kiện hoàn thành khoá luôn sai |
| `learn/page.tsx` | `progress.completedCount` | Cùng lỗi, ở ô đếm "Bài đã xong" trên thanh tiêu đề |
| `learn/page.tsx` | `activeLesson.description` | Model `Lesson` không có → câu mô tả dự phòng mới là thứ hiện ra bấy lâu |
| `learn/page.tsx` | `data.response.status` (hls.js) | Trường thật tên là `code` → thông báo lỗi video không bao giờ kèm mã HTTP |
| `course/page.tsx` | `progressData.totalProgress` | Tên thật là `progressPercentage` → **kết quả `getProgressStats` bị vứt đi**, lượt gọi API đó vô ích |
| `CourseSection.tsx` | `course._id?.$oid` | `_id` là chuỗi → nhánh này chưa từng chạy |
| `CertificateModal.tsx` | `certificate.student.fullname` | Controller chỉ populate `name email` → không bao giờ có |
| `CertificateModal.tsx` | props `courseTitle`, `instructorName` | Khai trong interface nhưng component không hề đọc — nó tự lấy từ bản ghi chứng chỉ |
| 4 trang lessons/quiz | `(courseResponse)?.data \|\| ?.course` | `GET /courses/:id` trả thẳng bản ghi, không bọc → hai nhánh dự phòng là mã chết |

Cả mười chỗ đều đã sửa hoặc bỏ. Chỗ nào bỏ thì **hành vi nhìn thấy không đổi**,
vì nhánh đó vốn không chạy; chỗ nào sửa tên trường thì ghi chú ngay tại dòng đó.

Bài học rút ra: `any` không chỉ làm mất gợi ý của trình soạn thảo. Nó làm **lỗi
gõ nhầm tên trường trở nên vô hình**, và một tính năng như "học tiếp từ chỗ đang
dở" có thể chết lặng lẽ suốt nhiều tháng mà không ai biết.

---

## 5. Kiến trúc backend

### 5.1. Ba tầng

```
index.js  →  routes/  →  controllers/  →  models/
             │           │                │
             │           │                └─ schema Mongoose, không có logic
             │           └─ TOÀN BỘ logic: kiểm tra, truy vấn, trả response
             └─ CHỈ khai đường dẫn + middleware. Không có logic.
```

**[N] Quy tắc:** file trong `routes/` chỉ được chứa `router.<method>(path,
...middleware, controller)`. Thấy `if` hay truy vấn Mongo trong `routes/` là
đặt sai chỗ.

### 5.2. Mười bốn nhóm route

| File                   | Gắn tại              | Endpoint |
| ---------------------- | -------------------- | -------- |
| `adminRoutes.js`       | `/api/admin`         | 19       |
| `courseRoutes.js`      | `/api/courses`       | 14       |
| `userRoutes.js`        | `/api/users`         | 13       |
| `quizRoutes.js`        | `/api/quizzes`       | 11       |
| `enrollmentRoutes.js`  | `/api/enrollments`   | 10       |
| `reviewRoutes.js`      | `/api/reviews`       | 9        |
| `certificateRoutes.js` | `/api/certificates`  | 9        |
| `postRoutes.js`        | `/api/posts`         | 8        |
| `lessonRoutes.js`      | `/api/lessons`       | 5        |
| `providerRoutes.js`    | `/api/providers`     | 5        |
| `faqRoutes.js`         | `/api/faqs`          | 5        |
| `documentRoutes.js`    | `/api/documents`     | 5        |
| `bannerRoutes.js`      | `/api/banners`       | 4        |
| `categoryRoutes.js`    | `/api/categories`    | 4        |

### 5.3. Middleware lỗi

`index.js` có ba lớp, xếp theo thứ tự request đi qua:

| Lớp | Việc |
| --- | --- |
| Che lỗi 5xx | Bọc `res.json` lại, thay `message` của mọi phản hồi `>= 500` |
| Middleware 404 | Không route nào khớp → dựng `Error` rồi đẩy xuống lớp cuối |
| Middleware lỗi tập trung | Bắt mọi thứ `throw` ra hoặc `next(err)` |

**Vì sao cần lớp che.** 109 chỗ trong các controller tự bắt lỗi rồi trả thẳng
`res.status(500).json({ message: error.message })`. Câu đó không phải mình viết
cho người dùng mà là câu chữ của Mongoose hoặc của driver Mongo — có khi kèm tên
bảng, tên trường. Ví dụ gọi `/api/courses/khong-phai-id` trước đây trả về:

```
Cast to ObjectId failed for value "khong-phai-id" (type string) at path "_id" for model "Course"
```

Sửa cả 109 chỗ thì vừa nhiều vừa dễ sót về sau, nên chặn ở đúng một nơi. Nay câu
đó ra log máy chủ, còn người gọi API chỉ nhận `Đã có lỗi xảy ra, vui lòng thử lại sau`.

**Lỗi 4xx giữ nguyên**, vì đó là câu mình chủ động viết để báo cho người dùng
("Email đã tồn tại", "Không tìm thấy khóa học") — che đi thì giao diện hết đường
giải thích.

**Điều kiện là `=== 'development'`, không phải `!== 'production'`.** Nghe thì
giống nhau nhưng ngược hẳn về hướng lỗi: vế cũ nghĩa là quên đặt biến môi trường
lúc deploy thì stack trace ra thẳng cho khách xem. Vế mới thì quên biến là mặc
định im lặng — lệch về phía an toàn. Đổi lại, ai chạy máy chủ ở máy mình mà muốn
thấy lỗi thật thì phải có `NODE_ENV=development` trong `.env` (đã có sẵn).

Kiểm nhanh bằng hai lệnh, cổng 5099 để không đụng máy chủ đang chạy:

```bash
NODE_ENV=production  PORT=5099 node index.js   # -> "Đã có lỗi xảy ra..."
NODE_ENV=development PORT=5099 node index.js   # -> "Cast to ObjectId failed..."
# rồi: curl http://127.0.0.1:5099/api/courses/khong-phai-id
```

---

### 5.4. Bộ lọc nội dung

`src/utils/contentFilter.js` chặn bài đăng có nội dung chửi thề, kỳ thị chủng
tộc, hoặc kích động gây hấn. Dùng cho cả trang chia sẻ tài liệu (`POST /api/documents`, chạy **trước** khi file
được đẩy lên Cloudinary) và trang bài viết (`POST /api/posts`, kiểm cả tiêu đề,
mô tả ngắn lẫn nội dung).

**Cái bẫy lớn nhất — đừng bỏ dấu tiếng Việt rồi mới so khớp.** Bỏ dấu thì:

| Từ tục | Bỏ dấu | Trùng với từ thông dụng |
| --- | --- | --- |
| cặc | `cac` | **các** bạn, **các** môn |
| lồn | `lon` | **lớn** hơn |
| buồi | `buoi` | **buổi** học |
| đéo | `deo` | **đeo** kính |

Nên bộ lọc chia ba đường: từ tiếng Việt so khớp trên bản **còn nguyên dấu**, từ
tiếng Anh trên bản bỏ dấu, và một danh sách **cụm nhiều chữ** cho người gõ không
dấu (`"thang cho nay"`, `"vao chui no"`) — cụm dài thì không đụng câu bình thường.
Mọi lần so khớp đều đòi ranh giới từ, không bao giờ dùng `indexOf` trần.

Vài từ đã **cố ý bị loại** vì chặn nhầm tài liệu thật:

| Loại bỏ | Vì trùng với |
| --- | --- |
| `vl` | "Đề thi **VL** chương 3" (Vật Lý) |
| `dm` | "1 m = 10 **dm**" (đề-xi-mét) |
| `khủng bố`, `phá hoại` | "chủ nghĩa **khủng bố**", "mã độc **phá hoại** dữ liệu" |
| `diệt chủng` | "nạn **diệt chủng** ở Campuchia" |
| `retarded` | "**retarded** potential" (thuật ngữ điện từ học) |

> **[M]** `cd backend && npm run test:filter`
>
> **Sửa danh sách từ thì phải thêm câu vào bài kiểm tra rồi chạy lại.** Chặn
> nhầm một bài giảng hợp lệ tệ hơn lọt một câu chửi: câu chửi còn xóa được, còn
> người bị chặn oan thì bỏ đi luôn.

---

### 5.5. Ba thứ giữ cho API nhẹ

Cả ba đều đo được, số dưới đây lấy từ máy chủ đang chạy chứ không phải ước lượng.

**Nén phản hồi** — `app.use(compression())` trong `index.js`.

| Đường | Không nén | Nén |
| --- | ---: | ---: |
| `/api/courses` | 8.845 | 2.167 |
| `/api/courses/home-sections` | 9.675 | 1.908 |
| `/api/documents?limit=12` | 9.550 | 4.016 |
| `/api/posts?limit=10` | 3.315 | 1.456 |

`/api/categories` (622 byte) **không** được nén — dưới ngưỡng 1KB mặc định, nén
gói nhỏ tốn nhiều hơn được. Đó là hành vi đúng, đừng "sửa".

**Cache-Control** — `src/middlewares/cacheControl.js`, gắn tay cho từng đường.

Chỉ gắn được khi **cả hai** điều sau đúng, phải kiểm tay từng hàm trước khi gắn:

1. Phản hồi không phụ thuộc `req.user`, nếu không người này nhận được dữ liệu
   của người kia từ bộ đệm chung.
2. Hàm không có tác dụng phụ. Đây là lý do `GET /api/posts/:slug`
   **không** được gắn: nó đếm lượt xem, đệm trả bản lưu sẵn thì lượt xem đứng yên.

`max-age=0` nên trình duyệt luôn hỏi lại, và nhờ ETag sẵn có của Express lần hỏi
đó trả **304 rỗng** thay vì cả gói JSON. `s-maxage` mới là phần ăn tiền: CDN giữ
bản sao, lượt xem thứ hai trở đi không đánh thức hàm serverless.

Đang gắn: `/api/courses`, `/api/courses/home-sections`, `/api/categories`,
`/api/banners`, `/api/providers`, `/api/faqs/homepage`, `/api/posts`,
`/api/posts/topics`, `/api/documents`.

**Nạp lười thư viện nặng** — `require` nằm trong hàm chứ không ở đầu file.

`cloudinary` mất ~295ms và `google-auth-library` ~144ms khi nạp, cộng lại 422ms —
**23%** tổng thời gian khởi động máy chủ (1.800ms → 1.378ms). Trên Vercel mỗi lần
cold start đều trả khoản đó, kể cả khi yêu cầu chỉ là `GET /api/posts` — một đường
không bao giờ đụng tới hai thư viện này. Node có sẵn bộ đệm module nên chỉ lần gọi
đầu tiên mới chậm.

Xem `src/config/cloudinary.js` (xuất ra **hàm** `layCloudinary()`, không phải đối
tượng) và `layGoogleClient()` trong `userController.js`.

`multer` **không** nạp lười được: nó được dùng làm middleware ngay ở tầng khai báo
route (`uploadCloud.single('thumbnail')`), tức chạy lúc nạp file route.

---

## 6. Xác thực & phân quyền

### 6.1. Ba vai trò

`User.role` là `'student' | 'instructor' | 'admin'`, mặc định `student`.

### 6.2. Ba middleware

| Middleware   | Cho qua khi                          | Trả về khi chặn |
| ------------ | ------------------------------------ | --------------- |
| `protect`    | Token hợp lệ **và** `status !== false` | 401 / 403       |
| `admin`      | `role === 'admin'`                   | 403             |
| `instructor` | `role === 'instructor'` hoặc `'admin'` | 403           |

`protect` kiểm tra `status` **mỗi lần gọi**, không chỉ lúc đăng nhập — vì token
cấp trước khi khoá tài khoản vẫn còn hạn 30 ngày.

`admin` và `instructor` **không tự kiểm tra token**, chúng đọc `req.user` do
`protect` đặt vào.

### 6.3. Quy tắc bắt buộc khi thêm endpoint

> **[N] Mọi endpoint ghi dữ liệu, hoặc đọc dữ liệu của người khác, phải có
> `protect`. Nếu chỉ admin được dùng thì phải có `protect, admin` — viết đủ hai
> cái, theo đúng thứ tự đó.**

Đây không phải lo xa. Đã từng có bốn endpoint thiếu bảo vệ, trong đó
`GET /api/reviews/admin/all` `populate('student', 'name email')` — nghĩa là
**bất kỳ ai cũng tải được email của toàn bộ học viên** chỉ bằng một lời gọi.
Tất cả đã vá, nhưng chúng lọt vào được vì không có ai rà.

Hai cách viết, dùng cái nào cũng được nhưng đừng trộn trong một file:

```js
// Cách 1 — cả file đều cần quyền (adminRoutes, enrollmentRoutes, quizRoutes)
router.use(protect, admin);

// Cách 2 — chỉ vài route cần (bannerRoutes, courseRoutes)
router.get('/',      getBanners);                      // công khai
router.post('/',     protect, admin, createBanner);    // chỉ admin
```

Trước khi mở PR, chạy lệnh này và tự hỏi từng dòng có đúng là được phép công
khai không:

```bash
cd backend
grep -rn "^router\.\(get\|post\|put\|delete\|patch\)(" src/routes/ | grep -v protect
```

Lệnh trên còn báo cả những route đã được `router.use(protect)` bảo vệ ở đầu file
— mở file ra xem rồi hãy kết luận.

---

### 6.4. Đăng xuất phải đi qua `xoaPhien()`

**[N] Đừng tự gọi `localStorage.removeItem` để đăng xuất.** Dùng
`xoaPhien()` trong `services/apiHelper.ts`. Nó làm bốn việc, thiếu một là sinh lỗi:

| Việc | Thiếu thì sao |
| --- | --- |
| Xoá `authToken` | Đã "đăng xuất" mà `getHeaders()` vẫn gắn token cũ vào mọi request |
| Xoá `userInfo` | Giao diện vẫn tưởng còn đăng nhập |
| `clearApiCache()` | Người đăng nhập ngay sau có thể nhận lại dữ liệu của người trước |
| Bắn `userInfoChanged` | Header và `useNguoiDungLuu` không biết mà cập nhật |

Ba lỗi có thật đã sửa khi gom về đây:

1. **`/admin` và `/instructor` đăng xuất mà không xoá `authToken`** — chỉ xoá
   `userInfo` rồi `router.push("/")`. `router.push` là điều hướng phía trình
   duyệt nên không tải lại trang, JWT nằm nguyên trong `localStorage`. Người
   dùng tưởng đã thoát, nhưng ai dùng máy sau đó **vẫn là admin với backend**.
2. **Đăng nhập không xoá bộ đệm.** `apiRequest` đệm GET 30 giây và **chỉ khoá
   theo địa chỉ, không theo người**. Đăng nhập đi qua `services/api.ts` bằng
   `fetch` thẳng chứ không qua `apiRequest`, nên `clearApiCache()` không bao giờ
   chạy. Người B đăng nhập trong vòng 30 giây sau người A, mở đúng trang đó, là
   nhận lại phản hồi cũ của A (ví dụ `/enrollments/my-courses`).
3. **`useNguoiDungLuu` chỉ nghe `storage`.** Sự kiện đó **không** bắn cho chính
   tab đang sửa, nên tên người dùng trên sidebar đứng yên sau khi đăng xuất.
   Nay nghe cả `userInfoChanged` — quy ước sẵn có của dự án, được bắn ở
   `AuthModal`, trang callback của Google, trang cài đặt và `xoaPhien()`.

Đường 401 trong `handleResponse` cũng gọi `xoaPhien()`, nên chỉ có một đường
đăng xuất duy nhất trong cả mã nguồn.

---

### 6.5. Những gì đang bảo vệ phần đăng nhập

Bảng này là **hiện trạng đã kiểm bằng request thật**, không phải danh sách mong muốn.

| Lớp | Cơ chế | Đã đo |
| --- | --- | --- |
| Dò mật khẩu 1 tài khoản | 5 lần sai / 15 phút → khoá | Lần 6 trả `429`, `Retry-After: 900` |
| Dò 1 mật khẩu trên nhiều email | 30 lần sai / 15 phút **theo IP** | Test tự động, xem `loginRateLimit.test.js` |
| Lộ email nào đã tồn tại | Sai email và sai mật khẩu trả **cùng một câu** | Đọc mã |
| Lộ tài khoản nào đang bị khoá | Kiểm `status` **sau** khi đối chiếu mật khẩu | Đọc mã |
| Băm mật khẩu | bcrypt **12 vòng** | Đo: 10 vòng 67ms, 12 vòng 245ms |
| Đổi mật khẩu → cắt phiên cũ | `passwordChangedAt` vs `iat` của token | Token cũ trả `401` sau khi đổi |
| Body quá cỡ | `express.json` giới hạn **1mb** | POST 2MB trả `413` |
| File tải lên | multer có trần ở **cả ba** đường | Đọc mã |

**Vì sao đếm theo IP là bắt buộc.** Bản cũ chỉ đếm theo khoá `ip|email`. Kẻ tấn
công thử **một** mật khẩu phổ biến trên **hàng nghìn** email khác nhau thì mỗi
email là một bộ đếm mới tinh — không lần nào chạm ngưỡng. Đó là kiểu tấn công
phổ biến nhất hiện nay, và nó đi qua tự do. Ngưỡng theo IP để cao (30) vì cả một
trường học có thể dùng chung một IP qua NAT.

**Vì sao `app.set('trust proxy', 1)` là điều kiện tiên quyết.** Không có dòng đó
thì `req.ip` là IP của **proxy** chứ không phải của khách — mọi người dùng chung
một ô đếm. Bộ giới hạn theo IP sẽ vừa vô dụng vừa nguy hiểm: chặn một kẻ tấn
công là chặn luôn tất cả. Số `1` nghĩa là chỉ tin **một** lớp proxy gần nhất;
đặt `true` là cho phép kẻ tấn công tự giả `X-Forwarded-For` để mỗi lần thử đều
là một IP mới.

**Vì sao `passwordChangedAt` quan trọng.** JWT không thu hồi được — đã cấp ra là
sống đủ 30 ngày. Không có mốc này thì việc đổi mật khẩu gần như vô nghĩa về mặt
bảo mật: kẻ đã lấy được token cũ vẫn dùng tiếp được cả tháng, dù nạn nhân đổi
mật khẩu ngay khi phát hiện. `protect()` so `iat` của token với mốc đó và từ
chối mọi token cấp trước. Admin đặt lại mật khẩu cho người khác cũng bật mốc này.

Mốc được lùi lại 1 giây khi ghi, vì `iat` của JWT chỉ tính đến **giây** — không
lùi thì chính token vừa cấp trong cùng giây đó cũng có thể bị từ chối.

### 6.6. Ba việc đã quyết và đã làm

| Việc | Trước | Nay |
| --- | --- | --- |
| Hạn token | 30 ngày | **1 ngày** (`HAN_TOKEN` trong `utils/matKhau.js`) |
| Nơi giữ token | `localStorage` | **Cookie `httpOnly`** — xem 6.7 |
| Mật khẩu tối thiểu | 6 ký tự | **8 ký tự** (`DAI_MAT_KHAU_TOI_THIEU`, khai ở cả hai phía) |

Hạn token và hạn cookie phải khớp nhau. Lệch thì cookie còn sống sau khi JWT
bên trong đã hết hạn: người dùng thấy mình "vẫn đăng nhập" nhưng mọi request
đều 401. Có test giữ hai con số này bằng nhau.

Độ dài mật khẩu khai ở **hai nơi** (`backend/src/utils/matKhau.js` và
`frontend/src/services/quyDinh.ts`) vì hai phía không import lẫn nhau được.
Sửa một bên mà quên bên kia thì giao diện báo "hợp lệ" xong máy chủ trả 400.

Ngoài ra: trang đăng ký trả **"User đã tồn tại"**, tức là dò được email nào đã có
tài khoản — trong khi trang đăng nhập rất cẩn thận tránh điều đó. Giấu đi thì
người dùng thật gõ nhầm email cũng không biết vì sao không đăng ký được. Đây là
lựa chọn sản phẩm, không phải lỗi.

### 6.6b. Đường đăng nhập Google từng cho đi vòng qua mọi lớp bảo mật

Phát hiện khi chuyển sang cookie. `POST /api/users/google` có **hai** nhánh:

- Nhánh A — nhận `credential` (id token của Google) rồi tự kiểm chữ ký. Đúng.
- Nhánh B — nếu thân request có `googleId` **hoặc** `email` thì **tin luôn**,
  không kiểm gì cả.

Nghĩa là:

```
POST /api/users/google   {"email":"admin@gmail.com"}
-> 200, kèm token admin hợp lệ
```

Không mật khẩu, không Google, không gì cả. Đã thử thật và nhận được token của
tài khoản admin. Giới hạn số lần đăng nhập sai, bcrypt 12 vòng,
`passwordChangedAt`, cookie `httpOnly` — **mọi thứ đều bị đi vòng** qua một
dòng `else if`.

Nhánh B sinh ra để phục vụ luồng đổi mã phía máy chủ: `app/api/auth/google/token`
chạy trên máy chủ Next (vì cần `GOOGLE_CLIENT_SECRET`), rồi máy chủ Next gọi
tiếp sang backend. Backend không có id token nên người viết cho nó nhận thẳng
email.

Cách sửa giải quyết luôn cả vấn đề cookie: máy chủ Next chỉ đổi mã lấy
`id_token` rồi **trả về trình duyệt**, trình duyệt tự gọi backend. Backend kiểm
chữ ký Google như nhánh A, rồi đặt cookie thẳng cho trình duyệt.

| | Trước | Sau |
| --- | --- | --- |
| Ai gọi backend | máy chủ Next | trình duyệt |
| Backend nhận gì | `{googleId, email}` không chứng cứ | `id_token` có chữ ký Google |
| Cookie về đâu | máy chủ Next (mất) | trình duyệt (đúng) |

Đo lại sau khi sửa:

```
{"email":"admin@gmail.com"}                -> 400
{"googleId":"x","email":"admin@gmail.com"} -> 400
{"credential":"token-bia-dat"}             -> 401
```

Credential sai nay trả **401** chứ không phải 500: chữ ký sai là "không chứng
minh được danh tính", không phải "máy chủ hỏng".

### 6.7. Token nằm trong cookie httpOnly

`localStorage` đọc được bằng JavaScript, nên **một lỗ XSS là mất token** và
không lớp nào ở dưới cứu được. Cookie `httpOnly` thì `document.cookie` không
nhìn thấy.

Đổi lại, trình duyệt **tự động** gửi cookie kèm mọi request tới máy chủ đó — kể
cả request do trang của kẻ khác tạo ra. Đó là CSRF. Nên hai thứ này đi thành
một cặp, làm cái này mà bỏ cái kia là đổi một lỗ hổng lấy một lỗ hổng.

| Thành phần | Ở đâu |
| --- | --- |
| Đặt / xoá / đọc cookie | `utils/cookieToken.js` |
| Chặn CSRF theo `Origin` | `middlewares/chongCsrf.js` |
| Đường đăng xuất | `POST /api/users/logout` |

**Vì sao CORS không đủ để chặn CSRF.** CORS chặn kẻ tấn công *đọc* phản hồi,
không chặn request được *gửi đi*. Với "simple request" — POST mang
`Content-Type` là `x-www-form-urlencoded`, `multipart/form-data` hay
`text/plain` — trình duyệt không hỏi trước (preflight), request cứ thế chạy.
Dự án này bật cả `express.urlencoded` lẫn `multer` nên cả hai kiểu đó đều vào
được controller. Đo thật, cả bốn `Content-Type` đều bị chặn 403:

```
application/json                  -> 403
application/x-www-form-urlencoded -> 403
multipart/form-data               -> 403
text/plain                        -> 403
Origin đúng                       -> 400 (qua CSRF, dừng ở bước kiểm mật khẩu)
```

`chongCsrf` phải đứng **trước** `express.json`. Đặt sau thì một request từ
origin lạ mang thân JSON hỏng sẽ bị trả 400 trước khi kịp kiểm origin — sai mã
trạng thái, và tốn công đọc thân của một request đáng lẽ vứt đi ngay.

Thiếu `Origin` thì cho qua: đó là curl/Postman/ứng dụng di động, và chúng không
mang cookie của trình duyệt nên không thể bị CSRF. Trình duyệt thì **luôn** gửi
`Origin` cho POST/PUT/PATCH/DELETE, và trang của kẻ tấn công không bỏ hay giả
được header này.

**Phải có đường đăng xuất phía máy chủ.** JavaScript không xoá được cookie
`httpOnly`, nên `localStorage.removeItem` không còn đủ. `xoaPhien()` nay gọi
`POST /users/logout`. Đường này **không** có `protect`: người dùng phải đăng
xuất được cả khi token đã hỏng hoặc hết hạn.

**CORS không còn ném lỗi.** Bản cũ `callback(new Error(...))` cho origin lạ, mà
lỗi ném trong middleware thì thành 500 — mọi request từ origin lạ, kể cả một
`GET` vô hại, đều tạo một lỗi 500 trong log. Nay trả `callback(null, false)`:
không gắn header CORS, trình duyệt tự chặn việc đọc, đúng như CORS vốn định làm.

### 6.8. Vì sao API phải đi vòng qua Next

Cookie chỉ giải quyết được XSS **nếu trình duyệt nhận được nó**. Và ở đây có
một cái bẫy chỉ lộ ra khi deploy, không bao giờ lộ khi chạy máy mình:

| | Máy mình | Production |
| --- | --- | --- |
| Frontend | `localhost:3000` | `...vercel.app` |
| Backend | `localhost:5000` | miền khác |
| Trình duyệt coi là | **cùng site** (cookie không phân biệt cổng) | **khác site** |
| Cookie đăng nhập | bên thứ nhất — chạy | **bên thứ ba** |

Safari **chặn sẵn** cookie bên thứ ba, Chrome đang bỏ dần. Nghĩa là code chạy
hoàn hảo ở máy mình rồi hỏng im lặng trên Safari sau khi deploy — không lỗi,
không thông báo, chỉ là đăng nhập xong vẫn như chưa đăng nhập.

Cách sửa: `next.config.ts` chuyển tiếp `/api/*` sang backend, nên trình duyệt
chỉ nhìn thấy **một** miền. Cookie thành bên thứ nhất, chạy trên mọi trình
duyệt. Đo lại ở máy: cookie được gán cho miền của frontend, và cả vòng đăng
nhập → gọi API → đăng xuất đều đúng khi đi qua cổng 3000.

Dùng `afterFiles` chứ không phải `beforeFiles`: `afterFiles` chạy **sau** các
route thật của Next nên `app/api/auth/google/*` vẫn thắng (đã kiểm: đường đó
vẫn do Next trả lời). Đổi lại, một route Next mới đặt trùng đường với backend
sẽ **âm thầm** che mất backend — hiện không có chỗ nào trùng vì backend không
mount gì ở `/api/auth`.

Thêm một cái lợi: không còn request nào của trình duyệt là cross-origin, nên
CORS không còn nằm trên đường đi của người dùng thật — nó chỉ còn là lưới an
toàn cho ai gọi thẳng vào backend.

**Cần kiểm khi deploy:** file tải lên cũng đi qua đường này. Ảnh đại diện 5MB
và tài liệu 20MB thì không sao, nhưng video bài học cho tới 100MB có thể vượt
hạn mức kích thước thân request của nền tảng. Gặp thì đặt
`NEXT_PUBLIC_GOI_THANG_BACKEND=1` — nhưng lúc đó cookie trở lại là bên thứ ba,
tức là đánh đổi ngược lại.

---

## 7. Danh sách API

Tổng **121 endpoint**. Bảng dưới đây là bản chụp; nguồn sự thật vẫn là
`backend/src/routes/`.

<details>
<summary><b>Xem đầy đủ 121 endpoint</b></summary>

Ký hiệu: `–` công khai · `P` protect · `P+A` protect+admin · `P+I` protect+instructor

**`/api/users`**

| | | |
|---|---|---|
| POST | `/api/users` | – (đăng ký) |
| POST | `/api/users/login` | – (có giới hạn số lần sai) |
| POST | `/api/users/logout` | – (xoá cookie; cố ý không có `protect`) |
| POST | `/api/users/google` | – |
| GET | `/api/users/profile` | P |
| PUT | `/api/users/profile` | P |
| POST | `/api/users/profile/avatar` | P (multipart, ảnh ≤ 5MB) |
| PUT | `/api/users/deactivate` | P |
| GET | `/api/users/activity` | P |
| GET | `/api/users` | P+A |
| GET | `/api/users/instructors` | P+A |
| PUT | `/api/users/:id/role` | P+A |
| DELETE | `/api/users/:id` | P+A |

**`/api/courses`**

| | | |
|---|---|---|
| GET | `/api/courses` | – |
| GET | `/api/courses/:id` | – |
| GET | `/api/courses/slug/:slug` | – |
| GET | `/api/courses/home-sections` | – |
| POST | `/api/courses` | P+I |
| PUT | `/api/courses/:id` | P+I |
| DELETE | `/api/courses/:id` | P+I |
| GET | `/api/courses/instructor` | P+I |
| POST | `/api/courses/:id/enroll` | P |
| PUT | `/api/courses/:id/publish` | P (controller tự chặn ngoài admin) |
| PATCH | `/api/courses/:id/tags` | P+A |
| GET | `/api/courses/admin/courses/home-sections/most-popular` | P+A |
| GET | `/api/courses/admin/courses/home-sections/trending-now` | P+A |
| GET | `/api/courses/admin/courses/home-sections/new-releases` | P+A |

**`/api/admin`** — cả file có `router.use(protect, admin)`

| | | |
|---|---|---|
| GET | `/api/admin/dashboard/statistics` | P+A |
| GET · POST | `/api/admin/users` | P+A |
| GET · PUT · DELETE | `/api/admin/users/:id` | P+A |
| PUT | `/api/admin/users/:id/status` | P+A |
| GET | `/api/admin/courses` · `/:id` | P+A |
| PUT | `/api/admin/courses/:id/publish` | P+A |
| DELETE | `/api/admin/courses/:id` | P+A |
| GET | `/api/admin/enrollments` · `/:id` | P+A |
| PUT | `/api/admin/enrollments/:id/status` | P+A |
| GET | `/api/admin/certificates` | P+A |
| GET | `/api/admin/certificates/:verificationCode/verify` | P+A |
| PUT | `/api/admin/certificates/:id/revoke` | P+A |
| GET | `/api/admin/reviews` | P+A |
| DELETE | `/api/admin/reviews/:id` | P+A |

**`/api/quizzes`** — cả file có `router.use(protect)`

| | | |
|---|---|---|
| GET | `/api/quizzes/:id` · `/course/:courseId` | P |
| GET | `/api/quizzes/:id/attempts` · `/attempt/:attemptId` | P |
| POST | `/api/quizzes/:id/submit` | P |
| POST · PUT · DELETE | `/api/quizzes` · `/:id` | P+I |
| PUT | `/api/quizzes/:id/publish` | P+I |
| PUT | `/api/quizzes/:id/allow-retry/:studentId` | P+I |
| GET | `/api/quizzes/:id/stats` | P+I |

**`/api/enrollments`** — cả file có `router.use(protect)`

| | | |
|---|---|---|
| GET | `/api/enrollments/my-courses` | P |
| GET · POST | `/api/enrollments/:courseId` | P |
| GET | `/api/enrollments/:courseId/progress` · `/students` | P |
| PUT | `/api/enrollments/:courseId/start-lesson` | P |
| PUT | `/api/enrollments/:courseId/update-watch-time` | P |
| PUT | `/api/enrollments/:courseId/complete-lesson` | P |
| PUT | `/api/enrollments/:courseId/complete-course` | P |
| PUT | `/api/enrollments/:courseId/drop` | P |

**`/api/reviews`**

| | | |
|---|---|---|
| GET | `/api/reviews/:id` · `/course/:courseId` · `/stats/:courseId` | – |
| POST | `/api/reviews/:id/helpful` · `/unhelpful` | – |
| POST | `/api/reviews` | P |
| PUT · DELETE | `/api/reviews/:id` | P |
| GET | `/api/reviews/admin/all` | P+A |

**`/api/certificates`**

| | | |
|---|---|---|
| GET | `/api/certificates/:id` | – |
| GET | `/api/certificates/verify/:code` | – |
| GET | `/api/certificates/user/:userId` | – |
| GET | `/api/certificates/achievements/leaderboard` | – |
| GET | `/api/certificates/achievements/user/:userId` | – |
| POST | `/api/certificates` | P |
| PUT | `/api/certificates/:id` | P |
| GET | `/api/certificates/my-certificates` | P |
| GET | `/api/certificates/achievements/my-achievements` | P |

**`/api/lessons`**

| | | |
|---|---|---|
| GET | `/api/lessons/:id` | P |
| GET | `/api/lessons/course/:courseSlug/lesson/:lessonSlug` | P |
| POST · PUT · DELETE | `/api/lessons` · `/:id` | P+I |

**`/api/faqs`**

| | | |
|---|---|---|
| GET | `/api/faqs/homepage` · `/course/:courseId` | – |
| POST · PUT · DELETE | `/api/faqs` · `/:id` | P+I |

**`/api/providers`**

| | | |
|---|---|---|
| GET | `/api/providers` · `/slug/:slug` | – |
| POST · PUT · DELETE | `/api/providers` · `/:id` | P+A |

**`/api/banners`**

| | | |
|---|---|---|
| GET | `/api/banners` | – |
| POST · PUT · DELETE | `/api/banners` · `/:id` | P+A |

**`/api/documents`**

| | | |
|---|---|---|
| GET | `/api/documents` | – (phân trang, `?q=` tìm kiếm) |
| GET | `/api/documents/:id` | – |
| POST | `/api/documents/:id/download` | – (đếm lượt tải) |
| POST | `/api/documents` | P (kèm file, qua bộ lọc nội dung) |
| DELETE | `/api/documents/:id` | P (chủ bài hoặc admin) |

**`/api/posts`** — bài viết blog (Cẩm nang môn học, do Admin biên tập)

| | | |
|---|---|---|
| GET | `/api/posts` | – (phân trang, `?topic=` `?tag=` `?q=`) |
| GET | `/api/posts/topics` | – (6 chủ đề kèm số bài) |
| GET | `/api/posts/:slug` | – (chỉ bài đã đăng) |
| GET | `/api/posts/admin/all` | P+A (kể cả bản nháp, `?status=draft`) |
| GET | `/api/posts/admin/:id` | P+A (kể cả bản nháp, kèm `content`) |
| POST | `/api/posts` | P+A (qua bộ lọc nội dung) |
| PUT | `/api/posts/:id` | P+A (qua bộ lọc nội dung) |
| DELETE | `/api/posts/:id` | P (tác giả hoặc admin) |

**`/api/categories`**

| | | |
|---|---|---|
| GET | `/api/categories` | – |
| POST | `/api/categories` | P+A |
| PUT · DELETE | `/api/categories/:id` | P+A |

Trước đây tạo danh mục chỉ cần quyền instructor trong khi sửa/xoá lại cần admin.
Đã siết cả ba về admin: danh mục là phân loại dùng chung cho cả trang, để mỗi
giảng viên thêm được mà không dọn được thì danh sách loãng ra, và người dọn lại
là admin. Toàn bộ giao diện gọi ba endpoint này đều nằm trong khu `/admin`.

</details>

---

## 8. Ảnh

`next/image` **ném lỗi lúc chạy** nếu host của ảnh chưa được khai báo. Lỗi đó
không làm hỏng một ô ảnh — nó **làm sập cả trang**. Mà `thumbnail` khóa học và
`imageUrl` banner là dữ liệu nhập tay, không thể đảm bảo host luôn nằm trong
danh sách. Nên có hai lớp:

### 8.1. `image-hosts.ts` — một danh sách, hai nơi dùng

`frontend/image-hosts.ts` là nguồn duy nhất. `next.config.ts` sinh
`images.remotePatterns` từ nó; `SafeImage` đọc nó để biết khi nào phải bỏ tối ưu.

**Thêm host mới thì chỉ sửa file này.** Khai riêng ở hai chỗ thì sớm muộn cũng
lệch nhau.

Lưu ý: danh sách ghim `protocol: "https"`, nên URL `http://` — kể cả từ host đã
khai — vẫn bị coi là không tối ưu được.

### 8.2. `SafeImage` — dùng cái này, không dùng `next/image` trực tiếp

> **[N] Ảnh có đường dẫn lấy từ API/CSDL thì dùng `SafeImage`.**
> `next/image` trực tiếp chỉ dành cho ảnh tĩnh trong `public/`.

```tsx
import SafeImage from "@/src/components/ui/SafeImage";

<div className="relative aspect-video">   {/* fill CẦN cha có position: relative */}
  <SafeImage src={course.thumbnail} alt={course.title} fill
             sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
</div>
```

Host quen → tối ưu như thường. Host lạ → bỏ tối ưu, ảnh vẫn hiện, trang không sập.

Hiện có **15 file** import `SafeImage`, và còn **10 thẻ `<img>` ở 9 file**:

| Nhóm | Số | Có nên đổi không |
| --- | --- | --- |
| Xem trước ảnh vừa chọn (`blob:`) | 5 | **Không.** `next/image` không đọc được `blob:`. Mỗi file đã có ghi chú lý do ở đầu |
| Avatar có sẵn `onError` tự thay ảnh hỏng | 2 | Không gấp — đã tự xử lý ảnh lỗi |
| Ảnh lấy từ API chưa chuyển | 2 | **Nên đổi** sang `SafeImage` khi có dịp động vào |
| Một URL Unsplash gán cứng trong `instructor/page.tsx` | 1 | Nên thay bằng dữ liệu thật |

> **[Đ]** `grep -rn "<img" --include=*.tsx frontend/app frontend/src`
> (kết quả có lẫn 5 dòng chú thích nhắc tới `<img>`, không phải thẻ thật)

---

## 9. Styling

Tailwind v4. Không có `tailwind.config.js` — token khai trong `app/globals.css`
bằng `@theme`.

### 9.1. Bảng màu thật đang dùng

| Class       | Số lần xuất hiện |
| ----------- | ---------------- |
| `slate-*`   | 1472             |
| `blue-600`  | 233              |
| `bg-white`  | 202              |
| `gray-*`    | 140              |
| `blue-700`  | 61               |
| `indigo-*`  | 60               |

> **[Đ]** `grep -ro "blue-600" --include=*.tsx frontend/app frontend/src | wc -l`

**Màu chủ đạo là `blue-600`.** Dùng đúng nó cho nút chính và liên kết.

### 9.2. `globals.css` chỉ còn hai token, và đó là toàn bộ

Trước đây file này khai `--primary`, `--primary-hover`, `--card-bg`,
`--border-color`, `--shadow` cùng khối `@theme inline`, và ba tiện ích `.glass`,
`.gradient-bg`, `.animate-fade-in`. Tất cả **chỉ được dùng trong `ui/Button.tsx`,
`ui/Card.tsx`, `ui/Input.tsx` — mà ba file đó không file nào import.**

Ba file kia nay đã xoá, nên phần token cũng đi theo. Đã soát lại từng cái trước
khi bỏ:

| Bỏ | Kiểm chứng |
| --- | --- |
| `--primary`, `--primary-hover`, `@theme inline` | Không file nào dùng class `bg-primary` / `text-primary` |
| `--card-bg`, `--border-color`, `--shadow`, `.glass` | `.glass`: 0 file dùng |
| `.gradient-bg` | 0 file dùng |

Giữ lại: `--background`, `--foreground` (chính `body` đọc chúng) và
`.animate-fade-in` + `@keyframes fadeIn` (hộp thoại sửa đánh giá ở
`/admin/reviews` dùng).

> **[Đ]** Kiểm trên CSS đã biên dịch, không phải trên mã nguồn:
> `curl` file `.css` mà trang tải về → `f8fafc` còn 12 lần, `fadeIn` còn 2 lần,
> `6366f1` và `gradient-bg` còn **0** lần.

Điểm đáng nhớ: `--primary` cũ đặt là `#6366f1` (tím indigo) trong khi cả giao
diện dùng xanh `#0056d2`. Nó không chỉ vô dụng — ai lỡ dùng là lệch màu ngay.
Muốn đổi màu chủ đạo thì sửa trực tiếp class Tailwind, không có token nào làm
việc đó cả.

### 9.3. Không có chế độ tối, và đó là cố ý

Khối `@media (prefers-color-scheme: dark)` đã bị gỡ khỏi `globals.css`. Lý do ghi
ngay trong file: giao diện hardcode nền sáng ở hàng trăm chỗ (`bg-white`,
`bg-slate-50`), nhưng khối đó chỉ đổi `--foreground` thành gần trắng → chữ trắng
nằm trên hộp trắng, tương phản ~1.05:1, **mất chữ**.

Muốn làm chế độ tối thật thì phải thêm biến thể `dark:` cho từng nền, không phải
chỉ đổi màu `body`.

`Button.tsx` và `Input.tsx` còn sót class `dark:` — tàn dư, và cũng không ảnh
hưởng vì hai file đó không được dùng.

### 9.4. Class Tailwind viết sai thì im lặng

Gõ nhầm `bg-blu-600` không báo lỗi ở đâu cả, chỉ là không có màu. Đổi class xong
mà không thấy gì thay đổi thì nghi chính tả trước tiên.

---

## 10. Chất lượng mã

### 10.0. Hai lệnh kiểm hạ tầng

Chạy trong `backend/`, dùng khi vừa dựng môi trường hoặc vừa đổi khóa:

| Lệnh | Kiểm gì |
| --- | --- |
| `npm run check:db` | `MONGO_URI` kết nối được không; báo rõ sai mật khẩu / sai tên cụm / IP chưa được phép. **Không in mật khẩu** |
| `npm run check:cloudinary` | Khóa Cloudinary đúng không, và **file PDF có giao được không** (xem cảnh báo ở mục 2) |

Cả hai thoát mã 1 khi hỏng. Nhưng **đừng cắm vào CI**: chúng cần `MONGO_URI` và
khóa Cloudinary thật. `backend/.github/workflows/ci.yml` cố ý chỉ chạy những thứ
không cần bí mật — `node --check` cho mọi file `.js`, rồi `npm test`.

### 10.0b. Test của backend

```bash
cd backend
npm test              # 68 test, dung node:test co san - khong cai them gi
npm run test:filter   # rieng bo loc noi dung
```

Tất cả đều là hàm thuần, không chạm CSDL. Chi tiết ở mục 14 (P5).

---

### 10.1. Bốn lệnh

```bash
cd frontend
npm run format:check   # prettier
npm run lint           # eslint, 0 lỗi + 0 cảnh báo
npm run typecheck      # tsc --noEmit
npm run build          # next build
npm run verify         # chạy cả bốn
```

Backend **chưa có** lint. Test thì mới có đúng một bộ: `npm run test:filter`
(kiểm bộ lọc nội dung, xem mục 5.4). `npm test` vẫn chỉ trả về lỗi.

### 10.2. Vì sao lint có "trần cảnh báo"

Trước đây `npm run lint` cho ra **211 lỗi + 78 cảnh báo**. Lint mà lúc nào cũng
đỏ thì không ai chạy, và lỗi mới lẫn vào đám lỗi cũ không ai thấy.

Cách xử lý: chia rule làm hai loại.

| Loại                                   | Mức     | Yêu cầu               |
| -------------------------------------- | ------- | --------------------- |
| Sửa được ngay → đã sửa hết             | `error` | **Luôn phải bằng 0**  |
| Nợ cũ, sửa hết sẽ thành PR không review nổi | `warn` | Chỉ được phép **giảm** |

`package.json` ghim `eslint --max-warnings 0`. **Nợ cảnh báo đã trả hết — đừng nới con số này ra để cho qua một cảnh báo mới.**
Giảm được thì sửa luôn số trong `package.json` ở cùng PR.

Còn lại:

| Rule                                  | Số   | Vì sao chưa xong                          |
| ------------------------------------- | ---- | ----------------------------------------- |
| `@typescript-eslint/no-explicit-any`  | 0    | ✅ Đã dọn hết — xem mục 14 (P4)            |
| `react-hooks/set-state-in-effect`     | 0    | ✅ Đã dọn hết — xem mục 14 (P4)            |

Hai rule bắt buộc bằng 0 mà đáng chú ý:

- `no-unused-vars` bật `ignoreRestSiblings: true`. **Đừng tắt.**
  `const { token, ...rest } = data` là cách cố ý loại token trước khi lưu
  `localStorage`. Coi `token` là "biến thừa" rồi đổi thành `_token` sẽ khiến
  token lọt vào `rest` và **bị ghi xuống localStorage**.
- `react-hooks/immutability` — thường có nghĩa là hàm được gọi trước khi khai
  báo. Chuyển khai báo lên trên chỗ gọi là hết.

### 10.3. Chạy tự động

- **Trước mỗi commit:** husky chạy `lint-staged` → prettier + eslint --fix trên
  file đang staged
- **Trên GitHub:** `.github/workflows/ci.yml` chạy Format → Lint → Typecheck →
  Build, tách bốn bước để nhìn log biết ngay hỏng ở đâu

⚠️ File CI nằm ở `frontend/.github/`, **chỉ chạy khi frontend là gốc repo.** Đẩy
cả dự án lên dạng monorepo thì GitHub Actions không nhận — phải dời `.github` ra
gốc và thêm `working-directory`.

---

## 11. Quy ước đặt tên

| Loại              | Quy ước           | Ví dụ                       |
| ----------------- | ----------------- | --------------------------- |
| Component         | `PascalCase.tsx`  | `CourseSection.tsx`         |
| Trang             | `page.tsx`        | bắt buộc theo App Router    |
| Model Mongoose    | `PascalCase.js`   | `Course.js`, `Quiz.js`      |
| Route / controller | `camelCase.js`   | `courseRoutes.js`           |
| Chú thích         | tiếng Việt        | giải thích **vì sao**, không phải làm gì |

⚠️ **`src/services/` hiện có bốn kiểu đặt tên khác nhau:**

```
course.ts   categoryService.ts   lesson.api.ts   userApi.ts
```

Chưa thống nhất được. **File mới thì theo kiểu `<tên>.ts`** (`course.ts`,
`review.ts`) — kiểu này đang chiếm đa số. Đừng đổi tên loạt file cũ chỉ để cho
đều; đổi dần khi có việc động vào file đó.

---

## 12. Công thức

### 12.1. Thêm một trang

1. Chọn route group: công khai → `(portal)`, quản trị → `(admin)`, giảng viên →
   `(instructor)`
2. Tạo `app/(nhóm)/duong-dan/page.tsx`
3. Cần dữ liệu → gọi hàm trong `src/services/`, **không `fetch` trực tiếp**
4. Cần header riêng → thêm nhánh trong `Header.tsx` (mục 4.2)
5. Chạy `npm run verify`

### 12.2. Thêm một endpoint

1. `backend/src/models/` — thêm/sửa schema nếu cần
2. `backend/src/controllers/` — viết logic
3. `backend/src/routes/` — khai đường dẫn **kèm middleware quyền** (mục 6.3)
4. `index.js` — chỉ khi tạo file route hoàn toàn mới
5. `frontend/src/services/` — thêm hàm gọi, đi qua `apiRequest`
6. Tự kiểm: gọi endpoint **khi chưa đăng nhập** xem có bị chặn đúng không

### 12.3. Thêm ảnh từ host mới

1. Thêm hostname vào `frontend/image-hosts.ts`
2. Xong. `next.config.ts` tự nhận.
3. Khởi động lại dev server nếu chưa thấy đổi.

Nếu không thêm host: ảnh vẫn hiện (nhờ `SafeImage`) nhưng không được tối ưu.

### 12.4. Sửa lỗi lint mà không làm bung diff

Sửa theo **từng rule một**, không sửa tất cả cùng lúc. Sau mỗi nhóm chạy
`npm run typecheck` — nhiều thao tác thay thế hàng loạt trông vô hại nhưng làm
biến bị che (shadow) hoặc đổi ngữ nghĩa, và `tsc` là thứ duy nhất bắt được.

---

## 13. Git & PR

### 13.1. Trước khi commit

```bash
cd frontend && npm run verify
```

### 13.2. Commit

Dùng Conventional Commits:

```
feat(course): them bo loc theo cap do
fix(auth): khong ghi token vao localStorage
chore(lint): ha tran canh bao 24 -> 0
docs(readme): cap nhat danh sach endpoint
```

### 13.3. Không được làm

- ❌ Commit `.env` (đã ignore ở cả hai bên — đừng gỡ)
- ❌ Đẩy thẳng lên nhánh chính
- ❌ Nâng `--max-warnings` lên
- ❌ Thêm `eslint-disable` mà không ghi lý do ngay dòng đó
- ❌ Thêm endpoint không có middleware quyền
- ❌ Dời hàng loạt file "cho đúng chuẩn" — tách thành PR riêng, bàn trước

### 13.4. Checklist

- [ ] `npm run verify` xanh
- [ ] Endpoint mới đã có `protect` / `admin` / `instructor` đúng mức
- [ ] Ảnh từ CSDL dùng `SafeImage`
- [ ] Lời gọi API nằm trong `src/services/`
- [ ] Số cảnh báo không tăng
- [ ] README được sửa nếu có gì trong đây thành sai

---

## 14. Nợ kỹ thuật

Xếp theo mức thiệt hại nếu bỏ mặc, không theo độ khó.

### P1 — Bảo mật, làm trước

| Việc | Vì sao gấp |
| --- | --- |
| ~~Đổi `JWT_SECRET`~~ | ✅ **Đã xong** — nay là chuỗi ngẫu nhiên 86 ký tự. Đã kiểm: token ký bằng secret cũ trả 401 |
| ~~Đổi mật khẩu MongoDB~~ | ✅ **Đã xong** — nay là 16 ký tự Atlas tự sinh. Đã kiểm: mật khẩu cũ bị từ chối, mật khẩu mới đọc/ghi được |
| ~~Bỏ `err.stack` khỏi phản hồi lỗi~~ | ✅ **Đã xong** — xem 5.3. Điều kiện đảo thành `=== 'development'`, quên biến môi trường thì lỗi về phía an toàn |
| ~~`.env` bị nướng vào image Docker~~ | ✅ **Đã xong** — thêm `.dockerignore` cho cả hai thư mục |

Đổi `JWT_SECRET` đăng xuất toàn bộ người dùng đang đăng nhập (token cũ thành vô
hiệu ngay) — đã làm vào giờ thấp điểm.

### P2 — Cấu hình sai, âm thầm gây lỗi

| Việc | Hiện trạng |
| --- | --- |
| ~~`Dockerfile` dùng `node:18-alpine`~~ | ✅ **Đã xong** — cả hai lên `node:24-alpine`, `npm ci --omit=dev`, chạy bằng user `node`, `CMD` thành `node index.js` / `npm start`. Frontend chia hai giai đoạn build–run |
| ~~Quyền `POST /api/categories`~~ | ✅ **Đã xong** — siết về `admin` cho khớp với sửa/xoá. Toàn bộ giao diện gọi nó đều nằm trong khu `/admin` |
| ~~Dọn `package.json`~~ | ✅ **Đã xong** — bỏ đoạn HTML logo Laravel, đổi `my-app` thành `learning-portal-frontend`, bỏ `main: index.js` thừa |
| ~~CI chạy Node 20~~ | ✅ **Đã xong** — lên 24 cho khớp Dockerfile. Node 20 hết hạn hỗ trợ từ 4/2025 |
| ~~Backend chưa có CI~~ | ✅ **Đã có** — `backend/.github/workflows/ci.yml`: `npm ci`, kiểm cú pháp 70 file `.js` bằng `node --check`, rồi `npm test`. Không cần secret nào |

### P2b — Tham số truy vấn không kiểm — ✅ đã sửa

Ba lỗi cùng một gốc: `req.query` dùng thẳng vào Mongo. Đo trước khi sửa:

| Gọi thử | Trước | Sau |
| --- | --- | --- |
| `?page=-5` trên 5 đường `/api/admin/*` | **500** | 200 |
| `?search=(` trên `admin/users`, `admin/courses` | **500** | 200 |
| `?search=a+` | 10 kết quả **sai** | 0 kết quả (đúng) |
| `?limit=abc` | `pages: null` | `pages: 2`, `limit: 10` |
| `?limit=100000` | không có trần | trần 100 |

`skip` âm thì Mongo từ chối cả câu truy vấn. Còn chuỗi tìm kiếm được nhét
thẳng vào `$regex`, nên nó **cũng là một mẫu regex**: gõ một dấu `(` là mẫu
không hợp lệ → 500, còn gõ `a+` thì dấu `+` bị hiểu là toán tử "một hoặc nhiều
chữ a" nên trả về người không liên quan.

Gộp về `utils/truyVan.js` dùng chung cho cả 5 endpoint:

- `phanTrang(req.query)` → `{ trang, soDong, boQua }`, đã ép về số nguyên hợp lệ
- `timGan(chuoi)` → `{ $regex: <đã thoát>, $options: 'i' }`

Trần `limit` đặt **100** vì đó là con số lớn nhất giao diện đang xin (trang duyệt
đánh giá gọi `limit: 100`) — đặt ở đó thì không màn hình nào đổi hành vi.

**Đính chính:** lần đầu tôi viết "các đường công khai không dính lỗi này" sau
khi thử `courses`, `posts`, `documents`. Sai — tôi bỏ sót
`GET /api/reviews/course/:courseId?page=-5`, một đường **không cần đăng nhập**
mà vẫn trả 500. `certificates/achievements/leaderboard?limit=-1` cũng vậy. Cả
hai đã sửa. Bài học: thử vài đường rồi khái quát cho cả nhóm là chưa đủ — phải
quét hết.

### P2c — Id sai định dạng trả 500, và hai endpoint hỏng sẵn — ✅ đã sửa

**12 endpoint trả 500 chỉ vì id gõ sai**, phần lớn là đường công khai. Bất kỳ
liên kết hỏng nào, hay một con bot dò URL, đều tạo 500 trong log:

```
courses/khong-phai-objectid        500 -> 404
reviews/course/khong-phai-objectid 500 -> 404
quizzes/course/...                 500 -> 404   (còn 9 đường nữa)
```

Nguyên nhân: Mongoose ném `CastError`, mà mọi controller đều bắt lỗi bằng
`catch { res.status(500) }` nên lỗi 400-ish bị báo thành 500.

Sửa bằng `middlewares/idHopLe.js` gắn vào cả 14 router qua `router.param()` —
chặn trước khi vào controller. Dùng **404** chứ không phải 400: id sai định
dạng thì tài nguyên chắc chắn không tồn tại, và 404 không hé lộ rằng hệ thống
dùng ObjectId.

Chỉ 5 tham số thật sự là ObjectId (`id`, `courseId`, `studentId`, `attemptId`,
`userId`). `slug`, `courseSlug`, `lessonSlug`, `code`, `verificationCode` là
chuỗi tự do — đem vào danh sách sẽ làm hỏng mọi đường tra cứu theo slug. Đã
kiểm cả hai chiều: id thật 200, slug thật 200.

**Lớp này làm lộ ra hai endpoint hỏng từ trước**, trước đó bị chính lỗi 500 kia
che mất:

| Endpoint | Hỏng thế nào |
| --- | --- |
| `GET /api/admin/courses/:id` | `.populate('students')` — `Course` **không có** trường đó (chỉ có `studentsCount`). Trả 500 với **mọi** khóa học |
| `GET /api/admin/enrollments/:id` | `.populate('completedLessons')` — tên thật là `lessonProgress`. Trả 500 với **mọi** bản ghi |

Không trang nào gọi hai đường này nên chưa ai phát hiện.

Endpoint thứ hai còn giấu một lỗi bảo mật: dòng ngay trên là
`.populate('student')` **không giới hạn trường**. `User` không đặt
`select: false` cho `password`, nên nó kéo về cả chuỗi băm mật khẩu. Chưa từng
lọt ra ngoài vì dòng `completedLessons` làm cả hàm nổ trước — nhưng sửa lỗi
`completedLessons` mà không sửa dòng này thì vừa vá xong đã mở ra một lỗ. Đã
đổi thành `.populate('student', 'name email avatar')`.

Sau đó kiểm **cả 76 lời gọi `populate`** trong mọi controller bằng cách đối
chiếu với schema thật: 0 sai.

### P3 — Mã chết

| Việc | Số liệu |
| --- | --- |
| ~~`ui/Button.tsx`, `ui/Card.tsx`, `ui/Input.tsx`, `common/ComingSoon.tsx`~~ | ✅ **Đã xoá** — 133 dòng, 0 file import (đã soát: không barrel, không import động). Cả bốn nằm trong `HEAD`, lấy lại bằng `git show HEAD:<đường-dẫn>` |
| ~~Token trong `globals.css`~~ | ✅ **Đã dọn** — xem mục 9.2 |
| ~~`home/CareerSection.tsx`~~ | ✅ **Đã xoá** — 92 dòng, 0 nơi import. Có trong `181596d`, lấy lại bằng `git show 181596d:frontend/src/components/home/CareerSection.tsx` |
| ~~9 file `.md` trong `backend/`~~ | ✅ **Đã xoá** — 2.456 dòng, xem bên dưới |

**Vì sao xoá 9 file tài liệu ấy.** Đã đối chiếu từng file với route và biến môi
trường thật trước khi xoá. Hai file **sai thẳng**, ai làm theo là hỏng:

- `ENROLLMENT_API_DOCS.md` — **toàn bộ 10 đường dẫn đều thừa đoạn `/course`**.
  Nó ghi `PUT /api/enrollments/course/:courseId/start-lesson`, đường thật là
  `PUT /api/enrollments/:courseId/start-lesson`. Gọi theo tài liệu là 404.
- `SETUP_GUIDE.md` — ghi biến `MONGODB_URI`, tên thật là `MONGO_URI`; và không
  hề nhắc `CLOUDINARY_*` lẫn `GOOGLE_CLIENT_ID`.

Bảy file còn lại **không sai nhưng thiếu**: mỗi endpoint chúng ghi đều có thật,
nhưng đều bỏ sót phần mới — `QUIZ_API_DOCS` thiếu `allow-retry`, `REVIEW_API_DOCS`
thiếu `/admin/all`, `CERTIFICATE_API_DOCS` thiếu ba đường `achievements`.

Mục 7 của tài liệu này liệt kê **cả 121 endpoint**, có đủ cả những chỗ chúng bỏ sót,
và có thêm cột quyền. Giữ hai nguồn song song thì kiểu gì cũng lệch — đúng như
`ENROLLMENT_API_DOCS` đã lệch. Nay chỉ còn một nguồn.

`backend/README.md` giữ lại.

### Ảnh đại diện — một component thay cho sáu bản chép tay

Kiểu "có ảnh thì hiện ảnh, hỏng thì lui về vòng tròn chữ cái" trước đây bị chép
rời ở 6 chỗ, mỗi chỗ một kiểu. Gộp về `components/ui/AnhDaiDien.tsx`:

| Nơi dùng | Trước |
| --- | --- |
| `admin/users` | chỉ có chữ cái — **vứt bỏ `avatar` mà API vẫn trả về** |
| `admin/enrollments` | chỉ có chữ cái (backend cũng chưa populate `avatar`) |
| `course` (phần đánh giá) | chỉ có chữ cái — dữ liệu đã có sẵn, kiểu đã khai `avatar?` |
| `HeaderUserMenu` nút | `<img>` thô, phải tắt cả luật eslint để dùng |
| `HeaderUserMenu` menu | chỉ có chữ cái, dù nút ngay cạnh lại hiện ảnh |
| `user/profile` | đã đúng sẵn (`SafeImage` + `onError`) |
| `FeedCard` | có ảnh nhưng **không bắt `onError`** — hỏng là ô trống |

Hai chỗ cần đụng tới backend: `admin/enrollments` phải thêm `avatar` vào
`populate('student', ...)`. Các chỗ còn lại dữ liệu vốn đã về tới nơi.

Tham số `nenChuCai` giữ nguyên tông màu riêng của từng màn hình (header xanh
đậm, feed xám, đánh giá xanh nhạt) — gộp về một màu sẽ đổi giao diện của những
trang không liên quan tới việc này.

Component tự đặt lại cờ lỗi khi `src` đổi, bằng cách chỉnh state ngay trong lúc
render. Không có đoạn đó thì một lần tải hỏng sẽ dính mãi: đăng xuất rồi đăng
nhập bằng tài khoản khác vẫn ra chữ cái dù ảnh mới tải được bình thường.

### P4 — Chặn việc dọn cảnh báo

**~~138 chỗ `any`~~ — ✅ đã về 0.**

Mục này trước đây ghi là "không sửa được bằng cách gõ kiểu vào, vì kiểu khai
trong `src/services/` không khớp dữ liệu API trả về thật". Chẩn đoán đó đúng, và
đó chính là cách sửa: **đọc model cùng controller của backend rồi sửa lại kiểu
cho khớp**, chứ không phải gõ kiểu bừa vào chỗ dùng.

Những chỗ khai sai đã sửa, mỗi chỗ đối chiếu với `backend/src/models/` hoặc với
`res.json(...)` trong controller tương ứng:

| Chỗ khai sai | Thật ra là |
| --- | --- |
| `Course.category: string \| { _id, name }` | **Mảng** ObjectId — model khai `category: [{ ... }]` |
| `Course.lessons: string[] \| any[]` | `string[] \| Lesson[]`, tuỳ endpoint có populate hay không |
| `enrollment.api.ts` | Không khai một kiểu nào — mọi hàm trả `any` ngầm |
| `QuizSubmitResponse` | Thiếu `_id` và `answers` |
| `getQuizById` | Trả về `Quiz` **kèm** `latestAttempt` |
| `completeLesson` | Không trả `Enrollment` mà `{ message, status, data }` |
| `BannerData` | Thiếu `linkUrl`, `order`, `cloudinaryId` |
| `adminService.ts` | Không khai kiểu trả về nào |
| `certificate.verifyCertificate` | Trả bản rút gọn, không phải `Certificate` |

Ba kiểu mới dùng chung thay cho các bản chép rời trong từng trang:
`Lesson` (bài học do máy chủ trả về, `_id` bắt buộc), `AdminEnrollmentRow`,
`KetQuaLamBai`. Kèm ba hàm đọc dùng chung trong `services/course.ts`:
`layIdChuDe`, `tenChuDe`, `tenGiangVien` — **đọc `course.category` và
`course.instructor` qua chúng, đừng đọc thẳng `.name` hay `._id`.**

Việc gõ kiểu này lôi ra **tám đoạn mã chết** đã im lặng chạy sai từ lâu, xem
mục 4.6.

**~~24 chỗ `set-state-in-effect`~~ — ✅ đã về 0.**

Mục này trước đây kết luận "đều không phải lỗi, muốn về 0 phải đổi kiến trúc
(React Query hoặc Server Component), việc lớn cần bàn riêng". Đọc lại từng chỗ
thì kết luận đó **quá bi quan** — 24 chỗ hoá ra là ba nhóm khác hẳn nhau, và
không nhóm nào cần đổi kiến trúc:

| Nhóm | Số | Cách sửa |
| --- | --- | --- |
| Đọc `localStorage` rồi `setState` | 4 | `useSyncExternalStore`, xem `src/hooks/nguoiDungLuu.ts` |
| Trạng thái suy ra được từ `pathname` | 2 | Tính lúc vẽ, không đặt trong effect |
| `useState(false)` + effect bật cờ đã-hydrate | 1 | `useDaGanVaoTrinhDuyet()` |
| Gọi hàm tải dữ liệu trong effect | 17 | Hoãn một vòng microtask |

**Nhóm `localStorage`.** Bốn nơi cùng đọc `userInfo` theo kiểu vẽ một lần với giá
trị rỗng rồi vẽ lại. `useSyncExternalStore` sinh ra đúng để đọc nguồn ngoài
React: nó trả giá trị thật ngay lần vẽ đầu ở trình duyệt, và `null` ở máy chủ
nên không lệch khi hydrate. Bẫy duy nhất: `getSnapshot` phải trả **giá trị ổn
định** — `JSON.parse` mỗi lần sinh object mới, React so thấy khác nhau và lặp vô
tận, nên hook nhớ lại chuỗi thô và chỉ phân tích khi chuỗi đổi.

**Nhóm suy ra từ `pathname`.** Menu sidebar tự mở khi vào khu tương ứng. Cách cũ
đặt trong effect nên React vẽ một lần menu đóng rồi vẽ lại menu mở. Nay tính
thẳng lúc vẽ, với một ô `null | boolean`: `null` là "chưa bấm gì, theo đường
dẫn", còn `true`/`false` là ý người dùng. Chuyển **sang** một trang thuộc khu đó
thì xoá ý người dùng cho menu mở lại — giữ đúng hành vi cũ, kể cả trường hợp
người dùng đóng menu rồi đi sang trang không thuộc khu đó.

**Nhóm tải dữ liệu.** Các hàm này mở đầu bằng `setLoading(true)`, nên gọi thẳng
trong thân effect là `setState` đồng bộ — React phải chạy thêm một vòng vẽ trước
khi hiện màn hình. Hoãn một vòng microtask (`void Promise.resolve().then(tai)`)
là hết, và mắt thường không thấy khác.

Trần cảnh báo giờ là **0**. Muốn thêm một `useEffect` có `setState` đồng bộ thì
CI sẽ chặn — hãy hỏi trước xem nó thuộc nhóm nào ở trên.

**~~`npm run format:check` đỏ trên 118 file~~ — ✅ đã chạy prettier một lượt.**

Mục này trước đây ghi "cố ý chưa chạy, để dành làm một PR riêng chỉ có prettier".
Kế hoạch đó không giữ được, vì `.husky/pre-commit` chạy `lint-staged`, mà
`lint-staged` lại `prettier --write` mọi file `.ts`/`.tsx` được stage. Nghĩa là
mỗi file đụng tới đều bị định dạng lại ngay lúc commit dù muốn hay không — cái
gọi là "PR riêng chỉ có prettier" đã tan thành từng mảnh rải khắp mọi commit.

Chạy một lượt cho xong thì ít ra `npm run verify` và CI mới xanh được. Trước đó
CI **hỏng ngay ở bước đầu tiên** trên mọi lần push, nên ba bước lint, typecheck,
build phía sau chưa từng chạy lần nào.

### P5 — Nội dung

**~~Kiểm lại mốc điểm và cách xử lý `F`~~ — ✅ đã soát, không phải sửa gì.**

Điểm `F` xử lý **đúng** và có ghi chú ngay tại dòng trong `GradeProfile.tsx`:
nó **tính vào mẫu số GPA** nhưng **không tính vào tín chỉ tích luỹ** —
`if (g > 0) passed += c`. Đó là quy ước của hệ tín chỉ: trượt vẫn kéo điểm
trung bình xuống cho tới khi học lại, nhưng không được cộng tín chỉ. `D`
(hệ 4 bằng 1.0) là mức đạt thấp nhất nên vẫn được tính, đúng.

Chín mốc của thang đầy đủ liền mạch, không hở cũng không chồng:

```
A+ 8.95-10    A 8.45-8.94   B+ 7.95-8.44
B  6.95-7.94  C+ 6.45-6.94  C  5.45-6.44
D+ 4.95-5.44  D  3.95-4.94  F  0-3.94
```

Các mốc lẻ `.95`/`.45` không phải gõ nhầm: điểm tổng kết được **làm tròn tới
một chữ số thập phân trước khi xét**, nên `8.95` thành `9.0` và vẫn là `A+`.
So thẳng với mốc này cho kết quả y hệt việc làm tròn rồi mới so, mà không phải
làm tròn hai lần.

`suggestImprovements` cũng tính `F` vào tổng tín chỉ `C`, khớp với mẫu số GPA —
nhất quán.

Còn lại:

**~~Backend chưa có một dòng test nào~~ — ✅ đã có 68 test.**

Dùng bộ chạy test **có sẵn trong Node** (`node:test`), không cài thêm thư viện
nào — không Jest, không Vitest, `package.json` không dài thêm một dòng
dependency:

```bash
cd backend
npm test          # chay tat ca *.test.js trong src/
npm run test:filter   # rieng bo loc noi dung
```

| File | Test gì |
| --- | --- |
| `utils/vanBan.test.js` | `taoSlug`, `tachTags` — 10 test |
| `middlewares/cacheControl.test.js` | Chỉ đặt header cho `GET`, `s-maxage`/`stale-while-revalidate` — 6 test |
| `middlewares/authMiddleware.test.js` | `admin` và `instructor` chặn đúng vai trò, trả 403 chứ không 401 — 5 test |
| `middlewares/loginRateLimit.test.js` | Chặn dò mật khẩu theo `ip\|email` **và** theo `ip`, đăng nhập đúng không làm mới hạn mức IP — 7 test |
| `utils/truyVan.test.js` | `phanTrang` chặn `page` âm và `limit` quá lớn, `thoatRegex` giữ ký tự đặc biệt là chữ — 17 test |
| `middlewares/idHopLe.test.js` | Chặn id sai định dạng, **không** đụng vào tham số dạng slug — 7 test |
| `middlewares/chongCsrf.test.js` | Ghi từ origin lạ bị 403, đọc thì không, thiếu `Origin` vẫn qua — 6 test |
| `utils/cookieToken.test.js` | Cookie luôn `httpOnly`, `SameSite=None` luôn kèm `Secure`, xoá đúng bộ thuộc tính đã đặt — 9 test |
| `utils/contentFilter.test.js` | Bộ lọc nội dung, có sẵn từ trước — 1 test |

Cả chín đều là **hàm thuần**: không mở kết nối CSDL, không gọi Cloudinary, nên
CI chạy được mà không cần một bí mật nào.

`protect` cố ý **không** có test: nó phải giải mã JWT rồi tra `User` trong CSDL,
muốn test tử tế phải dựng CSDL thử — việc khác, chưa làm.

**Viết test lôi ra ngay một lỗi.** `taoSlug(null)` trả về chuỗi `"null"` làm
đường dẫn. Bản cũ trong controller còn tệ hơn: nó viết `(s = '')` rồi gọi
`s.normalize()`, mà tham số mặc định chỉ chạy với `undefined` chứ không với
`null` — tức là **ném `TypeError`**. Nay dùng `chuoi ?? ''`.

Nhân tiện, `slugHoa` trước đây bị **chép ở cả `postController` lẫn
`documentController`**, khác nhau đúng hai chỗ (độ dài tối đa và chuỗi dự phòng).
Đã gộp về `utils/vanBan.js` với tham số — sửa một lần là cả hai cùng đúng.

### Đã cân nhắc và quyết định chưa làm

- **Tái cấu trúc cây thư mục.** Cấu trúc hiện tại không đẹp nhưng đang chạy
  được. Dời file hàng loạt tạo diff không review nổi và không sửa được lỗi nào.
  Chỉ nắn lại từng phần khi đã có việc động vào phần đó.
- **Thêm state manager.** Chưa có màn hình nào cần chia sẻ state phức tạp tới
  mức đó. `apiHelper` đã lo phần gộp request và cache.

---

## Phụ lục — Kiểm lại các con số trong tài liệu này

```bash
# Số trang
find frontend/app -name page.tsx | wc -l

# Số endpoint — phải đếm cả các verb nối sau router.route(), nếu chỉ
# grep "^router\." sẽ ra thiếu
node -e "const fs=require('fs');let n=0;\
for(const f of fs.readdirSync('backend/src/routes')){\
  const s=fs.readFileSync('backend/src/routes/'+f,'utf8');\
  n+=(s.match(/router\.(get|post|put|patch|delete)\(/g)||[]).length;\
  for(const b of s.match(/router\.route\([^)]*\)[\s\S]*?;/g)||[])\
    n+=(b.match(/\.(get|post|put|patch|delete)\(/g)||[]).length;\
}console.log(n)"

# Lỗi và cảnh báo lint — dòng tổng kết nằm ở cuối output
cd frontend && npx eslint

# Component dùng chung có thật sự được dùng không
# (Button/Card/Input da xoa o muc 14 -> ra 0 la dung)
grep -rl "components/ui/Button" --include=*.tsx frontend/app frontend/src | wc -l

# So dong ma
find frontend/app frontend/src \( -name '*.ts' -o -name '*.tsx' \) -exec cat {} + | wc -l
find backend/src backend/index.js -name '*.js' -exec cat {} + | wc -l

# So test backend
cd backend && npm test 2>&1 | grep -E "^. (tests|pass|fail)"
```

Ra số khác README là README cũ. Sửa README.
