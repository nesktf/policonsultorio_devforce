// src/app/login/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/v1/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Error al iniciar sesión");
      return;
    }

    // Guardar usuario en localStorage
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirigir por rol
    switch (data.user.rol) {
      case "GERENTE":
        router.push("secciones/roles/gerente/pacientes");
        break;
      case "MESA_ENTRADA":
        router.push("secciones/roles/mesa_entrada/pacientes");
        break;
      case "PROFESIONAL":
        router.push("secciones/roles/profesional/pacientes");
        break;
      default:
        alert("Rol no válido");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 to-indigo-700">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Logo de la empresa"
            width={300}
            height={250}
            className="rounded-md"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Iniciar sesión
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-black border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-black border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-md transition"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
