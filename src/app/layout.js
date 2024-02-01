'use client'
import './globals.css'
import '../lib/data_functions'


// export const metadata = {
//   title: 'Bible Passage Selector',
//   description: 'Tool to keep track of Bible Reading',
//   icons: {
//     icon: "/bible.png"
//   }
// }

export default function RootLayout({children, params}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
