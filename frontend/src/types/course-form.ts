/** Du lieu bieu mau tao khoa hoc (buoc 1) - dung chung cho admin va giang vien. */
export interface CourseCreateFormData {
  title: string;
  slug: string;
  description: string;
  price: number;
  /** Danh sach _id danh muc, chon nhieu. */
  category: string[];
  /** _id doi tac / truong hoc; "" = he thong LMS cap doc lap. */
  providerId: string;
  level: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export type FieldChangeEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

/** Du lieu bieu mau sua thong tin khoa hoc (khong sua slug). */
export type CourseEditFormData = Omit<CourseCreateFormData, "slug">;

/** Bieu mau tao khoa hoc cua admin: them giang vien phu trach. */
export interface AdminCourseCreateFormData extends CourseCreateFormData {
  /** _id giang vien phu trach (bat buoc). */
  instructor: string;
}

/** Bieu mau sua khoa hoc cua admin: sua duoc slug va giang vien. */
export interface AdminCourseEditFormData extends CourseCreateFormData {
  /** So ngay duoc hoc sau khi thanh toan (khoa co phi). */
  accessDays: number;
  instructorId: string;
}
