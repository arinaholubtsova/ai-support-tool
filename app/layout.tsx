import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI-обробка звернень',
  description: 'Внутрішня система підтримки клієнтів з AI-аналізом',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uk">
      <body className={`${inter.variable} font-sans bg-slate-100 text-slate-900`}>
        {children}
      </body>
    </html>
  )
}
