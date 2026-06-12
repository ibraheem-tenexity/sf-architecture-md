import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'architecture.md — Generate living architecture docs',
  description: 'Connect a repo and get a living, committable ARCHITECTURE.md',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-screen overflow-hidden bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
