import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata, Viewport } from 'next'
import { Fraunces, IBM_Plex_Mono, Inter } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const plex = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fixt.example.com'),
  title: {
    default: 'Fixt | Appointment Booking Software for Service Businesses',
    template: '%s | Fixt',
  },
  description: 'Fixt gives service businesses a clear online booking system for services, client scheduling, availability, appointments, and cancellations.',
  applicationName: 'Fixt',
  authors: [{ name: 'Fixt' }],
  creator: 'Fixt',
  publisher: 'Fixt',
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f7f5ef',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${plex.variable}`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
    </ClerkProvider>
  )
}
