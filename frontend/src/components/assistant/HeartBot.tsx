"use client";

import { useEffect, useRef, useState } from "react";
import { BotAvatar, type BotAvatarState } from "bot-avatars";

// Than hinh trai tim, ve trong khung 100x100 tam (50, 50) theo quy uoc cua
// bot-avatars. Thu vien khong co san hinh trai tim trong 18 kieu nen tu ve.
const TRAI_TIM =
  "M50 86 C 22 66, 6 50, 9 33 C 12 17, 33 10, 50 27 C 67 10, 88 17, 91 33 C 94 50, 78 66, 50 86 Z";

const DO = "#e8243c";

// Chuot dung yen bao lau thi tra lai cho thu vien tu dieu khien (nhin quanh,
// nhay, lon vong). Giu pose mai thi con bot dung im nhu tuong.
const NHA_SAU_MS = 2500;

// Goc quay toi da, radian. Lon hon thi o goc man hinh mat bi xoay khuat vao
// sau than, nhin nhu bi lien.
const YAW_MAX = 0.75;
const PITCH_MAX = 0.5;

type Pose = { yaw: number; pitch: number };

interface Props {
  size: number;
  state: BotAvatarState;
  /** Quay dau nhin theo con tro o BAT KY dau tren trang. */
  nhinTheoChuot?: boolean;
}

export default function BotTraiTim({ size, state, nhinTheoChuot = false }: Props) {
  const boc = useRef<HTMLSpanElement>(null);
  const [pose, setPose] = useState<Pose | undefined>(undefined);

  useEffect(() => {
    if (!nhinTheoChuot) return;

    // Thu vien tu dung yen khi nguoi dung tat chuyen dong; minh cung khong
    // xoay dau theo chuot trong truong hop do.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Vi sao tu lam thay vi dung `interactive` cua thu vien: no chi nhin theo
    // khi chuot o trong khoang ~3 lan be rong dau (so cung trong ma nguon, khong
    // co prop nao doi), tuc la voi nut 60px chi khi chuot sat goc phai duoi.
    let khung = 0;
    let hen: ReturnType<typeof setTimeout> | undefined;
    let x = 0;
    let y = 0;

    const tinh = () => {
      khung = 0;
      const o = boc.current?.getBoundingClientRect();
      if (!o) return;

      const dx = x - (o.left + o.width / 2);
      const dy = y - (o.top + o.height / 2);
      // Chia cho kich thuoc man hinh: chuot o mep doi dien la quay gan het co.
      const nx = Math.max(-1, Math.min(1, dx / (window.innerWidth * 0.6)));
      const ny = Math.max(-1, Math.min(1, dy / (window.innerHeight * 0.6)));

      setPose({ yaw: nx * YAW_MAX, pitch: -ny * PITCH_MAX });
    };

    const diChuyen = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      // Gom ve mot lan moi khung hinh: pointermove ban toi vai tram lan/giay.
      if (!khung) khung = requestAnimationFrame(tinh);

      clearTimeout(hen);
      hen = setTimeout(() => setPose(undefined), NHA_SAU_MS);
    };

    window.addEventListener("pointermove", diChuyen, { passive: true });

    return () => {
      window.removeEventListener("pointermove", diChuyen);
      cancelAnimationFrame(khung);
      clearTimeout(hen);
    };
  }, [nhinTheoChuot]);

  return (
    <span ref={boc} style={{ display: "inline-flex", lineHeight: 0 }}>
      <BotAvatar
        type="circle"
        path={TRAI_TIM}
        color={DO}
        size={size}
        state={state}
        pose={pose}
        // Nut nho o dau hop chat thi tat: re chuot qua thanh tieu de ma no
        // nhay loan len thi roi mat.
        interactive={nhinTheoChuot}
      />
    </span>
  );
}
