'use client';

import { useEffect, useState } from 'react';
import { APIEstadoObraSocial } from '../api/v1/obra_social/route';
import { EstadoObraSocial } from '@/generated/prisma';

function buildGETQuery(name?: string, state?: APIEstadoObraSocial): string {
  if (name || state) {
    let url = "/api/v1/obra_social?"
    if (name) {
      url += `name=${encodeURIComponent(name)}`;
    }
    if (state) {
      url += `state_id=${encodeURIComponent(state)}`;
    }
    return url;
  } else {
    return "/api/v1/obra_social"
  }
}

type ObraSocialApiData = { id: number, nombre: string, estado: EstadoObraSocial };

export default function ObraSocialPage() {
  const [obrasSociales, setObrasSociales] = useState<Array<ObraSocialApiData>>([]);
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
      setObrasSociales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queryObrasSociales();
  });

  return (
    <div className="p-6 bg-[#E4F1F9]">
      <div className="flex flex-col gap-6 mb-6">

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#0AA2C7]">Listado de Obras sociales</h2>
        </div>

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

