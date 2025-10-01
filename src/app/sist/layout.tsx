// src/app/secciones/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "../../components/header";
import { SidebarOficial } from "../../components/sidebar";
import { UserProvider } from "../../context/user";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from "@/components/ui/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevForce Policonsultorio",
  description: "Sistema de gestión para policonsultorios",
};

export default function SeccionesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <SidebarProvider>
        <Header />
        <SidebarOficial /> {/* Este será el Sidebar nuevo, estilizado */}
        <main className="flex w-full">
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
        </main>
      </SidebarProvider>
    </UserProvider>
  );
}
