import { Upload, X } from "lucide-react";

import { setPageSize } from "@/src/lib/document/file-info";
import { MAX_IMAGE_MB, USER_SETTINGS } from "@/src/constants/portal/user-settings-page";

import type { AvatarPicker } from "../hooks/useAvatarPicker";
import styles from "../UserSettings.module.scss";

const A = USER_SETTINGS.personal.avatar;

/** Phan ben trong o sua anh dai dien: chon file hoac dan duong dan. */
export default function AvatarField({ p }: { p: AvatarPicker }) {
  return (
    <>
      {p.pickedImage ? (
        /* Da chon file -> an han o dan duong dan, de khong phai doan
           cai nao se duoc dung khi bam Luu. */
        <div className={styles.card}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.preview} alt={A.previewChosen} className={styles.image} />
          <div className={styles.box9}>
            <p className={styles.text3}>{p.pickedImage.name}</p>
            <p className={styles.text4}>{setPageSize(p.pickedImage.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => p.pickImage(null)}
            aria-label={A.removeChosen}
            className={styles.button3}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <label htmlFor="anh-dai-dien" className={styles.fieldLabel}>
            <Upload size={22} className={styles.box10} />
            <span className={styles.label}>{A.pick}</span>
            <span className={styles.label2}>{A.pickHint(MAX_IMAGE_MB)}</span>
          </label>

          <div className={styles.row2}>
            <span className={styles.label3} />
            <span className={styles.label4}>{A.orPaste}</span>
            <span className={styles.label3} />
          </div>

          <input
            className={styles.input2}
            value={p.avatar}
            placeholder={A.urlPlaceholder}
            onChange={(e) => p.setAvatar(e.target.value)}
          />
          {p.avatar.trim() && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.avatar}
              alt={A.previewUrl}
              className={styles.image2}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </>
      )}

      <input
        id="anh-dai-dien"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className={styles.input}
        onChange={(e) => p.pickImage(e.target.files?.[0] ?? null)}
      />

      {p.imageError && (
        <p role="alert" className={styles.text5}>
          {p.imageError}
        </p>
      )}
    </>
  );
}
