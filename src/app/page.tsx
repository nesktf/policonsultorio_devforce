"use client";

import { DashboardContent } from "@/components/dashboard-content";
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/login");
}
