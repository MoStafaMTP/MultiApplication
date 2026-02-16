import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Seat Cover Before/After',
  description: 'Admin panel for before/after cases',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  )
}
