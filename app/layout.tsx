import type { Metadata } from "next"
import { Encode_Sans_Expanded } from "next/font/google"
import { Toaster } from "sonner"
import NavbarWrapper from "@/components/layout/NavbarWrapper"
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
        <NavbarWrapper />
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
