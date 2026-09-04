/**
 * Hai muc "hinh mot ben, chu mot ben", dao qua dao lai.
 *
 * Hinh o day KHONG phai anh chup man hinh. No la chinh giao dien that,
 * dung bang the va CSS. Duoc ba dieu:
 *
 *   - Khong ton mot byte anh nao, va net o moi do phan giai.
 *   - Sua giao dien that thi cho nay sua theo, khong bi lac hau nhu anh
 *     chup tu thang truoc.
 *   - Nguoi doc man hinh doc duoc noi dung ben trong, khac han mot tam PNG.
 */

const DIEM_1 = [
  "Tiến độ lưu trên máy chủ, đổi máy vẫn đúng chỗ đang dở",
  "Bài tập chấm ngay, sai chỗ nào chỉ chỗ đó",
  "Bài đã qua thì xem lại bao nhiêu lần cũng được",
];

const DIEM_2 = [
  "Mỗi chứng nhận một mã riêng, tra cứu công khai",
  "Chỉ cấp khi đã hết bài và đạt bài kiểm tra cuối",
  "Tải PDF hoặc gửi thẳng đường dẫn",
];

const BAI = [
  { ten: "Giới thiệu React và môi trường", thoi: "12:40", trang: "xong" },
  { ten: "Component và props", thoi: "18:05", trang: "xong" },
  { ten: "State và vòng đời", thoi: "22:18", trang: "xong" },
  { ten: "Gọi API với Node.js", thoi: "Đang học", trang: "dang" },
  { ten: "Dự án nhỏ: trang tin", thoi: "Khóa", trang: "khoa" },
  { ten: "Bài kiểm tra cuối khóa", thoi: "Khóa", trang: "khoa" },
] as const;

function DanhSachDiem({ diem }: { diem: readonly string[] }) {
  return (
    <ul className="mt-6 flex list-none flex-col gap-3 p-0">
      {diem.map((d) => (
        <li key={d} className="flex items-start gap-3 text-[.95rem]">
          <i className="bg-ngoc mt-0.5 grid size-5.5 flex-none place-items-center rounded-full text-[.72rem] font-bold text-[#04231F] not-italic">
            ✓
          </i>
          {d}
        </li>
      ))}
    </ul>
  );
}

function KhungHinh({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-5 md:p-8">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 70% 10%, rgb(79 43 255 / .10), transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}

export default function TrinhBay() {
  return (
    <section className="py-18 md:py-28">
      <div className="mx-auto flex w-[min(76rem,100%-2.5rem)] flex-col gap-18 md:gap-28">
        {/* --- Muc 1: hinh trai, chu phai --- */}
        <div className="grid items-center gap-10 md:gap-16 lg:grid-cols-2">
          <KhungHinh>
            <div className="relative rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_40px_-30px_rgb(11_12_30/.55)]">
              {BAI.map((b, i) => (
                <div
                  key={b.ten}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[.92rem] ${
                    i > 0 && b.trang !== "dang" ? "border-t border-slate-200" : ""
                  } ${b.trang === "dang" ? "bg-tim/7" : ""} ${
                    b.trang === "khoa" ? "text-slate-500" : ""
                  }`}
                >
                  <span
                    className={`grid size-6 flex-none place-items-center rounded-full font-mono text-[.68rem] font-semibold ${
                      b.trang === "xong"
                        ? "bg-ngoc text-[#04231F]"
                        : b.trang === "dang"
                          ? "bg-tim text-white"
                          : "border border-slate-200 bg-slate-50 text-slate-500"
                    }`}
                  >
                    {b.trang === "xong" ? "✓" : b.trang === "dang" ? i + 1 : "🔒"}
                  </span>
                  {b.ten}
                  <span className="ml-auto font-mono text-[.72rem] text-slate-500">
                    {b.thoi}
                  </span>
                </div>
              ))}

              <div className="mt-3 px-3 pb-1">
                <div className="mb-1.5 flex justify-between font-mono text-[.72rem] text-slate-500">
                  <span>Tiến độ khóa học</span>
                  <span>3 / 6 bài</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <i className="from-tim to-ngoc block h-full w-1/2 rounded-full bg-linear-to-r" />
                </div>
              </div>
            </div>
          </KhungHinh>

          <div>
            <h2 className="font-hien text-muc text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.1] font-extrabold tracking-[-.035em] text-balance">
              Bài sau chỉ mở khi bài trước đã qua
            </h2>
            <p className="mt-4 max-w-[56ch] text-slate-500">
              Không phải để làm khó. Bài dự án cần đúng thứ hai bài trước đó dạy — nhảy
              thẳng vào là ngồi nhìn màn hình không biết bắt đầu từ đâu.
            </p>
            <DanhSachDiem diem={DIEM_1} />
          </div>
        </div>

        {/* --- Muc 2: chu trai, hinh phai --- */}
        <div className="grid items-center gap-10 md:gap-16 lg:grid-cols-2">
          <div className="lg:order-1">
            <h2 className="font-hien text-muc text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.1] font-extrabold tracking-[-.035em] text-balance">
              Chứng nhận có mã, không phải tấm ảnh
            </h2>
            <p className="mt-4 max-w-[56ch] text-slate-500">
              Ai cũng làm được một tấm ảnh đẹp trong Photoshop. Cái đáng giá là nhà tuyển
              dụng gõ mã vào trang tra cứu và thấy đúng tên bạn, đúng khóa, đúng ngày.
            </p>
            <DanhSachDiem diem={DIEM_2} />
          </div>

          <div className="lg:order-2">
            <KhungHinh>
              <div className="relative rounded-2xl border border-slate-200 bg-white px-6 py-7 text-center shadow-[0_24px_40px_-30px_rgb(11_12_30/.55)]">
                <div className="mx-auto mb-4 grid size-13 place-items-center rounded-full bg-linear-to-br from-[#FFC93C] to-[#E89400] text-2xl text-[#2A1C00] shadow-[0_10px_22px_-10px_rgb(232_148_0/.8)]">
                  ★
                </div>
                <h3 className="font-hien text-muc text-lg font-extrabold tracking-[-.02em]">
                  Chứng nhận hoàn thành
                </h3>
                <div className="font-hien text-muc mt-3 text-2xl font-bold tracking-[-.03em]">
                  Học viên Learning Portal
                </div>
                <div className="text-[.92rem] text-slate-500">
                  Lập trình Web với React &amp; Node.js
                </div>
                <div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-dashed border-slate-200 pt-4 font-mono text-[.78rem] text-slate-500">
                  <span>
                    Mã tra cứu <b className="text-muc font-semibold">LP-7K2M-93XA</b>
                  </span>
                  <span>
                    Cấp ngày <b className="text-muc font-semibold">04/09/2026</b>
                  </span>
                </div>
              </div>
            </KhungHinh>
          </div>
        </div>
      </div>
    </section>
  );
}
