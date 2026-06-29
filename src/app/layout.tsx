import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/layout/providers'

export const metadata: Metadata = {
  title: 'Semua — Help you track, your everything.',
  description: 'A simple all-in-one productivity platform to organize your tasks, finances, habits and goals from one beautiful dashboard.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,600,700,800,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#F8F9FB] min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
