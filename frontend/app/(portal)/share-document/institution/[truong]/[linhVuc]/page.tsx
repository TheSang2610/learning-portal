import { notFound } from "next/navigation";

import ShareDocumentClient, {
  type BoLoc,
} from "@/src/components/document/ShareDocumentClient";
import {
  docLoai,
  docTuKhoa,
  doiKhoa,
  layChiTietTruong,
  layDsMon,
  layDsNhom,
  layDsTruong,
  layTrangDau,
} from "@/src/components/document/taiLieuMayChu";

import styles from "../../../all-document/page.module.scss";

type Params = Promise<{ truong: string; linhVuc: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Truong + linh vuc tren dia chi -> ban ghi that; khong co thi null (404). */
async function timPhamVi(params: Params) {
  const p = await params;
  const khoaTruong = doiKhoa(p.truong);
  const khoaNhom = doiKhoa(p.linhVuc);
  const [dsTruong, dsNhom] = await Promise.all([layDsTruong(), layDsNhom()]);
  const truong = dsTruong.find((t) => t.key === khoaTruong);
  const nhom = dsNhom.find((n) => n.key === khoaNhom);
  return truong && nhom ? { truong, nhom, dsTruong, dsNhom } : null;
}

export async function generateMetadata({ params }: { params: Params }) {
  const pv = await timPhamVi(params);
  if (!pv) return { title: "Không tìm thấy" };
  return {
    title: `${pv.nhom.ten} - ${pv.truong.ten}`,
    description: `Tài liệu ${pv.nhom.ten} do sinh viên ${pv.truong.ten} chia sẻ.`,
  };
}

/**
 * Tai lieu mot linh vuc cua mot truong:
 * /share-document/institution/<khoa-truong>/<khoa-linh-vuc>?mon=&q=&loai=
 *
 * Cung giao dien trang tat ca tai lieu, bo loc truong + linh vuc dat san.
 */
export default async function InstitutionCategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [pv, sp] = await Promise.all([timPhamVi(params), searchParams]);
  if (!pv) notFound();

  const loc: BoLoc = {
    q: docTuKhoa(sp.q),
    mon: doiKhoa(sp.mon),
    nhom: pv.nhom.key,
    truong: pv.truong.key,
    loai: docLoai(sp.loai),
  };
  const [initialData, dsMon, ct] = await Promise.all([
    layTrangDau(loc),
    layDsMon(),
    layChiTietTruong(pv.truong.key),
  ]);
  // Mon cua truong trong linh vuc nay - o chon mon va o "N môn học".
  const monPhamVi = (ct?.monHoc ?? [])
    .filter((m) => m.nhom === pv.nhom._id)
    .map(({ key, ten, soTaiLieu }) => ({ key, ten, soTaiLieu }));

  return (
    <div className={styles.page}>
      <ShareDocumentClient
        key={`${loc.q}|${loc.mon}|${loc.nhom}|${loc.truong}|${loc.loai}`}
        initialData={initialData}
        boLocBanDau={loc}
        dsNhom={pv.dsNhom}
        dsTruong={pv.dsTruong}
        dsMonBanDau={dsMon}
        phamVi={{ truong: pv.truong.key, nhom: pv.nhom.key }}
        monPhamVi={monPhamVi}
      />
    </div>
  );
}
