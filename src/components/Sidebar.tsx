'use client';

import Link from 'next/link';
import { useUser } from '@/context/user';

export function Sidebar() {
  const user = useUser();
  
  const roleLabel = {
    MESA_ENTRADA: 'Mesa de Entrada',
    PROFESIONAL: 'Profesional',
    GERENTE: 'Gerente'
  }[user.role];

  const roleStyles = {
    MESA_ENTRADA: 'bg-blue-100 text-blue-800',
    PROFESIONAL: 'bg-green-100 text-green-800',
    GERENTE: 'bg-purple-100 text-purple-800'
  }[user.role];

  return (
    <aside className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white shadow-lg">
      <div className="p-6">
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex flex-col items-start gap-1">
            <p className="text-sm font-medium text-gray-900">
              {user.nombre} {user.apellido}
            </p>
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${roleStyles}`}>
              {roleLabel}
            </span>
          </div>
        </div>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                href="/pacientes"
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm active:bg-indigo-100"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span className="ml-3 font-medium">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/pacientes"
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm active:bg-indigo-100"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span className="ml-3 font-medium">Pacientes</span>
              </Link>
            </li>
            <li>
              <Link
                href="/profesionales"
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm active:bg-indigo-100"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span className="ml-3 font-medium">Profesionales</span>
              </Link>
            </li>
            <li>
              <Link
                href="/turnos"
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm active:bg-indigo-100"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="ml-3 font-medium">Turnos</span>
              </Link>
            </li>
            <li>
              <Link
                href="/obra_social"
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm active:bg-indigo-100"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="ml-3 font-medium">Obras sociales</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}
