import Link from 'next/link';
import styles from './Layout.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>DemografskaPulsa</Link>
    </header>
  );
}
