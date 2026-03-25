import "./globals.css";

export const metadata = {
  title: "DemografskaPulsa — Demografska slika Hrvatske",
  description:
    "Interaktivna vizualizacija demografskih podataka Republike Hrvatske. Popis 2021., trendovi, projekcije.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hr">
      <body>{children}</body>
    </html>
  );
}
