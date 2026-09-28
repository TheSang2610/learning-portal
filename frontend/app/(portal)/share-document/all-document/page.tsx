import ShareDocumentClient, {
  type BoLoc,
} from "@/src/components/document/ShareDocumentClient";
import {
  docLoai,
  docTuKhoa,
  doiKhoa,
  layDsMon,
  layDsNhom,
  layDsTruong,
  layTrangDau,
} from "@/src/components/document/taiLieuMayChu";

import styles from "./page.module.scss";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const mon = doiKhoa(sp.mon);
  const nhom = doiKhoa(sp.nhom);
  const truong = doiKhoa(sp.truong);
  // Cung thu tu uu tien voi tieu de trang: mon > linh vuc > truong.
  const ten = mon
    ? (await layDsMon()).find((m) => m.key === mon)?.ten
    : nhom
      ? (await layDsNhom()).find((n) => n.key === nhom)?.ten
      : truong
        ? (await layDsTruong()).find((t) => t.key === truong)?.ten
        : undefined;
  return {
    title: ten ? `Tài liệu ${ten}` : "Tất cả tài liệu",
    description:
      "Tìm đề cương, đề thi, bài giải và slide bài giảng do sinh viên chia sẻ.",
  };
}

/** Tat ca tai lieu: /share-document/all-document?q=&mon=&nhom=&truong=&loai= */
export default async function AllDocumentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const loc: BoLoc = {
    q: docTuKhoa(sp.q),
    mon: doiKhoa(sp.mon),
    nhom: doiKhoa(sp.nhom),
    truong: doiKhoa(sp.truong),
    loai: docLoai(sp.loai),
  };
  const [initialData, dsNhom, dsTruong, dsMon] = await Promise.all([
    layTrangDau(loc),
    layDsNhom(),
    layDsTruong(),
    layDsMon(),
  ]);

  return (
    <div className={styles.page}>
      {/* key theo bo loc: bam link sang bo loc khac (vd. tu trang chu khu tai
          lieu) thi client dung lai tu dau voi du lieu moi, khong giu state cu. */}
      <ShareDocumentClient
        key={`${loc.q}|${loc.mon}|${loc.nhom}|${loc.truong}|${loc.loai}`}
        initialData={initialData}
        boLocBanDau={loc}
        dsNhom={dsNhom}
        dsTruong={dsTruong}
        dsMonBanDau={dsMon}
      />
    </div>
  );
}
