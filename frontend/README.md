# Learning Portal — Frontend

Giao diện nền tảng học trực tuyến: học viên mua và học khoá học, giảng viên soạn
bài, quản trị duyệt nội dung và xác nhận thanh toán.

**Xem thử:** https://learning-portal-s.vercel.app
**API:** https://learning-portal-backend-ten.vercel.app

Backend nằm ở [`../backend`](../backend/README.md) trong cùng kho mã nguồn này.

---

## Công nghệ

|           |                                                        |
| --------- | ------------------------------------------------------ |
| Framework | Next.js **16.2.5** — App Router, Turbopack             |
| UI        | React **19.2.4**, TypeScript                           |
| Styling   | Tailwind CSS **v4**                                    |
| Kiểm tra  | ESLint, Prettier, `tsc --noEmit`, chạy tự động trên CI |

Cần **Node >= 20.9** (yêu cầu tối thiểu của Next 16).

---

## Chạy tại máy

Backend phải chạy trước, nếu không mọi trang có dữ liệu sẽ trống.

```bash
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
npm run dev
```

Mở http://localhost:3000.

### Biến môi trường

`.env.local` **không** được commit. Ba biến dưới đây đều là `NEXT_PUBLIC_`, nghĩa
là chúng bị nhúng thẳng vào mã JavaScript gửi xuống trình duyệt — **tuyệt đối
không đặt bí mật nào vào đây**.

| Biến                            | Bắt buộc | Ý nghĩa                                      |
| ------------------------------- | -------- | -------------------------------------------- |
| `NEXT_PUBLIC_API_URL`           | có       | Địa chỉ gốc của backend                      |
| `NEXT_PUBLIC_BACKEND_URL`       | không    | Dùng khi ảnh và tệp tĩnh nằm ở host khác API |
| `NEXT_PUBLIC_GOI_THANG_BACKEND` | không    | Bật gọi thẳng backend, bỏ qua lớp proxy      |

Biến `NEXT_PUBLIC_*` được cố định **lúc build**, không phải lúc chạy. Đổi giá trị
trên Vercel xong phải deploy lại thì mới có tác dụng.

---

## Các lệnh

```bash
npm run dev          # máy chủ phát triển
npm run build        # bản production
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm run format       # Prettier ghi đè
npm run verify       # format:check + lint + typecheck + build
```

`npm run verify` là cổng kiểm cuối trước khi đẩy. Nó chạy cả `build`, nên chậm
hơn hẳn ba lệnh kia — nhưng đó chính là điểm: lỗi chỉ lộ ra lúc build thì phải
bắt ở máy, đừng để CI bắt hộ.

---

## Cấu trúc

```
app/                 App Router — 56 trang, 4 nhóm route
  (admin)/           khu quản trị
  (portal)/          khu học viên
  ...
src/
  components/        13 nhóm: admin auth certificate common courses
                     document gpa home layout profile quiz settings ui
  services/          21 tệp gọi API, mỗi tệp một miền dữ liệu
  hooks/             hook dùng chung
```

`app/` nằm ở thư mục gốc chứ không phải trong `src/` — Next hỗ trợ cả hai, đây là
lựa chọn có chủ đích và đừng di chuyển nó, vì mọi đường dẫn tương đối trong
`app/` đang dựa vào vị trí này.

Mỗi tệp trong `services/` gói trọn một miền dữ liệu. Component **không tự gọi
`fetch`** — luôn đi qua service, để khi đổi cách xác thực chỉ phải sửa một chỗ.

---

## Vài quyết định kỹ thuật đáng chú ý

**Token nằm trong cookie `httpOnly`, không nằm trong `localStorage`.**
JavaScript không đọc được cookie đó, nên một lỗi XSS bất kỳ cũng không lấy được
phiên đăng nhập. Đổi lại, mọi lời gọi API phải kèm `credentials: 'include'` và
backend phải khai báo `sameSite` cho đúng.

**Nội dung có phí được chặn ở phía máy chủ, không phải phía giao diện.**
Ẩn nút trên giao diện không phải là bảo mật — người dùng vẫn gọi thẳng API được.
Backend là nơi quyết định, frontend chỉ hiển thị theo cờ `bị khoá` mà API trả về.

**`services/serverFetch.ts` tách riêng cho Server Component.**
Component chạy trên máy chủ không có cookie của trình duyệt, phải chuyển tiếp
header thủ công. Trộn chung với hàm gọi phía client là nguồn lỗi khó tìm.

---

## Triển khai

Đang chạy trên Vercel, project `learning-portal-s`.

Tính tới 07/09/2026, **Git integration chưa được nối** vào repo này, nên đẩy
`main` sẽ _không_ tự deploy. Cập nhật bằng tay:

```bash
npx vercel --prod
```

Nối được Git rồi thì xoá đoạn ghi chú này đi.

---

## Kiểm lại các con số ở trên

Đừng tin số trong tài liệu — tài liệu luôn cũ hơn mã. Đếm lại:

```bash
# số trang
find . -name 'page.tsx' -not -path './node_modules/*' | wc -l

# số tệp service
ls src/services/ | wc -l

# phiên bản thật của Next / React / Tailwind
node -e "const p=require('./package.json');console.log(p.dependencies.next,p.dependencies.react)"
```
