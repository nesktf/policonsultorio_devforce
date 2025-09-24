"use client";

import { Role } from "@/generated/prisma";

interface UserHeaderProps {
  role: Role;
  nombre: string;
  apellido: string;
}

const getRoleLabel = (role: Role) => {
  switch (role) {
    case "MESA_ENTRADA":
      return "Mesa de Entrada";
    case "PROFESIONAL":
      return "Profesional";
    case "GERENTE":
      return "Gerente";
    default:
      return role;
  }
};

const getRoleColor = (role: Role) => {
  switch (role) {
    case "MESA_ENTRADA":
      return "bg-[#AFE1EA] text-[#0AA2C7]";
    case "PROFESIONAL":
      return "bg-[#E4F1F9] text-[#4D94C8]";
    case "GERENTE":
      return "bg-[#0AA2C7] text-white";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export function UserHeader({ role, nombre, apellido }: UserHeaderProps) {
  return (
    <div className="bg-white border-b border-[#AFE1EA] shadow-sm">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img src="/logo.svg" alt="Logo" className="h-8 w-auto mr-3" />
            <span className="text-[#0AA2C7] font-semibold text-lg">
              Policonsultorio DevForce
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                role
              )}`}
            >
              {getRoleLabel(role)}
            </div>
            <div className="text-gray-700">
              <span className="font-medium">
                {nombre} {apellido}
              </span>
            </div>
            <button
              className="ml-4 p-2 text-[#4D94C8] hover:text-[#0AA2C7] hover:bg-[#E4F1F9] rounded-full transition-colors"
              title="Cerrar sesión"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
