// Danh muc mon hoc va de luyen tap cua trang /practice.
//
// Lay NGUYEN tu trang on thi truoc day cua chu du an (dung ten, dung thu tu,
// dung bo mau vach). Khong suy ra tu cac khoa hoc tren web: chu du an da noi ro
// muon danh sach mon y het ban goc, ke ca cac mon trung ten gan nhau
// ("Pháp Luật Đại Cương" / "Pháp luật đại cương") vi ban goc de vay.
//
// Mon chua co de thi trang hien "chua co de", khong tu bia de hay so lieu.

// Mau vach tung mon theo ban goc, xoay vong theo thu tu mon.
const MAU = ["#306da6", "#57b056", "#f59e0b", "#8b5cf6", "#ec4899"];

const TEN_MON = [
  "An toàn và bảo mật hệ thống thông tin",
  "Công nghệ phần mềm",
  "Kinh tế chính trị Mác - Lênin",
  "E - Marketing",
  "Cơ sở dữ liệu",
  "Thống kê doanh nghiệp",
  "Tư tưởng HCM",
  "Toán cao cấp 1",
  "Nhập môn truyền thông",
  "Mạng truyền thông quang",
  "Quản trị tài chính",
  "Quản lý dự án",
  "Giải tích 1",
  "Tư tưởng Hồ Chí Minh",
  "An toàn bảo mật hệ thống thông tin",
  "Xử lý tín hiệu số",
  "ATMTT",
  "Triết học Mác-Lênin",
  "Kinh tế chính trị",
  "Nguyên lý kế toán",
  "Kỹ thuật thông tin quang",
  "Tin học cơ sở",
  "Chủ nghĩa xã hội khoa học",
  "Phương pháp luận nghiên cứu khoa học",
  "Kiến trúc và Giao thức IoT",
  "An toàn Web và CSDL",
  "Kinh tế vĩ mô",
  "Pháp Luật Đại Cương",
  "Mạng máy tính",
  "Vật lý",
  "Kế toán quản trị",
  "Lịch sử Đảng",
  "Quản trị bán hàng",
  "Đại số",
  "Pháp luật đại cương",
  "Lập trình nhúng",
  "PR - Lý luận và ứng dụng",
  "Mạng thông tin quang",
];

export interface MonHoc {
  /** Dung chi so lam khoa vi co hai mon trung ten khi bo dau/hoa thuong */
  id: string;
  ten: string;
  mau: string;
}

export interface DeLuyenTap {
  id: string;
  monId: string;
  title: string;
  description: string;
  soCau: number;
}

export const MON_HOC: MonHoc[] = TEN_MON.map((ten, i) => ({
  id: `mon-${i + 1}`,
  ten,
  mau: MAU[i % MAU.length],
}));

export interface CauHoi {
  cau: string;
  dapAn: string[];
  /** Chi so cac dap an dung trong dapAn, dem tu 0 - vai cau co nhieu dap an dung */
  dung: number[];
  /** cau/dapAn la HTML da lam sach luc chuyen doi (anh, cong thuc MathML, chi so tren/duoi) */
  html?: boolean;
}

// Danh sach de va bo cau hoi sinh tu du lieu trang on thi cu (so luot lam KHONG
// chep sang - do la luot lam tren trang cu). So cau la so cau con lai sau khi
// bo cau loi o ban goc (khong dap an / khong danh dau dap an dung).
export { DE_LUYEN_TAP, NAP_CAU_HOI } from "./de/danhSach";
