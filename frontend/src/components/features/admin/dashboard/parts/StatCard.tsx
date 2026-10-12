import styles from "../AdminDashboard.module.scss";

export default function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>{label}</h2>

      <p className={styles.text}>{value}</p>
    </div>
  );
}
