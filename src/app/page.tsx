"use client";

import { DashboardContent } from "@/components/dashboard-content";
import { MainLayout } from "@/components/layout/main-layout";
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/login");
}
