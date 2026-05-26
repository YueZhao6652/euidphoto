import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-dm-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'EUIDPhoto – Free EU Biometric Passport Photo Tool',
    template: '%s | EUIDPhoto',
  },
  description:
    'Create compliant European passport and ID photos online for free. Supports Germany, France, UK, Netherlands, Belgium, Spain, Italy, and USA. Instant download.',
  keywords: [
    'passport photo online',
    'EU passport photo',
    'biometric photo',
    'ID photo',
    'Germany passport photo',
    'France passport photo',
    'UK passport photo',
    'free passport photo',
    'online passport photo tool',
  ],
  authors: [{ name: 'EUIDPhoto' }],
  creator: 'EUIDPhoto',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://euidphoto.com',
    siteName: 'EUIDPhoto',
    title: 'EUIDPhoto – Free EU Biometric Passport Photo Tool',
    description:
      'Turn any photo into a compliant passport photo in seconds. Free, no sign-up required.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EUIDPhoto – Free EU Biometric Passport Photo Tool',
    description: 'Create compliant passport photos online for free.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body className="bg-cream font-sans text-ink antialiased">{children}</body>
    </html>
  )
}
