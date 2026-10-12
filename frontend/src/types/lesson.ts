/** Mot bai hoc trong danh sach giao trinh (lay tu course.lessons). */
export interface LessonRow {
  _id: string;
  title: string;
  videoUrl?: string;
  duration?: number | string;
  isFreePreview?: boolean;
}

/** Bieu mau them bai hoc. duration nhap bang PHUT, gui len doi sang giay. */
export interface LessonCreateFormData {
  title: string;
  /** Tren backend truong nay la 'content'. */
  description: string;
  videoUrl: string;
  documentUrl: string;
  duration: number;
  order: number;
}
