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
| Styling   | CSS Module SCSS (Sass)                                 |
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

Ứng dụng có **ba khu**: quản trị (`/admin/*`), giảng viên (`/instructor/*`) và
học viên (mọi trang còn lại). URL phẳng — mỗi trang một đoạn sau tên khu, không
lồng nhau (`/admin/course-create`, không phải `/admin/courses/create`).

### Cây thư mục

```
learning-portal-frontend/
├── app/                          # Routing. CHỈ page, layout, route API.
│   ├── layout.tsx                # Root DUY NHẤT: <html>/<body> + globals.css
│   ├── layout.module.scss
│   ├── globals.css               # Bảng màu, biến font, reset
│   ├── styles/                   # base.css, tokens.css, _breakpoints.scss
│   ├── api/auth/google/          # Route handler đăng nhập Google
│   │
│   ├── admin/                    # "/admin/*"  — 32 trang
│   │   ├── layout.tsx            #   AdminShell (sidebar + breadcrumb)
│   │   ├── dashboard/page.tsx    #   "/admin/dashboard"
│   │   ├── courses/page.tsx      #   "/admin/courses"
│   │   └── ...
│   │
│   ├── instructor/               # "/instructor/*" — 10 trang
│   │   ├── layout.tsx            #   InstructorShell
│   │   ├── page.tsx              #   chuyển hướng sang /instructor/courses
│   │   └── courses/page.tsx ...
│   │
│   └── (portal)/                 # Khu học viên. Ngoặc tròn = KHÔNG vào URL;
│       ├── layout.tsx            #   chỉ để gắn header/footer + font riêng.
│       ├── page.tsx              #   "/"  ← trang mẫu, xem đây trước
│       ├── help/page.tsx         #   "/help"
│       ├── course/page.tsx       #   "/course?slug=..."
│       ├── user/profile/page.tsx #   "/user/profile"
│       └── ...                   #   30 trang
│
├── public/                       # Ảnh tĩnh (ảnh chụp màn hình trang chủ, logo)
│
└── src/
    ├── components/
    │   ├── ui/                   # Mảnh giao diện nhỏ, không biết gì về nghiệp vụ:
    │   │                         #   Avatar, SafeImage, CopyButton, Pager, RichText
    │   ├── common/               # Khối dùng chung nhiều trang: SectionHeading,
    │   │                         #   CourseCard, FaqSection, FeedCard, CoinBalance,
    │   │                         #   RichTextEditor, UserBootstrap...
    │   ├── layout/               # Header, Footer, TopNav + headers/ (header theo khu)
    │   └── features/             # Mỗi trang một thư mục, chia theo khu:
    │       ├── admin/            #   <trang>/ + layout/ (AdminShell)
    │       ├── instructor/       #   <trang>/ + layout/ (InstructorShell)
    │       ├── portal/           #   <trang>/ + layout/ (PortalShell)
    │       └── shared/           #   Trang admin và giảng viên dùng chung
    │                             #   (lesson-create, quiz-create, quiz-edit — prop `role`)
    │
    ├── constants/                # Nội dung tĩnh của từng trang
    │   ├── admin/                #   <trang>-page.ts + menu.ts
    │   ├── instructor/           #   <trang>-page.ts + menu.ts
    │   ├── portal/               #   <trang>-page.ts + layout.ts
    │   ├── shared/               #   <trang>-page.ts
    │   └── common.ts course.ts quiz.ts   # chữ dùng chung nhiều khu
    │
    ├── hooks/                    # Hook dùng chung: userStore, cart, savedStore,
    │                             #   useFaqManager, useQuizQuestions, useCourseLessons
    ├── services/                 # 31 tệp gọi API, mỗi tệp một miền dữ liệu
    ├── lib/                      # Hàm thuần, không phụ thuộc React:
    │                             #   format, date, time, slug, post-html, document/...
    └── types/                    # Type dùng chung: home, help, legal, gpa, cart...
```

### Một thư mục feature

```
src/components/features/portal/home/
├── index.ts                 # Cửa duy nhất — page.tsx chỉ import từ đây
├── HomeHero.tsx             # Section: mỗi file một khối của trang
├── HomeHero.module.scss
├── HomeCategories.tsx
├── ...
├── data.ts                  # (trang server) lấy dữ liệu ở máy chủ
├── hooks/                   # (trang client) logic + state: useCart, usePayment...
└── parts/                   # Mảnh nhỏ chỉ section của trang này dùng
```

### page.tsx gọi section như thế nào

Trang nội dung (trang chủ, blog, help, privacy, terms, GPA, chia sẻ tài liệu)
**liệt kê từng section** và truyền nội dung từ constants:

