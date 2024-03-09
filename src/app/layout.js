'use client'
import './globals.css'
import '../lib/data_functions'

export default function RootLayout({children, params}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
