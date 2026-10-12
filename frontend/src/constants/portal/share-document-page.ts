/** Chu va cau hinh cua khu /share-document. */
export const SHARE_DOCUMENT = {
  /** Giay giu ban dung san - so dem linh vuc / mon doi theo bai dang moi. */
  revalidate: 60,
  documentRevalidate: 30,

  api: {
    subjects: "/api/documents/mon-hoc",
    categories: "/api/documents/linh-vuc",
    universities: "/api/documents/truong",
    stats: "/api/documents/thong-ke",
    latest: "/api/documents?limit=12",
    faqs: "/api/faqs/tai-lieu",
    byCategory: (key: string) => `/api/documents?limit=8&nhom=${encodeURIComponent(key)}`,
    mostDownloaded: "/api/documents?limit=8&sapXep=luotTai",
    document: (id: string) => `/api/documents/${id}`,
    related: (id: string) => `/api/documents/goi-y?id=${id}&limit=6`,
    university: (key: string) => `/api/documents/truong/${encodeURIComponent(key)}`,
  },

  home: {
    metadata: {
      title: "Chia sẻ tài liệu",
      description:
        "Tải lên và tải về tài liệu học tập miễn phí: đề cương, đề thi, bài giải, slide bài giảng — xếp theo lĩnh vực và môn học.",
    },
    /** Toi da bao nhieu tab linh vuc o hai section trinh bay / kham pha. */
    maxCategoryTabs: 6,
    featuredTab: { key: "noi-bat", name: "Nổi bật" },
  },

  browse: {
    titleFor: (name?: string) => (name ? `Tài liệu ${name}` : "Tất cả tài liệu"),
    description:
      "Tìm đề cương, đề thi, bài giải và slide bài giảng do sinh viên chia sẻ.",
  },

  detail: {
    notFoundTitle: "Không tìm thấy tài liệu",
    /** Do dai mo ta trong the meta. */
    descriptionLength: 160,
  },

  institutions: {
    metadata: {
      title: "Trường đại học",
      description:
        "Tìm trường đại học của bạn và xem tài liệu học tập do sinh viên trường đó chia sẻ.",
    },
  },

  institution: {
    notFoundTitle: "Không tìm thấy trường",
    title: (name: string) => `${name} - tài liệu theo môn học`,
    description: (name: string) =>
      `Đề cương, đề thi, bài giải và slide môn học của ${name} do sinh viên chia sẻ.`,
    loadFailed: (status: number) => `Không tải được trường (${status})`,
  },

  institutionCategory: {
    notFoundTitle: "Không tìm thấy",
    title: (group: string, school: string) => `${group} - ${school}`,
    description: (group: string, school: string) =>
      `Tài liệu ${group} do sinh viên ${school} chia sẻ.`,
  },
} as const;
