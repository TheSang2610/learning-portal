import { notFound } from "next/navigation";

import InstitutionDetail from "@/src/components/document/InstitutionDetail";
import type { ChiTietTruong } from "@/src/services/document";
import { GOC_API } from "@/src/services/serverFetch";
import { doiKhoa } from "@/src/components/document/taiLieuMayChu";

// Mon hoc va so tai lieu doi cham - luu 60 giay nhu API.
export const revalidate = 60;

// Dia chi dung "hoc-vien-cong-nghe-..."; may chu doc duoc ca dang co "-".
type Params = Promise<{ truong: string }>;

/**
 * null = khong co truong nay (404). Loi khac (backend chet...) thi NEM: bao
 * "khong co truong" trong khi truong co that se lam nguoi dung tuong link sai.
 */
async function layTruong(khoa: string): Promise<ChiTietTruong | null> {
  const res = await fetch(`${GOC_API}/api/documents/truong/${encodeURIComponent(khoa)}`, {
    next: { revalidate: 60 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Không tải được trường (${res.status})`);
  return (await res.json()) as ChiTietTruong;
}

export async function generateMetadata({ params }: { params: Params }) {
  const { truong } = await params;
  const kq = await layTruong(doiKhoa(truong)).catch(() => null);
  if (!kq) return { title: "Không tìm thấy trường" };
  return {
    title: `${kq.truong.ten} - tài liệu theo môn học`,
    description: `Đề cương, đề thi, bài giải và slide môn học của ${kq.truong.ten} do sinh viên chia sẻ.`,
  };
}

/** Trang mot truong: /share-document/institution/<khoa>. */
export default async function InstitutionDetailPage({ params }: { params: Params }) {
  const khoa = doiKhoa((await params).truong);
  const kq = await layTruong(khoa);
  if (!kq) notFound();
  return <InstitutionDetail {...kq} />;
}
