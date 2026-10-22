import {
  BookOpen,
  Brain,
  Briefcase,
  Calculator,
  Camera,
  ChartColumn,
  Cloud,
  CodeXml,
  Cpu,
  Database,
  FlaskConical,
  Gamepad2,
  Globe,
  HeartPulse,
  Languages,
  LayoutGrid,
  LayoutTemplate,
  Megaphone,
  Music,
  Palette,
  PenTool,
  Server,
  ShieldCheck,
  Smartphone,
  Terminal,
  type LucideIcon,
} from "lucide-react";

/**
 * Bieu tuong cho danh muc khoa hoc. Key la chuoi luu trong truong `icon` cua
 * danh muc.
 *
 * Truoc day truong do la o nhap chu tu do, admin go gi cung duoc, nen trang
 * chu bo qua no va chi doan theo ten - tuc la go "code" hay "cloud" vao khong
 * doi duoc gi. Gio admin chon tu bang nay, nen key luon khop mot component.
 * Sau key dau tien trung dung gia tri da co san trong CSDL (code, bar-chart,
 * layout, megaphone, smartphone, cloud) de du lieu cu hien dung ngay.
 */
export const CATEGORY_ICONS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "code", label: "Lập trình", Icon: CodeXml },
  { key: "bar-chart", label: "Dữ liệu", Icon: ChartColumn },
  { key: "layout", label: "Giao diện", Icon: LayoutTemplate },
  { key: "megaphone", label: "Marketing", Icon: Megaphone },
  { key: "smartphone", label: "Di động", Icon: Smartphone },
  { key: "cloud", label: "Đám mây", Icon: Cloud },
  { key: "cpu", label: "AI / phần cứng", Icon: Cpu },
  { key: "brain", label: "Trí tuệ nhân tạo", Icon: Brain },
  { key: "pen-tool", label: "Thiết kế", Icon: PenTool },
  { key: "palette", label: "Mỹ thuật", Icon: Palette },
  { key: "shield-check", label: "Bảo mật", Icon: ShieldCheck },
  { key: "database", label: "Cơ sở dữ liệu", Icon: Database },
  { key: "server", label: "Hệ thống", Icon: Server },
  { key: "terminal", label: "Dòng lệnh", Icon: Terminal },
  { key: "globe", label: "Web / mạng", Icon: Globe },
  { key: "briefcase", label: "Kinh doanh", Icon: Briefcase },
  { key: "calculator", label: "Toán / kế toán", Icon: Calculator },
  { key: "flask", label: "Khoa học", Icon: FlaskConical },
  { key: "languages", label: "Ngoại ngữ", Icon: Languages },
  { key: "book-open", label: "Kiến thức chung", Icon: BookOpen },
  { key: "heart-pulse", label: "Sức khỏe", Icon: HeartPulse },
  { key: "camera", label: "Nhiếp ảnh", Icon: Camera },
  { key: "music", label: "Âm nhạc", Icon: Music },
  { key: "gamepad", label: "Game", Icon: Gamepad2 },
];

const BY_KEY = new Map(CATEGORY_ICONS.map((i) => [i.key, i]));

// Danh muc chua chon bieu tuong (hoac con gia tri go tay cu khong co trong
// bang) thi doan theo tu khoa trong ten, nhu trang chu van lam truoc day.
const BY_NAME: [RegExp, LucideIcon][] = [
  [/web|front|html|css/i, CodeXml],
  [/devops|cloud|docker|kubernet/i, Cloud],
  [/mobile|android|ios|flutter/i, Smartphone],
  [/marketing|seo|quảng cáo/i, Megaphone],
  [/dữ liệu|data|phân tích|analytic/i, ChartColumn],
  [/thiết kế|design|ui|ux/i, PenTool],
  [/ai|máy học|machine|khoa học/i, Cpu],
  [/bảo mật|security|an toàn/i, ShieldCheck],
];

/** Bieu tuong admin da chon neu hop le, khong thi doan theo ten. */
export function categoryIcon(icon: string | undefined, name: string): LucideIcon {
  const chosen = icon ? BY_KEY.get(icon.trim()) : undefined;
  if (chosen) return chosen.Icon;
  for (const [pattern, Icon] of BY_NAME) if (pattern.test(name)) return Icon;
  return LayoutGrid;
}

/** Ten hien cho key da luu; undefined = chua chon hoac gia tri cu khong hop le. */
export function categoryIconLabel(icon: string | undefined) {
  return icon ? BY_KEY.get(icon.trim())?.label : undefined;
}
