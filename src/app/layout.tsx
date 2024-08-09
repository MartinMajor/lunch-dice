import './globals.css';
import 'material-symbols';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const interFont = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata: Metadata = {
  title: 'Lunch Dice',
  description: 'Roll the dice to determine who pays for lunch. Who will be lucky?',
  manifest: '/manifest.json',
};

type Props = {
  children: React.ReactNode;
};

// TODO: Add FontLoader to load Inter font & Material Symbols Icons; Create solution to handle var(--common-animation-play-state) in CSS
export default function RootLayout(props: Props) {
  return (
    <html lang='en'>
      <head>
        <link rel='shortcut icon' href='/favicon.svg' />
      </head>
      <body className={`${interFont.className} bg-zinc-100 text-black`} id='root'>
        {props.children}
      </body>
    </html>
  );
}
