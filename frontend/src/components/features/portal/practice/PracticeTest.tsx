"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Columns2,
  FileCheck2,
  FilePenLine,
  LayoutGrid,
  List,
  Rows3,
  Timer,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { updateUrl, loginUrl } from "@/src/components/features/portal/auth/loginUrl";
import { useUserLoading, useStoredUser } from "@/src/hooks/userStore";

import PracticeResult from "./PracticeResult";
import { QUESTION_LOADERS, type Question, type PracticeQuiz } from "./practiceData";
import {
  applyOrder,
  splitBuckets,
  readSettings,
  shuffleAnswers,
  correctAnswer,
  shuffle,
  type Settings,
} from "./practiceSettings";
import { saveAttempt } from "@/src/services/practice";

import styles from "./PracticeTest.module.scss";

// Phong lam bai theo mau trang thi cua chu du an: thanh tren co dinh, the cau
// hoi voi dap an A-D, cot "Danh sach cau hoi" ben phai.

type Mode = "list" | "single" | "split";
type Phase = "nap" | "lam" | "xong";

const MODES: { id: Mode; nhan: string; Icon: typeof List }[] = [
  { id: "list", nhan: "Hiển thị danh sách câu hỏi", Icon: List },
  { id: "single", nhan: "Hiển thị từng câu hỏi", Icon: Rows3 },
  { id: "split", nhan: "Tách câu hỏi và đáp án", Icon: Columns2 },
];

const FONT_SIZE_MIN = 1;
const FONT_SIZE_MAX = 1.5;
const LETTERS = "ABCDEFGH";

const gon = (s: string) => s.replace(/\s+/g, " ").trim();
const pad2 = (n: number) => String(n).padStart(2, "0");
const timer = (seconds: number) => {
  const g = Math.max(0, seconds);
  return `${pad2(Math.floor(g / 3600))} : ${pad2(Math.floor((g % 3600) / 60))} : ${pad2(g % 60)}`;
};

/** Du lieu da loc san luc chuyen doi (anh https, MathML, the dinh dang) nen gan thang. */
function Content({ html, s }: { html?: boolean; s: string }) {
  return html ? (
    <span className={styles.giau} dangerouslySetInnerHTML={{ __html: s }} />
  ) : (
    <span>{gon(s)}</span>
  );
}

interface Props {
  de: PracticeQuiz;
}

