import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Historical Soldier & Horse Walking Parallax',
  description: 'Endless loop walking animation of historical soldier and horse for strategy game backgrounds with parallax scrolling, calm ambient music, and Veo video generation.',
  openGraph: {
    title: 'Historical Soldier & Horse Walking Parallax',
    description: 'Endless loop walking animation of historical soldier and horse for strategy game backgrounds with parallax scrolling, calm ambient music, and Veo video generation.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Historical Soldier & Horse Walking Parallax',
    description: 'Endless loop walking animation of historical soldier and horse for strategy game backgrounds with parallax scrolling, calm ambient music, and Veo video generation.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
