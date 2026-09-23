import styles from "./FeatureShowcase.module.scss";

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
    <ul className={styles.list}>
      {diem.map((d) => (
        <li key={d} className={styles.item}>
          <i className={styles.grid}>✓</i>
          {d}
        </li>
      ))}
    </ul>
  );
}

function KhungHinh({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.card}>
      <div
        aria-hidden="true"
        className={styles.floating}
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
    <section className={styles.section}>
      <div className={styles.col}>
        {/* --- Muc 1: hinh trai, chu phai --- */}
        <div className={styles.grid2}>
          <KhungHinh>
            <div className={styles.card2}>
              {BAI.map((b, i) => (
                <div
                  key={b.ten}
                  className={`${styles.row3} ${
                    i > 0 && b.trang !== "dang" ? styles.box : ""
                  } ${b.trang === "dang" ? styles.box2 : ""} ${
                    b.trang === "khoa" ? styles.box3 : ""
                  }`}
                >
                  <span
                    className={`${styles.grid3} ${
                      b.trang === "xong"
                        ? styles.label
                        : b.trang === "dang"
                          ? styles.label2
                          : styles.label3
                    }`}
                  >
                    {b.trang === "xong" ? "✓" : b.trang === "dang" ? i + 1 : "🔒"}
                  </span>
                  {b.ten}
                  <span className={styles.label4}>{b.thoi}</span>
                </div>
              ))}

              <div className={styles.box4}>
                <div className={styles.row}>
                  <span>Tiến độ khóa học</span>
                  <span>3 / 6 bài</span>
                </div>
                <div className={styles.box5}>
                  <i className={styles.box6} />
                </div>
              </div>
            </div>
          </KhungHinh>

          <div>
            <h2 className={styles.heading}>Bài sau chỉ mở khi bài trước đã qua</h2>
            <p className={styles.text}>
              Không phải để làm khó. Bài dự án cần đúng thứ hai bài trước đó dạy — nhảy
              thẳng vào là ngồi nhìn màn hình không biết bắt đầu từ đâu.
            </p>
            <DanhSachDiem diem={DIEM_1} />
          </div>
        </div>

        {/* --- Muc 2: chu trai, hinh phai --- */}
        <div className={styles.grid2}>
          <div className={styles.box7}>
            <h2 className={styles.heading}>Chứng nhận có mã, không phải tấm ảnh</h2>
            <p className={styles.text}>
              Ai cũng làm được một tấm ảnh đẹp trong Photoshop. Cái đáng giá là nhà tuyển
              dụng gõ mã vào trang tra cứu và thấy đúng tên bạn, đúng khóa, đúng ngày.
            </p>
            <DanhSachDiem diem={DIEM_2} />
          </div>

          <div className={styles.box8}>
            <KhungHinh>
              <div className={styles.card3}>
                <div className={styles.card4}>★</div>
                <h3 className={styles.subheading}>Chứng nhận hoàn thành</h3>
                <div className={styles.box9}>Học viên Learning Portal</div>
                <div className={styles.box10}>Lập trình Web với React &amp; Node.js</div>
                <div className={styles.row2}>
                  <span>
                    Mã tra cứu <b className={styles.box11}>LP-7K2M-93XA</b>
                  </span>
                  <span>
                    Cấp ngày <b className={styles.box11}>04/09/2026</b>
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
