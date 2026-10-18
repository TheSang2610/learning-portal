"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Save } from "lucide-react";

import { Button, Card, PageHeader, Switch } from "@/src/components/admin-ui";
import HomePromo from "@/src/components/features/portal/home/HomePromo";
import { ADMIN_APPEARANCE as C } from "@/src/constants/admin/appearance-page";
import { HOME_PAGE } from "@/src/constants/portal/home-page";
import {
  DEFAULT_APPEARANCE,
  getAppearance,
  updateAppearance,
  type Appearance,
  type BannerTheme,
  type HomeSectionKey,
} from "@/src/services/settings";

import styles from "./AdminAppearance.module.scss";

type BannerKey = keyof Appearance["banners"];
type ColorKey = Exclude<keyof BannerTheme, "enabled">;

/** O chon mau: bang mau + o go ma hex (dong bo hai chieu). */
function ColorInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [text, setText] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  // Chon tu bang mau / dat lai mac dinh -> cap nhat o chu.
  if (lastValue !== value) {
    setLastValue(value);
    setText(value);
  }

  return (
    <div className={styles.color}>
      <label htmlFor={id} className={styles.colorLabel}>
        {label}
      </label>
      <div className={styles.colorRow}>
        <input
          id={id}
          type="color"
          value={
            value.length === 4
              ? `#${[...value.slice(1)].map((c) => c + c).join("")}`
              : value
          }
          onChange={(e) => onChange(e.target.value)}
          className={styles.swatch}
        />
        <input
          type="text"
          value={text}
          maxLength={7}
          spellCheck={false}
          aria-label={`${label} (mã hex)`}
          onChange={(e) => {
            setText(e.target.value);
            // Chi nhan khi da la ma hex hop le - dang go do thi chua ap.
            if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(e.target.value))
              onChange(e.target.value);
          }}
          className={styles.hex}
        />
      </div>
    </div>
  );
}

/**
 * Trang /admin/appearance: bat/tat ba cot khoa hoc noi bat o trang chu, va
 * mau hai dai quang cao (cho khach / cho hoc vien) - xem truoc ngay tren trang.
 *
 * Luu xong, trang chu doi trong khoang 30 giay (bo dem cua trang chu).
 */
export default function AdminAppearance() {
  const [data, setData] = useState<Appearance | null>(null);
  const [saved, setSaved] = useState<Appearance | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    getAppearance()
      .then((a) => {
        setData(a);
        setSaved(a);
      })
      .catch(() => {
        setData(DEFAULT_APPEARANCE);
        setSaved(DEFAULT_APPEARANCE);
      });
  }, []);

  if (!data) return <p className={styles.loading}>{C.loading}</p>;

  const dirty = JSON.stringify(data) !== JSON.stringify(saved);

  const setSection = (k: HomeSectionKey, v: boolean) =>
    setData({ ...data, homeSections: { ...data.homeSections, [k]: v } });

  const setBanner = (b: BannerKey, patch: Partial<BannerTheme>) =>
    setData({
      ...data,
      banners: { ...data.banners, [b]: { ...data.banners[b], ...patch } },
    });

  const save = async () => {
    setStatus("saving");
    try {
      const next = await updateAppearance(data);
      setData(next);
      setSaved(next);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title={C.title}
        description={C.description}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => saved && setData(saved)}
              disabled={!dirty}
            >
              {C.undo}
            </Button>
            <Button onClick={save} disabled={!dirty || status === "saving"}>
              <Save size={16} aria-hidden />
              {status === "saving" ? C.saving : C.save}
            </Button>
          </>
        }
      />

      {status === "saved" && !dirty && <p className={styles.notice}>{C.savedNotice}</p>}
      {status === "error" && <p className={styles.errorNotice}>{C.saveError}</p>}

      <Card title={C.sections.title} description={C.sections.description}>
        <div className={styles.switches}>
          {C.sections.items.map((it) => (
            <Switch
              key={it.key}
              id={`section-${it.key}`}
              label={it.label}
              description={it.description}
              checked={data.homeSections[it.key]}
              onChange={(v) => setSection(it.key, v)}
            />
          ))}
        </div>
      </Card>

      {C.banners.map((b) => {
        const theme = data.banners[b.key];
        const content =
          b.key === "guestPromo" ? HOME_PAGE.guestPromo : HOME_PAGE.memberPromo;
        return (
          <Card
            key={b.key}
            title={b.title}
            description={b.description}
            actions={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBanner(b.key, DEFAULT_APPEARANCE.banners[b.key])}
              >
                <RotateCcw size={14} aria-hidden />
                {C.resetColors}
              </Button>
            }
          >
            <Switch
              id={`banner-${b.key}`}
              label={C.showBanner}
              description={b.where}
              checked={theme.enabled}
              onChange={(v) => setBanner(b.key, { enabled: v })}
            />

            <div className={styles.colorGroups}>
              {C.colorGroups.map((g) => (
                <fieldset key={g.title} className={styles.colorGroup}>
                  <legend>{g.title}</legend>
                  <div className={styles.colors}>
                    {g.keys.map((k) => (
                      <ColorInput
                        key={k}
                        id={`${b.key}-${k}`}
                        label={C.colorLabels[k as ColorKey]}
                        value={theme[k as ColorKey]}
                        onChange={(v) => setBanner(b.key, { [k]: v })}
                      />
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>

            <div className={styles.previewLabel}>{C.preview}</div>
            <div
              className={`${styles.preview} ${theme.enabled ? "" : styles.previewOff}`}
            >
              <HomePromo
                variant={b.key === "guestPromo" ? "guest" : "member"}
                {...content}
                theme={theme}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
