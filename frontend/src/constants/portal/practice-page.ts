/** Chu cua khu /practice (luyen tap trac nghiem). */
export const PRACTICE_PAGE = {
  metadata: {
    title: "Luyện tập trắc nghiệm",
    description: "Ôn thi trắc nghiệm theo từng môn: chọn môn và làm các đề luyện tập.",
  },
  takeTitle: (title: string) => `Làm bài: ${title}`,
  resultTitle: (title: string) => `Bài làm: ${title}`,
} as const;
