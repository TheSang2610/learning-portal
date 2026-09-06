import ShareDocumentClient from "@/src/components/document/ShareDocumentClient";
import TieuDeMuc from "@/src/components/home/TieuDeMuc";
import type { DocumentListResponse } from "@/src/services/document";
import { GOC_API } from "@/src/services/serverFetch";

export const metadata = {
  title: "Chia sẻ tài liệu",
  description:
    "Tải lên và tải về tài liệu học tập: đề cương, đề thi, bài giải, slide bài giảng.",
};

// Danh sach doi theo tung bai dang moi, nen khong the dung trang tinh vinh vien.
// 30 giay la muc dung hoa: nguoi vua dang van thay bai cua minh ngay (client tu
// tai lai sau khi dang xong), con nguoi vao xem thi dung ban da dung san.
export const revalidate = 30;

const RONG: DocumentListResponse = { documents: [], total: 0, page: 1, totalPages: 1 };

// Lay san trang dau ngay tren may chu, thay vi de trinh duyet goi sau khi
// hydrate. Nho vay danh sach nam san trong HTML - nguoi dung thay noi dung
// ngay, va may tim kiem doc duoc.
//
// Backend chet thi tra ve danh sach rong chu KHONG duoc nem loi: nem loi o day
// se lam hong ca luot build tren Vercel.
async function layTrangDau(): Promise<DocumentListResponse> {
  try {
    const res = await fetch(`${GOC_API}/api/documents?page=1&limit=12`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return RONG;
    return (await res.json()) as DocumentListResponse;
  } catch {
    return RONG;
  }
}

export default async function ShareDocumentPage() {
  const initialData = await layTrangDau();

  return (
    // Nen trang va tieu de dat cung mot khung max-w-7xl px-6 voi
    // ShareDocumentHeader, giong het trang /blog.
    <div className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-7xl px-6">
        <TieuDeMuc
          nhu="h1"
          tieuDe="Chia sẻ tài liệu"
          moTa="Đăng đề cương, đề thi, bài giải hay slide bài giảng để mọi người cùng xem và tải về."
        />
      </div>

      <ShareDocumentClient initialData={initialData} />
    </div>
  );
}
