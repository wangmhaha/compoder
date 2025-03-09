import type { Metadata } from "next"
import localFont from "next/font/local"
import { ThemeProvider } from "@/components/provider/theme-provider"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "Shadcn/UI Renderer",
  description: "Shadcn/UI Renderer",
  icons: [{ type: "image/svg+xml", url: "/logo.svg" }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased fixed w-full h-full overflow-hidden overscroll-behavior-none`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="w-full h-full overflow-scroll">
            {children}
          </div>
        </ThemeProvider>
        <Toaster />
        <script src="https://cdn.tailwindcss.com"></script>
      </body>
    </html>
  )
}
