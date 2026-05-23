import './globals.css'
import React from 'react'
import Navbar from '../components/Navbar'

export const metadata = {
  title: 'AeroBook',
  description: 'Smart flight booking & seat management.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
