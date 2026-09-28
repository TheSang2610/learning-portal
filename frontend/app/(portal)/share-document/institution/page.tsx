import InstitutionDirectory from "@/src/components/document/InstitutionDirectory";
import type { DocumentUniversity } from "@/src/services/document";
import { GOC_API } from "@/src/services/serverFetch";

export const metadata = {
  title: "Trường đại học",
  description:
    "Tìm trường đại học của bạn và xem tài liệu học tập do sinh viên trường đó chia sẻ.",
};

// Danh sach truong va so tai lieu doi cham - luu 60 giay nhu API.
export const revalidate = 60;

async function layDsTruong(): Promise<DocumentUniversity[]> {
  try {
    const res = await fetch(`${GOC_API}/api/documents/truong`, {
      next: { revalidate: 60 },
    });
    return res.ok ? ((await res.json()) as DocumentUniversity[]) : [];
  } catch {
    // Backend chet thi tra rong chu khong nem - nem se lam hong luot build.
    return [];
  }
}

/**
 * Danh sach truong (/share-document/institution) - nut "Xem tat ca" o khung
 * "Truong dai hoc" tai /share-document dan toi day.
 */
export default async function InstitutionPage() {
  return <InstitutionDirectory dsTruong={await layDsTruong()} />;
}
