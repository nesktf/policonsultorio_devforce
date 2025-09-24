// src/app/secciones/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "../secciones/components/Header";
import { Sidebar } from "../secciones/components/Sidebar";
import { UserProvider } from "../secciones/context/user";
import "./globals.css";

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
      <Header />
      <Sidebar />
      <main
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 pt-14 pl-64`}
      >
        {children}
      </main>
    </UserProvider>
  );
}
