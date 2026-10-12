"use client";

import { useEffect, useState } from "react";

import { useStoredUser } from "@/src/hooks/userStore";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  documentService,
  type HistoryItem,
  type RecommendedDocument,
  type SharedDocument,
} from "@/src/services/document";
import DocumentShelf from "./DocumentShelf";

import styles from "./DocumentShelf.module.scss";

const SHELF_SIZE = 12;

/**
 * Cac hang cuon ngang duoi danh sach tai lieu - dung chung cho trang tat ca
 * tai lieu, trang mot truong va trang linh vuc cua truong:
 *   Goi y cho ban  - rieng tung nguoi (da dang nhap, co lich su, trang chung)
 *   Noi bat        - xem + tai nhieu nhat TRONG pham vi dang xem, cho moi nguoi
 *   Xem gan day    - lich su cua chinh minh (day du, khong theo bo loc)
 *   Moi dang       - bai moi nhat trong pham vi dang xem
 */
export default function DocumentShelves({
  query = {},
  scopeName,
}: {
  /** Pham vi: truong / linh vuc / mon (khoa). Trong = ca kho. */
  query?: { truong?: string; nhom?: string; mon?: string };
  /** Ten pham vi de ghi vao tieu de hang, vd. ten truong. */
  scopeName?: string;
}) {
  const user = useStoredUser();
  const idUser = user?._id;
  const { truong: school = "", nhom: group = "", mon: subjectItem = "" } = query;
  const course = `${school}|${group}|${subjectItem}`;
  const sharedPage = !school && !group && !subjectItem;

  const [featured, setFeatured] = useState<SharedDocument[]>([]);
  const [newest, setNewest] = useState<SharedDocument[]>([]);
  // Gan kem id nguoi dung: dang xuat / doi tai khoan thi du lieu cu tu an.
  const [suggest, setSuggest] = useState<{
    id: string;
    ds: RecommendedDocument[];
  } | null>(null);
  const [history, setHistory] = useState<{ id: string; ds: HistoryItem[] } | null>(null);

  // Hang theo pham vi - giong nhau voi moi nguoi.
  useEffect(() => {
    let cancel = false;
    const [t, n, m] = course.split("|");
    const pv = { truong: t, nhom: n, mon: m, limit: SHELF_SIZE };
    documentService
      .getDocuments({ ...pv, sapXep: "phoBien" })
      .then((outcome) => {
        if (!cancel) setFeatured(outcome.documents);
      })
      .catch(() => {});
    documentService
      .getDocuments(pv)
      .then((outcome) => {
        if (!cancel) setNewest(outcome.documents);
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, [course]);

  // Hang rieng tung nguoi.
  useEffect(() => {
    if (!idUser) return;
    let cancel = false;
    documentService
      .getRecommendations({ limit: SHELF_SIZE })
      .then((outcome) => {
        // Chi goi la "goi y cho ban" khi may chu THAT SU dua tren lich su.
        if (!cancel)
          setSuggest({ id: idUser, ds: outcome.caNhanHoa ? outcome.documents : [] });
      })
      .catch(() => {});
    documentService
      .getMyHistory()
      .then((outcome) => {
        if (!cancel) setHistory({ id: idUser, ds: outcome.items.slice(0, SHELF_SIZE) });
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, [idUser]);

  const clearHistory = async () => {
    if (!confirm("Xóa toàn bộ lịch sử xem và tìm tài liệu của bạn?")) return;
    try {
      await documentService.clearMyHistory();
      if (idUser) setHistory({ id: idUser, ds: [] });
    } catch (err) {
      alert(getErrorMessage(err, "Không xóa được lịch sử."));
    }
  };

  // Kiem idUser truoc: khach thi ca hai deu undefined, so bang nhau van "dung".
  const suggestionList =
    sharedPage && idUser && suggest && suggest.id === idUser ? suggest.ds : [];
  const historyList = idUser && history?.id === idUser ? history.ds : [];

  return (
    <>
      <DocumentShelf
        id="goi-y"
        tieuDe="Gợi ý cho bạn"
        phu="Dựa trên những môn bạn hay xem và tải"
        ds={suggestionList}
      />
      <DocumentShelf
        id="noi-bat"
        tieuDe={scopeName ? `Nổi bật ở ${scopeName}` : "Nổi bật"}
        phu="Được xem và tải nhiều nhất"
        ds={featured}
        chan="phoBien"
      />
      <DocumentShelf
        id="xem-gan-day"
        tieuDe="Xem gần đây"
        ds={historyList}
        chan="thoiGian"
        actions={
          <button type="button" onClick={clearHistory} className={styles.textButton}>
            Xóa lịch sử
          </button>
        }
      />
      <DocumentShelf
        id="moi-dang"
        tieuDe={scopeName ? `Mới đăng ở ${scopeName}` : "Mới đăng"}
        ds={newest}
        chan="thoiGian"
      />
    </>
  );
}
