import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Roame — Discover Activities Near You',
  description: 'Join local activities, meet new people, and explore what\'s happening around you.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Roame',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  )
}

