# Learning Portal

Nền tảng học trực tuyến: học viên mua và học khoá học, giảng viên soạn bài,
quản trị duyệt nội dung và xác nhận thanh toán.

**Xem thử:** https://learning-portal-s.vercel.app
**API:** https://learning-portal-backend-ten.vercel.app

```
frontend/    Next.js 16 · React 19 · Tailwind v4 · TypeScript
backend/     Express 5 · Mongoose 9 · MongoDB Atlas · JWT trong cookie httpOnly
```

Mỗi thư mục có README riêng, đọc kỹ hơn ở đó:
[frontend](frontend/README.md) · [backend](backend/README.md)

---

## Chạy tại máy

Hai cửa sổ dòng lệnh, backend chạy trước.

```bash
# cua so 1
cd backend
npm install
cp .env.example .env      # rồi điền giá trị thật
npm run dev               # → http://localhost:5000

# cua so 2
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
npm run dev               # → http://localhost:3000
```

Cần **Node >= 20.9** (yêu cầu tối thiểu của Next 16).

---

## Kiểm tra trước khi đẩy

```bash
cd frontend && npm run verify    # format + lint + typecheck + build
cd backend  && npm test          # 158 test
```

CI chạy đúng hai lệnh đó, tách thành **hai job song song** — frontend hỏng thì
vẫn biết backend còn xanh hay không.

---

## Vài quyết định kỹ thuật đáng chú ý

Ghi ở đây những chỗ nhìn qua tưởng làm phức tạp thừa, nhưng bỏ đi là mở lại một
lỗ hổng đã từng có thật.

**Nội dung có phí đi qua đúng một cửa.** `backend/src/utils/quyenNoiDung.js`
xuất ra `duocXemNoiDung(course, user)`, và mọi đường trả về nội dung bài học đều
phải gọi nó. Trước đây cổng 402 chỉ đặt ở đường ghi danh, còn đường đọc bài thì
không kiểm gì — mở một tài khoản miễn phí rồi gọi thẳng `GET /api/lessons/:id`
là lấy được video của khoá có phí.

**Trừ tiền bằng một lệnh ghi duy nhất.** Điều kiện đủ tiền nằm *bên trong* lệnh
`findOneAndUpdate` chứ không phải một lệnh đọc riêng trước đó, nên hai yêu cầu
chạy song song không thể cùng thấy "đủ tiền" rồi cùng trừ.

**Token trong cookie `httpOnly`.** JavaScript không đọc được, nên một lỗi XSS
cũng không lấy được phiên đăng nhập. Đổi lại phải tự lo CSRF: frontend và API
khác site nên cookie buộc phải `sameSite: 'none'`, và
`backend/src/middlewares/chongCsrf.js` là lớp chặn duy nhất còn lại.

**Lọc HTML theo dấu hiệu, không theo hình dạng.** Bộ lọc từng chỉ chạy khi chuỗi
"trông giống bài viết", mà danh sách nhận diện lại không có `script` — nên một
nội dung chỉ gồm `<script>` được xếp là văn bản thường và lưu nguyên vẹn. Giờ nó
lọc khi thấy dấu hiệu nguy hiểm, bất kể chuỗi trông giống gì.

---

## Triển khai

Hai project Vercel riêng, mỗi cái build một thư mục:

| thư mục | project | địa chỉ |
|---|---|---|
| `frontend/` | `learning-portal-s` | learning-portal-s.vercel.app |
| `backend/` | `learning-portal-s-api` | learning-portal-backend-ten.vercel.app |

Hiện deploy bằng tay, chạy `npx vercel --prod` **trong đúng thư mục con**.

Khi nào nối Git integration thì mỗi project phải đặt **Root Directory** trỏ vào
thư mục con của nó — bỏ bước đó thì Vercel build từ gốc và không tìm thấy
`package.json` nào.
