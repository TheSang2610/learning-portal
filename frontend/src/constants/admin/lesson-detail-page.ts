/** Chu va cau hinh cua trang /admin/lesson-detail. */
export const ADMIN_LESSON_DETAIL = {
  courseDetailHref: (courseId: string) => `/admin/course-detail?courseId=${courseId}`,
  /** Gioi han dung luong video tai len (byte). */
  maxVideoBytes: 500 * 1024 * 1024,
  videoAccept: "video/mp4,video/webm,video/ogg,video/quicktime",

  loading: "Loading lesson details...",
  back: "← Back to Course Structure",
  title: "Edit Lesson Content",
  subtitle: "Modify details, video pathways, and course documentation.",
  delete: "Delete Lesson",
  deleting: "Deleting...",

  fields: {
    title: "Lesson Title",
    order: "Order Position",
    content: "Text Content / Study Guide",
    contentPlaceholder:
      "Write lesson notes, markdown guidelines, or text exercises here...",
  },

  video: {
    label: "📹 Video Resource (Upload or Paste Link)",
    hint: "Choose one: Upload MP4 file directly OR paste video URL",
    upload: "📁 Upload Video File",
    supported: "✓ Supported: MP4, WebM, OGG, MOV (Max 500MB)",
    selected: "✓ Video Selected",
    remove: "✕ Remove this video",
    paste: "🔗 Or Paste Video URL",
    placeholder: "e.g. https://www.youtube.com/watch?v=... or https://vimeo.com/...",
    urlDisabled: "💡 URL field disabled (file upload takes priority)",
    urlWillSave: "✓ URL will be saved",
  },

  actions: {
    cancel: "Cancel",
    uploading: (percent: number) => `Uploading video... ${percent}%`,
    saving: "💾 Saving...",
    save: "✓ Save Changes",
  },

  messages: {
    loadFailed: "Failed to load lesson details",
    invalidVideo: "Please select a valid video file",
    videoTooLarge: "Video size must be less than 500MB",
    needTitle: "Please enter a lesson title",
    saved: "Lesson updated successfully!",
    saveFailed: "Failed to update lesson",
    confirmDelete:
      "⚠️ Bạn có chắc chắn muốn xóa bài học này?\nHành động này sẽ gỡ bài học khỏi khóa học và không thể hoàn tác!",
    deleted: "Lesson deleted successfully!",
    deleteFailed: "Failed to delete lesson",
  },
} as const;
