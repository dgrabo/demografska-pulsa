import "./globals.css";

export const metadata = {
  metadataBase: new URL('https://demografska-pulsa.vercel.app'),
  title: {
    default: 'DemografskaPulsa - Demografska slika Hrvatske',
    template: '%s | DemografskaPulsa',
  },
  description:
    'Interaktivna vizualizacija demografskih podataka Republike Hrvatske. Popis 2021., trendovi, projekcije do 2050.',
  keywords: [
    'Hrvatska', 'demografija', 'stanovništvo', 'popis 2021', 'depopulacija',
    'županije', 'općine', 'DZS', 'statistika', 'interaktivna karta',
  ],
  authors: [{ name: 'DemografskaPulsa' }],
  openGraph: {
    title: 'DemografskaPulsa - Demografska slika Hrvatske',
    description:
      'Interaktivna vizualizacija demografskih podataka Republike Hrvatske. Popis 2021., trendovi, projekcije do 2050.',
    url: 'https://demografska-pulsa.vercel.app',
    siteName: 'DemografskaPulsa',
    locale: 'hr_HR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DemografskaPulsa - Demografska slika Hrvatske',
    description:
      'Interaktivna vizualizacija demografskih podataka Republike Hrvatske.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="hr">
      <body>{children}</body>
    </html>
  );
}
