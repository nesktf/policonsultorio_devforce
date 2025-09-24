// src/app/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      // si no hay usuario guardado, redirigir al login
      router.push("/login");
      return;
    }
    try {
      const parsed: User = JSON.parse(stored);
      setUser(parsed);
    } catch {
      // si JSON mal formado o algo raro
      router.push("/login");
    }
  }, [router]);

  if (!user) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h1>Bienvenido/a, {user.nombre}</h1>

      <button>Calendario</button>
    </div>
  );
}
