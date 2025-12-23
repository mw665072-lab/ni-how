import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/toaster";
import AuthSidebar from '@/components/AuthSidebar';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ni hao now",
  description: "Ni hao now",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <div className="flex min-h-screen">
            <AuthSidebar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </AppProvider>
        <Toaster />
      </body>
    </html>
  );
}
