import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import MainLayout from '../components/layout/MainLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Verity | Trustworthy Briefs',
  description: 'AI-powered, human-approved, chain-verified financial briefs.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-text-primary`}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#334155',
              color: '#f1f5f9',
            },
          }}
        />
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  )
}