export default function PracticeTest({ de: quiz }: Props) {
  const router = useRouter();
  const path = usePathname();
  const user = useStoredUser();
  const loading = useUserLoading();
  const loadQuestions = QUESTION_LOADERS[quiz.id];

  const [phase, setPhase] = useState<Phase>("nap");
  const [tl, setTl] = useState<Settings | null>(null);
  const [origin, setOrigin] = useState<Question[]>([]); // bo cau theo thu tu goc
  const [items, setDs] = useState<Question[]>([]); // bo cau dang lam (co the da xao)
  const [fromQuestion, setFromQuestion] = useState(1);
  const [choice, setChoice] = useState<(number[] | undefined)[]>([]);
  const [current, setCurrent] = useState(0);
  const [mode, setMode] = useState<Mode>("list");
  const [fontSize, setFontSize] = useState(1);
  const [start, setStart] = useState(0);
  const [nowMs, setNowMs] = useState(0);
  const [endsAt, setEndsAt] = useState(0);
  const [box, setBox] = useState<"nop" | "thoat" | null>(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [openList, setOpenList] = useState(false);
  const [loadError, setLoadError] = useState(false);
  // Vi tri cau trong file de + thu tu dap an da hien: du de dung lai dung bai
  // nay khi mo lai tu lich su. Xem backend/src/utils/practiceAttempt.js.
  const [source, setSource] = useState<{ cau: number[]; dapAn: number[][] }>({
    cau: [],
    dapAn: [],
  });
  const [save, setSave] = useState<"dang" | "xong" | "loi" | null>(null);
  const sent = useRef(false);

  const scrollArea = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Bat dau (hoac lam lai) mot luot tu bo cau goc
  const startAttempt = useCallback((remove: Question[], t: Settings, word: number) => {
    const index = remove.map((_, k) => k);
    const questionOrder = t.shuffle ? shuffle(index) : index;
    const answerOrder = questionOrder.map((k) =>
      t.shuffle ? shuffleAnswers(remove[k]) : [],
    );
    const recent = questionOrder.map((k, i) => applyOrder(remove[k], answerOrder[i]));
    setSource({ cau: questionOrder.map((k) => word - 1 + k), dapAn: answerOrder });
    setSave(null);
    sent.current = false;
    setDs(recent);
    setChoice(Array(recent.length).fill(undefined));
    setCurrent(0);
    const now = Date.now();
    setStart(now);
    setNowMs(now);
    setPhase("lam");
    scrollArea.current?.scrollTo({ top: 0 });
  }, []);

  // Nap de + thiet lap sau khi gan vao trinh duyet (thiet lap nam o localStorage,
  // bo cau dang chon nam o ?bo= tren dia chi).
  useEffect(() => {
    if (!loadQuestions || !user) return;
    let cancel = false;
    const t = readSettings();
    const allBuckets = splitBuckets(quiz.soCau, t.soLuong);
    const count = Number(new URLSearchParams(window.location.search).get("bo"));
    const remove =
      allBuckets[Number.isInteger(count) && count >= 0 ? count : 0] ?? allBuckets[0];
    loadQuestions()
      .then((off) => {
        if (cancel) return;
        const lat = off.slice(remove.tu - 1, remove.den);
        setTl(t);
        setFromQuestion(remove.tu);
        setOrigin(lat);
        startAttempt(lat, t, remove.tu);
      })
      .catch(() => !cancel && setLoadError(true));
    return () => {
      cancel = true;
    };
    // nguoiDung chi can co/khong: doi ten hien thi khong duoc nap lai bai
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadQuestions, quiz.soCau, !!user, startAttempt]);

  // Phong lam bai phu kin man hinh: khoa cuon trang phia sau
  useEffect(() => {
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = before;
    };
  }, []);

  const passed = Math.floor(((phase === "xong" ? endsAt : nowMs) - start) / 1000);
  const answeredCount = choice.filter((c) => c && c.length).length;

  const submit = useCallback(() => {
    setBox(null);
    setSave("dang");
    setEndsAt(Date.now());
    setPhase("xong");
    setMode("list");
    setOpenList(false);
    scrollArea.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Nop xong thi luu vao lich su (mot lan - ref chan viec gui lai khi effect
  // chay hai lan o che do dev). Loi mang khong chan xem ket qua, chi bao lai.
  useEffect(() => {
    if (save !== "dang" || sent.current) return;
    sent.current = true;
    saveAttempt({
      deId: quiz.id,
      cau: source.cau,
      dapAn: source.dapAn,
      chon: choice.map((c) => c ?? []),
      soDung: items.filter((c, i) => correctAnswer(choice[i], c.dung)).length,
      giay: Math.max(0, Math.floor((endsAt - start) / 1000)),
    })
      .then(() => setSave("xong"))
      .catch(() => setSave("loi"));
  }, [save, quiz.id, source, choice, items, endsAt, start]);

  // Dong ho dem thoi gian da lam, moi giay mot nhip. Khong gioi han gio: chu
  // du an da bo "thoi gian dem nguoc" - luyen tap thi lam bao lau cung duoc.
  useEffect(() => {
    if (phase !== "lam") return;
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Dang lam do dang ma dong tab / tai lai: hoi truoc
  useEffect(() => {
    if (phase !== "lam" || answeredCount === 0) return;
    const ask = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", ask);
    return () => window.removeEventListener("beforeunload", ask);
  }, [phase, answeredCount]);

  // Menu kieu hien thi: bam ra ngoai / Esc de dong
  useEffect(() => {
    if (!openMenu) return;
    const outside = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpenMenu(false);
    };
    const phim = (e: KeyboardEvent) => e.key === "Escape" && setOpenMenu(false);
    document.addEventListener("mousedown", outside);
    window.addEventListener("keydown", phim);
    return () => {
      document.removeEventListener("mousedown", outside);
      window.removeEventListener("keydown", phim);
    };
  }, [openMenu]);

  const answeredQuestion = (i: number) => {
    const c = choice[i];
    return !!c && c.length === items[i].dung.length;
  };
  // Dang lam KHONG lo dung/sai (chu du an da bo "hien dap an sau cau hoi"):
  // doi lai lua chon thoai mai, nop bai xong moi xem dap an.
  const selectAnswer = (i: number, j: number) => {
    if (phase !== "lam") return;
    const c = items[i];
    const old = choice[i] ?? [];
    const recent =
      c.dung.length > 1
        ? old.includes(j)
          ? old.filter((x) => x !== j)
          : old.length < c.dung.length
            ? [...old, j]
            : old
        : [j];
    setChoice((ds0) => ds0.map((x, k) => (k === i ? recent : x)));
  };

  const goToQuestion = (i: number) => {
    setOpenList(false);
    if (mode === "list") {
      document
        .getElementById(`cau-${i}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setCurrent(i);
  };

  // Che do tung cau: phim mui ten de chuyen, A-D de chon
  useEffect(() => {
    if (mode === "list" || phase === "nap") return;
    const phim = (e: KeyboardEvent) => {
      if (box || (e.target as HTMLElement).closest("input, select, textarea")) return;
      if (e.key === "ArrowRight") goToQuestion(Math.min(current + 1, items.length - 1));
      else if (e.key === "ArrowLeft") goToQuestion(Math.max(current - 1, 0));
      else {
        const j = LETTERS.indexOf(e.key.toUpperCase());
        if (j >= 0 && j < (items[current]?.dapAn.length ?? 0)) selectAnswer(current, j);
      }
    };
    window.addEventListener("keydown", phim);
    return () => window.removeEventListener("keydown", phim);
  });

  const goBack = () => {
    if (phase === "lam" && answeredCount > 0) setBox("thoat");
    else router.push(`/practice/${quiz.id}`);
  };

  const name = user?.fullname || user?.name || "Bạn";

  /* ---------- Chua dang nhap / dang nap ---------- */
  if (!loading && !user) {
    return (
      <div className={styles.phong}>
        <div className={styles.giua}>
          <p className={styles.centerText}>Đăng nhập để bắt đầu làm bài luyện tập.</p>
          <div className={styles.centerButton}>
            <Link href={`/practice/${quiz.id}`} className={styles.secondaryButton}>
              Quay lại
            </Link>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() =>
                updateUrl(loginUrl(path, new URLSearchParams(window.location.search)))
              }
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "nap" || !tl) {
    return (
      <div className={styles.phong}>
        <div className={styles.giua}>
          <p className={styles.centerText}>
            {loadError || !loadQuestions
              ? "Không tải được câu hỏi của đề."
              : "Đang chuẩn bị đề…"}
          </p>
          {(loadError || !loadQuestions) && (
            <Link href={`/practice/${quiz.id}`} className={styles.secondaryButton}>
              Quay lại
            </Link>
          )}
        </div>
      </div>
    );
  }

  /* ---------- Mot the cau hoi ---------- */
  const questionCard = (i: number) => {
    const c = items[i];
    const chosen = choice[i] ?? [];
    const many = c.dung.length > 1;
    const questionPart = (
      <div className={styles.firstQuestion}>
        <div className={styles.questionNumber}>Câu&nbsp; {i + 1}</div>
        <div className={styles.questionText}>
          <Content html={c.html} s={c.cau} />
        </div>
      </div>
    );
    const answerPart = (
      <div>
        <div className={styles.gach}>
          <span>
            {many ? `Chọn ${c.dung.length} đáp án đúng` : "Chọn một đáp án đúng"}
          </span>
        </div>
        <div className={styles.answerList} role={many ? "group" : "radiogroup"}>
          {c.dapAn.map((a, j) => {
            const picked = chosen.includes(j);
            const className = picked
              ? `${styles.dapAn} ${styles.chosenAnswer}`
              : styles.dapAn;
            return (
              <button
                key={j}
                type="button"
                role={many ? "checkbox" : "radio"}
                aria-checked={picked}
                disabled={phase !== "lam"}
                onClick={() => selectAnswer(i, j)}
                className={className}
              >
                <span className={styles.letter}>{LETTERS[j]}</span>
                <span className={styles.answerLetter}>
                  <Content html={c.html} s={a} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
    return (
      <article
        key={i}
        id={`cau-${i}`}
        className={mode === "split" ? `${styles.the} ${styles.splitCard}` : styles.the}
      >
        {questionPart}
        {answerPart}
      </article>
    );
  };

  const oDs = (
    <div className={styles.oDs}>
      <h2 className={styles.listCellTitle}>Danh sách câu hỏi</h2>
      <div className={styles.luoi}>
        {items.map((c, i) => {
          const className = [
            styles.numberCell,
            answeredQuestion(i) && styles.answeredNumberCell,
            mode !== "list" && i === current && styles.currentNumberCell,
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={i}
              type="button"
              className={className}
              onClick={() => goToQuestion(i)}
              aria-label={`Câu ${i + 1}${answeredQuestion(i) ? ", đã làm" : ""}`}
              aria-current={mode !== "list" && i === current ? "true" : undefined}
            >
              {pad2(i + 1)}
            </button>
          );
        })}
      </div>
      <p className={styles.listCellText}>
        Đã làm {answeredCount}/{items.length} câu
        {fromQuestion > 1 &&
          ` · câu ${fromQuestion} - ${fromQuestion + items.length - 1} của đề`}
      </p>
    </div>
  );

  // Nop xong: man "da gui" roi trang xem dap an
  if (phase === "xong") {
    return (
      <div className={styles.phong}>
        <PracticeResult
          tieuDe={quiz.title}
          ten={name}
          ds={items}
          chon={choice}
          daQua={passed}
          ketThuc={endsAt}
          goBack={() => router.push(`/practice/${quiz.id}`)}
          retry={() => startAttempt(origin, tl, fromQuestion)}
          luu={save}
        />
      </div>
    );
  }

  return (
    <div className={styles.phong}>
      {/* ============ THANH TREN ============ */}
      <header className={styles.thanh}>
        <button
          type="button"
          onClick={goBack}
          className={styles.outlineButton}
          aria-label="Quay lại"
        >
          <ChevronLeft size={18} aria-hidden="true" />
          <span className={styles.emptyText}>Quay lại</span>
        </button>

        <span className={styles.candidate}>Thí sinh: {name}</span>

        <div className={styles.phai}>
          <span className={styles.timer} role="timer" aria-label="Thời gian đã làm">
            <Timer size={18} aria-hidden="true" />
            {timer(passed)}
          </span>

          <button
            type="button"
            className={`${styles.grayButton} ${styles.emptyText}`}
            disabled={fontSize <= FONT_SIZE_MIN}
            onClick={() => setFontSize((v) => Math.max(FONT_SIZE_MIN, v - 0.125))}
            aria-label="Thu nhỏ chữ"
            title="Thu nhỏ chữ"
          >
            <ZoomOut size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`${styles.grayButton} ${styles.emptyText}`}
            disabled={fontSize >= FONT_SIZE_MAX}
            onClick={() => setFontSize((v) => Math.min(FONT_SIZE_MAX, v + 0.125))}
            aria-label="Phóng to chữ"
            title="Phóng to chữ"
          >
            <ZoomIn size={18} aria-hidden="true" />
          </button>

          <div className={styles.menuBoc} ref={menuRef}>
            <button
              type="button"
              className={styles.grayButton}
              aria-haspopup="menu"
              aria-expanded={openMenu}
              aria-label="Kiểu hiển thị"
              title="Kiểu hiển thị"
              onClick={() => setOpenMenu((v) => !v)}
            >
              <List size={18} aria-hidden="true" />
            </button>
            {openMenu && (
              <div className={styles.menu} role="menu">
                {MODES.map(({ id, nhan: label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={mode === id}
                    className={
                      mode === id
                        ? `${styles.menuItem} ${styles.menuSelect}`
                        : styles.menuItem
                    }
                    onClick={() => {
                      setMode(id);
                      setOpenMenu(false);
                    }}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className={`${styles.grayButton} ${styles.phoneOnly}`}
            aria-label="Danh sách câu hỏi"
            aria-expanded={openList}
            onClick={() => setOpenList((v) => !v)}
          >
            <LayoutGrid size={18} aria-hidden="true" />
          </button>

          <button
            type="button"
            className={styles.submitButton}
            onClick={() => setBox("nop")}
          >
            <FilePenLine size={16} aria-hidden="true" /> Nộp bài
          </button>
        </div>
      </header>

      {/* ============ THAN ============ */}
      <div className={styles.scroll} ref={scrollArea}>
        <div className={styles.khung}>
          <section
            className={styles.column}
            style={{ fontSize: `${fontSize}em` }}
            aria-label="Nội dung bài làm"
          >
            {mode === "list" ? (
              items.map((_, i) => questionCard(i))
            ) : (
              <>
                {questionCard(current)}
                <nav className={styles.chuyen} aria-label="Chuyển câu">
                  <button
                    type="button"
                    className={styles.outlineButton}
                    disabled={current === 0}
                    onClick={() => goToQuestion(current - 1)}
                  >
                    <ChevronLeft size={18} aria-hidden="true" /> Câu trước
                  </button>
                  <button
                    type="button"
                    className={styles.outlineButton}
                    disabled={current === items.length - 1}
                    onClick={() => goToQuestion(current + 1)}
                  >
                    Câu sau <ChevronRight size={18} aria-hidden="true" />
                  </button>
                </nav>
              </>
            )}
          </section>

          <aside className={openList ? `${styles.ben} ${styles.openPanel}` : styles.ben}>
            {oDs}
          </aside>
        </div>
      </div>

      {box && (
        <div className={styles.boxBackground} onClick={() => setBox(null)}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="hop-tieu-de"
            className={styles.hop}
            onClick={(e) => e.stopPropagation()}
          >
            {box === "nop" ? (
              // Theo mau hop nop bai cua trang thi goc
              <div className={styles.bodyBox}>
                <h2 id="hop-tieu-de" className={styles.titleBox}>
                  <FileCheck2 size={24} className={styles.iconBox} aria-hidden="true" />
                  Bạn có chắc chắn muốn nộp bài ?
                </h2>
                <p className={styles.rowBox}>
                  Thời gian bạn đã làm:{" "}
                  <strong className={styles.hours}>{timer(passed)}</strong>
                </p>
                {items.length - answeredCount > 0 && (
                  <p className={styles.warningBox}>
                    <strong>Cảnh báo: </strong>
                    Bạn còn {items.length - answeredCount} câu hỏi trắc nghiệm chưa trả
                    lời. Bạn có chắc muốn kết thúc bài thi?
                  </p>
                )}
                <p className={styles.noteBox}>
                  Khi xác nhận nhấn nộp bài, bạn sẽ không thể sửa lại bài thi của mình.
                  Hãy chắc chắn bạn đã xem lại tất cả các đáp án. Chúc bạn may mắn!
                </p>
              </div>
            ) : (
              <div className={styles.bodyBox}>
                <h2 id="hop-tieu-de" className={styles.titleBox}>
                  Thoát khỏi bài làm?
                </h2>
                <p className={styles.rowBox}>Bài đang làm sẽ không được lưu lại.</p>
              </div>
            )}
            <div className={styles.buttonBox}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setBox(null)}
                autoFocus
              >
                Hủy
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() =>
                  box === "nop" ? submit() : router.push(`/practice/${quiz.id}`)
                }
              >
                {box === "nop" ? "Nộp bài" : "Thoát"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
