import styles from './StatCard.module.css';

export default function StatCard({ label, value, description, negative }) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={`${styles.value} ${negative ? styles.negative : styles.neutral}`}>
        {value}
      </span>
      {description && <span className={styles.description}>{description}</span>}
    </div>
  );
}
