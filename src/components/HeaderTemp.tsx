"use client";

import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-indigo-600 to-indigo-700 z-50 shadow-lg">
      <div className="flex items-center justify-between h-full px-6">
        {/* Título */}
        <h1 className="text-2xl font-bold text-white tracking-tight">
          DevForce
        </h1>

        {/* Botón a la derecha */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md transition"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
