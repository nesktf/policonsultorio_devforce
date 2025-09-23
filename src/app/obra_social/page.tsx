'use client';

import { useEffect, useState } from 'react';
import { APIEstadoObraSocial } from '../api/v1/obra_social/route';
import { EstadoObraSocial } from '@/generated/prisma';

function buildGETQuery(name?: string, state?: APIEstadoObraSocial): string {
  if (name || state) {
    let url = "/api/v1/obra_social?";
    if (name && name != "") {
      url += `name=${encodeURIComponent(name)}`;
    }
    if (state) {
      if (name) {
        url += "&";
      }
      url += `state_id=${encodeURIComponent(state)}`;
    }
    return url.toString();
  } else {
    return "/api/v1/obra_social"
  }
}

type ObraSocialApiData = { id: number, nombre: string, estado: EstadoObraSocial };

export default function ObraSocialPage() {
  const [obrasSociales, setObrasSociales] = useState<Array<ObraSocialApiData>>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchState, setSearchState] = useState<APIEstadoObraSocial|undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  const queryObrasSociales = async (name?: string, state?: APIEstadoObraSocial) => {
    try {
      let res: Array<ObraSocialApiData> = await fetch(buildGETQuery(name, state), {
        method: "GET",
      })
      .then(async (body) => await body.json())
      .then((json) => {
        return json.obras_sociales.map((os: any): ObraSocialApiData => {
          return {
            id: os.id,
            nombre: os.nombre,
            estado: os.estado
          };
        });
      });
      setObrasSociales(res);
    } catch (err) {
      console.log(`${err}`);
      setObrasSociales([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let term = e.target.value.toString();
    setSearchTerm(term);
    setLoading(true);
    queryObrasSociales(term, searchState);
  };

  const handleStateSearch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let num = Number(e.target.value);
    setSearchState(num == 0 ? undefined : num);
    setLoading(true);
    queryObrasSociales(searchTerm, num == 0 ? undefined : num);
  }

  useEffect(() => {
    queryObrasSociales(searchTerm, searchState);
  }, []);

  return (
    <div className="p-6 bg-[#E4F1F9]">
      <div className="flex flex-col gap-6 mb-6">

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#0AA2C7]">Listado de Obras sociales</h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative w-full max-w-xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-[#4D94C8]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>

              <input
                type="text"
                placeholder="Buscar obra social por nombre"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200"
                />
            </div>
          </div>
        </div>

        <select
          className="select px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchState}
          onChange={handleStateSearch}
          disabled={loading || obrasSociales.length == 0}
          >
          <option key={0} value={0}>
            TODOS
          </option>
          <option key={APIEstadoObraSocial.ACTIVA} value={APIEstadoObraSocial.ACTIVA}>
            ACTIVA
          </option>
          <option key={APIEstadoObraSocial.INACTIVA} value={APIEstadoObraSocial.INACTIVA}>
            INACTIVA
          </option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-lg border-2 border-[#AFE1EA]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-sm border-b-2 border-[#AFE1EA] bg-[#E4F1F9]">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">Nombre</th>
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">Estado</th>
              </tr>
            </thead>
            <tbody>
            {obrasSociales.map((os) => (
              <tr key={os.id} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{os.nombre}</td>
                <td className="px-6 py-4 text-gray-900">{os.estado}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