```tsx
// app/(portal)/help/page.tsx
import {
  HelpContact,
  HelpFaqList,
  HelpHero,
  HelpShell,
} from "@/src/components/features/portal/help";
import { HELP_PAGE } from "@/src/constants/portal/help-page";

export default function HelpPage() {
  return (
    <HelpShell>
      <HelpHero {...HELP_PAGE.hero} />
      <HelpFaqList {...HELP_PAGE.faq} />
      <HelpContact {...HELP_PAGE.contact} />
    </HelpShell>
  );
}
```

`...Shell` là khung nền + cột giữa của trang. Các section nằm bên trong khung đó,
nhờ vậy page.tsx đọc lên là thấy ngay trang gồm những khối nào, theo thứ tự nào.

Trang **nhiều trạng thái dùng chung** (giỏ hàng, thanh toán, phòng học, các bảng
CRUD của admin) thì page.tsx gọi **một** component của feature. Lý do: `page.tsx`
là Server Component, không giữ được state; state nằm trong hook của feature
(`hooks/useCart.ts`...) rồi chia xuống các `parts/`.

```tsx
// app/(portal)/cart/page.tsx
import { Cart } from "@/src/components/features/portal/cart";

export default function CartPage() {
  return <Cart />;
}
```

### Quy ước đặt tên

| Loại                     | Quy ước                                   | Ví dụ                                  |
| ------------------------ | ----------------------------------------- | -------------------------------------- |
| File component           | `PascalCase.tsx`, default export cùng tên | `HomeHero.tsx`                         |
| Section trong feature    | Tiền tố theo trang                        | `HomeHero`, `HelpFaqList`, `BlogPager` |
| Khung trang              | Hậu tố `Shell`                            | `HelpShell`, `AdminShell`              |
| SCSS                     | Cùng tên component, `.module.scss`        | `HomeHero.module.scss`                 |
| Hook                     | `useCamelCase.ts`, named export           | `useCart.ts`                           |
| Hằng số                  | `SCREAMING_SNAKE_CASE`                    | `HOME_PAGE`, `ADMIN_MENU`              |
| File constants           | `<khu>/<trang>-page.ts` (kebab)           | `portal/home-page.ts`                  |
| Type gói nội dung 1 khối | Hậu tố `Data`                             | `HomeHeroData`, `HelpFaqData`          |
| Khoá object nội dung     | Tiếng Anh                                 | `description`, không phải `moTa`       |
| Chú thích trong code     | Tiếng Việt không dấu                      | `// Lay du lieu o may chu`             |

**Nội dung truyền xuống Client Component phải là dữ liệu thuần.** Hàm (kể cả
`(n) => \`${n} khoá học\``) không đi qua ranh giới server → client được — build
sẽ hỏng. Chữ có biến thì viết bằng mẫu `"{n} khoá học"`và điền bằng`fillTemplate`trong`src/lib/format.ts`. Section chạy trên máy chủ (không có
`"use client"`) thì dùng hàm bình thường.

### Thêm một trang mới

1. Tạo `app/<khu>/<trang>/page.tsx` (khu học viên: `app/(portal)/<trang>/page.tsx`).
2. Tạo `src/components/features/<khu>/<trang>/` với `index.ts` và các section.
3. Đưa toàn bộ chữ, đường dẫn, đường API vào `src/constants/<khu>/<trang>-page.ts`.
4. Trang admin: thêm mục vào `src/constants/admin/menu.ts` để hiện trên sidebar.

### Hai điều dễ nhầm

- **Chỉ có MỘT root layout** (`app/layout.tsx`). Trước đây mỗi khu tự dựng
  `<html>` trong nhóm route `(admin)` / `(instructor)` / `(portal)`. Giờ admin và
  instructor nằm thẳng ở `app/admin`, `app/instructor`. Chỉ khu học viên còn nhóm
  `(portal)`, vì nó cần header/footer riêng mà không thêm đoạn nào vào URL.
- **Font Be Vietnam Pro / Lexend chỉ áp cho khu học viên.** Biến font được đặt trên
  thẻ bọc của `(portal)/layout.tsx` (CSS: `PortalShell.module.scss`), không đặt
  trên `<html>`, nên trang quản trị vẫn dùng Inter.

`app/` nằm ở thư mục gốc chứ không phải trong `src/` — Next hỗ trợ cả hai, đây là
lựa chọn có chủ đích.

Mỗi tệp trong `services/` gói trọn một miền dữ liệu. Component **không tự gọi
`fetch`** — luôn đi qua service (hoặc `data.ts` của feature với trang server), để
khi đổi cách xác thực chỉ phải sửa một chỗ.

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

# phiên bản thật của Next / React
node -e "const p=require('./package.json');console.log(p.dependencies.next,p.dependencies.react)"
```
