/**
 * Bo thanh phan giao dien chung cho khu quan tri / giang vien, theo shadcn/ui
 * (bang mau neutral). Moi trang admin dung bo nay de form, nut, bang... trong
 * giong nhau - khong tu ve lai tung trang.
 */
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import styles from "./AdminUi.module.scss";

export { styles as adminUi };

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");

/** Tieu de trang: ten + mo ta ben trai, nut thao tac ben phai. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        {description && <p className={styles.pageDesc}>{description}</p>}
      </div>
      {actions && <div className={styles.pageActions}>{actions}</div>}
    </div>
  );
}

/** Khung trang vien mong bo goc 12px; co the co tieu de + mo ta + nut. */
export function Card({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx(styles.card, className)}>
      {(title || actions) && (
        <div className={styles.cardHead}>
          <div>
            {title && <h2 className={styles.cardTitle}>{title}</h2>}
            {description && <p className={styles.cardDesc}>{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={styles.cardBody}>{children}</div>
    </section>
  );
}

type ButtonVariant = "default" | "outline" | "ghost" | "destructive" | "secondary";
type ButtonSize = "sm" | "md" | "icon";

/** Class cua nut - dung cho <Link> can trong giong nut. */
export const buttonClass = (
  variant: ButtonVariant = "default",
  size: ButtonSize = "md",
) => cx(styles.button, styles[`btn_${variant}`], styles[`size_${size}`]);

/** Nut kieu shadcn. */
export function Button({
  variant = "default",
  size = "md",
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      type="button"
      {...rest}
      className={cx(buttonClass(variant, size), className)}
    />
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={cx(styles.input, className)} />;
}

export function Textarea({
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={cx(styles.input, styles.textarea, className)} />;
}

export function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...rest} className={cx(styles.input, styles.select, className)} />;
}

/** Nhan + o nhap + goi y / loi ben duoi. */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
      </label>
      {children}
      {error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        hint && <p className={styles.hint}>{hint}</p>
      )}
    </div>
  );
}

/** Cong tac bat/tat (Switch cua shadcn) kem nhan va mo ta. */
export function Switch({
  checked,
  onChange,
  label,
  description,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: ReactNode;
  id: string;
}) {
  return (
    <div className={styles.switchRow}>
      <div>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {description && <p className={styles.hint}>{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx(styles.switch, checked && styles.switchOn)}
      >
        <span className={styles.switchThumb} />
      </button>
    </div>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "info" | "warning" | "danger";
  children: ReactNode;
}) {
  return <span className={cx(styles.badge, styles[`badge_${tone}`])}>{children}</span>;
}
