// app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'PodSite‑Killer',
  description: 'Turn any podcast RSS feed into a modern site',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui' }}>{children}</body>
    </html>
  );
}
