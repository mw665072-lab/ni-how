import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/toaster";
import AuthSidebar from '@/components/AuthSidebar';
import ConditionalHeader from '@/components/ConditionalHeader';
import Layout from "@/components/layout";

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
         <Layout>{children}</Layout>
        </AppProvider>
        <Toaster />
      </body>
    </html>
  );
}
