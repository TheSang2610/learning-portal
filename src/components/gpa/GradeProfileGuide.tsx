import Link from "next/link";

const STEPS: { title: string; body: string }[] = [
  {
    title: "Nhập điểm và theo dõi GPA",
    body: "Mỗi môn học sẽ có 2 ô nhập điểm, ô đầu tiên dùng để chọn điểm hiện tại. Nếu điểm hiện tại không phải là A+ sẽ có 1 ô bên cạnh để chọn điểm cải thiện. Sau khi thay đổi điểm của một môn học, điểm trung bình học kỳ (GPA) và điểm trung bình tích lũy (CPA/CGPA) sẽ được cập nhật ngay lập tức.",
  },
  {
    title: "Reset dữ liệu hồ sơ",
    body: "Khi muốn reset toàn bộ thông tin đã thay đổi của hồ sơ, bao gồm các học kỳ, môn học, điểm và mục tiêu. Các bạn hãy click vào nút Reset hồ sơ, lưu ý chức năng này không thể hoàn tác, bạn hãy cân nhắc kỹ trước khi sử dụng.",
  },
  {
    title: "Đặt mục tiêu và nhận gợi ý",
    body: "Khi thay đổi giá trị của nút chọn mục tiêu, các bạn sẽ thấy một danh sách điểm được đặt cạnh các môn học, đó sẽ là những gợi ý của hệ thống để bạn đạt được mục tiêu. Bạn cần học cải thiện những môn học này để nhận được xếp loại bạn mong muốn. Nếu chưa hài lòng với tính toán hiện tại, bạn có thể click nút bên cạnh để hệ thống tính toán lại.",
  },
  {
    title: "Quản lý môn học và theo dõi GPA realtime",
    body: "Toàn bộ thông tin về học kỳ, môn học đều có thể thêm, sửa, xóa dễ dàng trên hệ thống. Điểm trung bình học kỳ (GPA) và trung bình tích lũy (CPA/CGPA) được cập nhật realtime khi các bạn có tương tác với điểm trên màn hình.",
  },
  {
    title: "Lưu trữ dữ liệu tự động",
    body: "Tất cả dữ liệu về điểm trên màn hình được lưu lại, để bạn thuận tiện sử dụng lại cho những lần sau.",
  },
];

// Giu nguyen hinh khoi cua CSS ban goc, chi doi mau thuong hieu do -> xanh
// cho khop voi trang Individuals:
//   border      1px solid mau thuong hieu, do dam 10%  -> border-blue-600/10
//   radius      16px                                   -> rounded-2xl
//   shadow      0 2px 4px #0000000d (den 5%)
//   gap/padding 1.5rem                                 -> gap-6 / p-6
// transition co san trong ban goc nhung khong kem :hover nao, nen toi them
// mot hieu ung nhe khi ro chuot cho nut transition co tac dung.
const stepCard =
  "flex items-start gap-6 rounded-2xl border border-blue-600/10 bg-white p-6 " +
  "shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all duration-300 " +
  "hover:border-blue-600/30 hover:shadow-[0_4px_10px_rgba(0,0,0,0.08)]";

const stepNumber =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white";

export default function GradeProfileGuide() {
  return (
    <section className="mt-12">
      <div className="text-center">
        <span className="text-3xl" role="img" aria-label="Sách">
          📚
        </span>
        <h2 className="mt-2 text-xl font-extrabold text-blue-600">Hướng dẫn sử dụng</h2>
        <p className="mx-auto mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          Dưới đây là phần giới thiệu màn hình tính điểm trung bình học kỳ (GPA), điểm
          trung bình tích lũy (CPA/CGPA), xây dựng mục tiêu và điểm của sinh viên.
        </p>
      </div>

      <ol className="mt-8 space-y-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className={stepCard}>
            <span className={stepNumber}>{i + 1}</span>
            <div className="min-w-0">
              <h4 className="text-base font-bold text-slate-900">{s.title}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.body}</p>
            </div>
          </li>
        ))}

        {/* Buoc cuoi co lien ket nen tach rieng khoi mang van ban */}
        <li className={stepCard}>
          <span className={stepNumber}>{STEPS.length + 1}</span>
          <div className="min-w-0">
            <h4 className="text-base font-bold text-slate-900">
              Đăng nhập để trải nghiệm đầy đủ
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Nếu là sinh viên Học Viện Công Nghệ Bưu Chính Viễn Thông (PTIT), các bạn
              hãy đăng ký hoặc đăng nhập để sử dụng đầy đủ tính năng của hệ thống, bao
              gồm việc tạo hồ sơ điểm theo khóa học, ngành học, tạo được nhiều hồ sơ
              điểm và còn nhiều tính năng khác nữa.
            </p>
            {/* Du an nay khong co route /login rieng - dang nhap mo bang tham so
                ?auth=login tren trang chu, giong nut Log In tren thanh dieu huong. */}
            <Link
              href="/?auth=login"
              className="mt-3 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Đăng nhập
            </Link>
          </div>
        </li>
      </ol>
    </section>
  );
}
