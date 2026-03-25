import styles from './Layout.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>DemografskaPulsa</div>
    </header>
  );
}
