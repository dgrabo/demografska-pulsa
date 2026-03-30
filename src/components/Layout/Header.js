'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Layout.module.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/usporedi', label: 'Usporedi' },
    { href: '/usluge', label: 'Usluge' },
    { href: '/mirovine', label: 'Mirovine' },
    { href: '/migracije', label: 'Migracije' },
    { href: '/projekcije', label: 'Projekcije' },
    { href: '/o-podacima', label: 'O podacima' },
  ];

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
        <svg
          className={styles.logoIcon}
          viewBox="0 0 32 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <polyline
            points="0,10 6,10 9,3 12,17 15,6 18,14 21,10 26,10 28,4 30,10 32,10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        DemografskaPulsa
      </Link>

      <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.navLink} ${pathname === link.href ? styles.navLinkActive : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <button
        className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Zatvori izbornik' : 'Otvori izbornik'}
        aria-expanded={menuOpen}
      >
        <span className={styles.hamburgerLine} />
        <span className={styles.hamburgerLine} />
        <span className={styles.hamburgerLine} />
      </button>
    </header>
  );
}
