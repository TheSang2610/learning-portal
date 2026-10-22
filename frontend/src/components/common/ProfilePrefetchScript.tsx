import { PROFILE_PATH } from "@/src/services/apiBase";

/**
 * Ban luot goi "toi la ai" di NGAY, truoc ca khi React gan vao trang.
 *
 * Van de: <UserBootstrap /> goi trong useEffect, ma useEffect chi chay SAU khi
 * toan bo goi JavaScript da tai ve, phan tich xong va hydrate xong. Tuc la
 * luot goi mang chi bat dau o cuoi hang doi, roi con phai cho may chu tra loi
 * - trong suot thoi gian do goc phai thanh dieu huong la mot o TRONG.
 *
 * The nay thi luot goi khoi hanh ngay khi trinh duyet doc toi dong nay, chay
 * SONG SONG voi viec tai JavaScript thay vi noi duoi no. <UserBootstrap /> chi
 * viec nhan lai loi hua da bay san.
 *
 * Trong the nay khong co mot chut du lieu nguoi dung nao - no chi mo mot ket
 * noi. An toan de dat thang vao HTML tinh.
 *
 * CHI dat trong app/layout.tsx (root layout). Truoc day the nay nam trong
 * PortalShell: moi lan chuyen trang phia trinh duyet vao khu hoc vien (vd khu
 * quan tri day khach ve "/") React phai ve lai no tren trinh duyet va bao loi
 * "Encountered a script tag while rendering React component" - cua so loi do
 * cua Next che ca man hinh nhu trang sap. Root layout chi ve mot lan luc tai
 * trang, khong bao gio ve lai khi chuyen trang, nen khong con loi do; khu
 * admin / giang vien cung duoc tai san ho so som nhu khu hoc vien.
 *
 * `.catch` gan ngay tai cho: khong co no thi mot loi hua bi tu choi ma chua ai
 * bat se thanh "unhandled rejection" do do trong console truoc khi
 * UserBootstrap kip nhan.
 */
export default function ProfilePrefetchScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html:
          `try{window.__hoSoDangBay=fetch(${JSON.stringify(PROFILE_PATH)},` +
          `{credentials:"include",cache:"no-store"})` +
          `.then(function(r){return r.ok?r.json():null})` +
          `.catch(function(){return null})}catch(e){}`,
      }}
    />
  );
}
