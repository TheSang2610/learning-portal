import { useState } from "react";
import { ImageOff, Link2, UploadCloud, X } from "lucide-react";

import SafeImage from "@/src/components/ui/SafeImage";
import { ADMIN_USERS as C } from "@/src/constants/admin/users-page";

import type { AdminUser } from "../hooks/useAdminUsers";
import styles from "../AdminUsers.module.scss";

/**
 * Anh trong khung xem phong to.
 *
 * Tach rieng de state loi tu reset: khung xem duoc gan key theo _id, doi nguoi
 * la component nay unmount roi mount lai, khong can effect nao de xoa co loi.
 */
function ZoomedImage({ src, ten: name }: { src: string; ten?: string }) {
  const [err, setErr] = useState(false);

  if (err) {
    return (
      <div className={styles.col}>
        <ImageOff size={32} />
        <p className={styles.text}>{C.avatar.loadFailed}</p>
        <p className={styles.text2}>{src}</p>
      </div>
    );
  }

  return (
    <SafeImage
      src={src}
      alt={C.avatar.alt(name)}
      width={512}
      height={512}
      onError={() => setErr(true)}
      className={styles.box}
    />
  );
}

interface AvatarViewerProps {
  user: AdminUser & { avatar: string };
  onClose: () => void;
}

/** Khung xem anh dai dien phong to + nguon anh. Bam nen hoac Esc de dong. */
export default function AvatarViewer({ user, onClose }: AvatarViewerProps) {
  return (
    <div onClick={onClose} className={styles.overlay}>
      <div onClick={(e) => e.stopPropagation()} className={styles.card3}>
        <div className={styles.row8}>
          <div className={styles.box3}>
            <h2 className={styles.heading}>{user.name}</h2>
            <p className={styles.text5}>{user.email}</p>
          </div>
          <button onClick={onClose} className={styles.button6}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.row9}>
          <ZoomedImage key={user._id} src={user.avatar} ten={user.name} />
        </div>

        <div className={styles.stack2}>
          <p className={styles.text7}>
            {user.avatarPublicId ? (
              <>
                <UploadCloud size={14} className={styles.box5} />
                {C.avatar.uploaded}
              </>
            ) : (
              <>
                <Link2 size={14} className={styles.box6} />
                {C.avatar.external}
              </>
            )}
          </p>
          <a
            href={user.avatar}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            {user.avatar}
          </a>
        </div>
      </div>
    </div>
  );
}
