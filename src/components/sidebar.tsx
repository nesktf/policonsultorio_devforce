"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  nombre: string;
  apellido: string;
  rol: "MESA_ENTRADA" | "PROFESIONAL" | "GERENTE";
}

export function Sidebar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error al parsear el usuario:", err);
      }
    }
  }, []);

  if (!user) return null; // Esperamos a que user exista

  const roleLabel = {
    MESA_ENTRADA: "Mesa de Entrada",
    PROFESIONAL: "Profesional",
    GERENTE: "Gerente",
  }[user.rol];

  const roleStyles = {
    MESA_ENTRADA: "bg-blue-100 text-blue-800",
    PROFESIONAL: "bg-green-100 text-green-800",
    GERENTE: "bg-purple-100 text-purple-800",
  }[user.rol];

  return (
    <aside className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white shadow-lg">
      <div className="p-6">
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex flex-col items-start gap-1">
            <p className="text-sm font-medium text-gray-900">{user.nombre}</p>
            <span
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${roleStyles}`}
            >
              {roleLabel}
            </span>
          </div>
        </div>

        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                href="/sist/pacientes"
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm active:bg-indigo-100"
              >
                <span className="ml-3 font-medium">Pacientes</span>
              </Link>
            </li>
            <li>
              <Link
                href="/sist/profesionales"
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm active:bg-indigo-100"
              >
                <span className="ml-3 font-medium">Profesionales</span>
              </Link>
            </li>
            <li>
              <Link
                href="/sist/turnos"
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm active:bg-indigo-100"
              >
                <span className="ml-3 font-medium">Turnos</span>
              </Link>
            </li>
            <li>
              <Link
                href="/sist/obra_social"
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm active:bg-indigo-100"
              >
                <span className="ml-3 font-medium">Obras sociales</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}
