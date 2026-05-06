import type { Metadata } from "next"
import { Encode_Sans_Expanded } from "next/font/google"
import { Toaster } from "react-hot-toast"
import "./globals.css"

const encodeSans = Encode_Sans_Expanded({
  weight: ["100", "300", "400"],
  subsets: ["latin"],
  variable: "--font-encode-sans",
})

export const metadata: Metadata = {
  title: "Fix It",
  description: "Alumni-verified guidance for Macedonian students applying to European universities.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={encodeSans.variable}>
      <body className="min-h-screen font-sans antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { fontFamily: "inherit", fontSize: "14px" },
          }}
        />
      </body>
    </html>
  )
}
