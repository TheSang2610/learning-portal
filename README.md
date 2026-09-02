# aLMS — Frontend

Next.js 16 (App Router + Turbopack), React 19, Tailwind v4.

**Tài liệu đầy đủ nằm ở [`../README.md`](../README.md)** — kiến trúc, quy ước,
danh sách API, quy trình PR và nợ kỹ thuật đều ở đó. Đọc trước khi sửa mã.

## Chạy nhanh

Cần Node **>= 20.9** (Next 16 bắt buộc). Backend phải chạy trước.

```bash
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
npm run dev          # → http://localhost:3000
```

## Trước khi commit

```bash
npm run verify       # format:check + lint + typecheck + build
```

Ba điều dễ vấp nhất, chi tiết trong tài liệu chính:

- Ảnh lấy từ API phải dùng `SafeImage`, không dùng `next/image` trực tiếp
  ([mục 8](../README.md#8-ảnh))
- Mọi lời gọi API nằm trong `src/services/`, không `fetch` trong component
  ([mục 4.3](../README.md#43-tầng-services--mọi-lời-gọi-api-đi-qua-đây))
- `npm run lint` có trần cảnh báo, con số chỉ được phép giảm
  ([mục 10.2](../README.md#102-vì-sao-lint-có-trần-cảnh-báo))
