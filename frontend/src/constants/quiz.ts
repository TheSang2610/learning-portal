/** Cau bao dung chung cua man hinh soan quiz (admin va giang vien). */
export const QUIZ_DRAFT_MESSAGES = {
  emptyQuestion: (questionItem: number) =>
    `Câu hỏi số ${questionItem} chưa điền nội dung!`,
  emptyOption: (option: number, questionItem: number) =>
    `Phương án lựa chọn số ${option} của Câu hỏi ${questionItem} đang trống!`,
} as const;
