import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/Toaster";
import { ConfirmProvider } from "@/hooks/use-confirm";

export const metadata: Metadata = {
  title: "Kids Schedule",
  description: "자녀 등하원 일정 관리 서비스",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kids Schedule",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900 bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 min-h-screen`}
      >
        <ThemeProvider>
          <ConfirmProvider>
            {children}
            <Toaster />
          </ConfirmProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
