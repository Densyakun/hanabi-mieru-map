import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '花火見える地図 - Hanabi mieru map',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
