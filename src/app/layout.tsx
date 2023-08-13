import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lunch dice',
  description: 'Roll the dice to determine who will pay for the lunch',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-[#ebe9eb] min-w-[20rem]"} id="root">{children}</body>
    </html >
  )
}
