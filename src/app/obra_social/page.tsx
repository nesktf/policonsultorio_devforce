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

const modal_titles = ["Registrar una nueva obra social", "Editar obra social"];

export default function ObraSocialPage() {
  const [obrasSociales, setObrasSociales] = useState<Array<ObraSocialApiData>>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchState, setSearchState] = useState<APIEstadoObraSocial|undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>(modal_titles[0]);

  const [selectedID, setSelectedID] = useState<number|undefined>(undefined);
  const [selectedNombre, setSelectedNombre] = useState<string|undefined>(undefined);
  const [selectedEstado, setSelectedEstado] = useState<APIEstadoObraSocial>(1);

  const queryObrasSociales = async (name?: string, state?: APIEstadoObraSocial) => {
    setLoading(true);
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

  const uploadObraSocial = async () => {
    setLoading(true);
    try {
      if (!selectedNombre) {
        throw Error("Missing name");
      }
      await fetch("/api/v1/obra_social", {
        method: selectedID ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedID ? selectedID : undefined,
          nombre: selectedNombre,
          estado: selectedEstado,
        }),
      })
      .then(async (body) => await body.json())
      .then((json) => {
        console.log(`${json}`);
      });
      queryObrasSociales(searchTerm, searchState);
      setModalOpen(false);
    } catch (err) { 
      console.log(`${err}`);
    } finally {
      setLoading(true);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let term = e.target.value.toString();
    setSearchTerm(term);
    queryObrasSociales(term, searchState);
  };

  const handleStateSearch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let num = Number(e.target.value);
    setSearchState(num == 0 ? undefined : num);
    queryObrasSociales(searchTerm, num == 0 ? undefined : num);
  }

  const onAddObraSocial = () => {
    setSelectedID(undefined);
    setSelectedNombre(undefined);
    setSelectedEstado(1);

    setModalTitle(modal_titles[0]);
    setModalOpen(true);
  };

  const onSelectObraSocial = (os: ObraSocialApiData) => {
    setSelectedID(os.id);
    setSelectedNombre(os.nombre);
    setSelectedEstado(os.estado == "ACTIVA" ? APIEstadoObraSocial.ACTIVA : APIEstadoObraSocial.INACTIVA);

    setModalTitle(modal_titles[1]);
    setModalOpen(true);
  };

  useEffect(() => {
    queryObrasSociales(searchTerm, searchState);
  }, []);

  return (
    <div className="p-6 bg-[#E4F1F9]">
      <div className="flex flex-col gap-6 mb-6">

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#0AA2C7]">Listado de Obras sociales</h2>
          <button
            type="button"
            onClick={onAddObraSocial}
            className="px-4 py-2 text-sm text-white bg-[#18AEFB] rounded-lg hover:bg-[#4D94C8] focus:outline-none focus:ring-2 focus:ring-[#0AA2C7] cursor-pointer transition-colors"
          >
            Registrar una nueva obra social
          </button>
        </div>
      </div>

      {!modalOpen ? null : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4">
          <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-black">{modalTitle}</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Cerrar formulario"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={selectedNombre}
                    onChange={(e) => setSelectedNombre(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-[#AFE1EA] text-gray-900 rounded-lg focus:ring-2 focus:ring-[#0AA2C7] focus:border-[#0AA2C7] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado *
                  </label>
                  <select
                    className="select px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedEstado}
                    onChange={(e) => setSelectedEstado(Number(e.target.value))}
                    >
                    <option key={APIEstadoObraSocial.ACTIVA} value={APIEstadoObraSocial.ACTIVA}>
                      ACTIVA
                    </option>
                    <option key={APIEstadoObraSocial.INACTIVA} value={APIEstadoObraSocial.INACTIVA}>
                      INACTIVA
                    </option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={uploadObraSocial}
                  className="px-4 py-2 text-sm text-white bg-[#18AEFB] rounded-md hover:bg-[#0AA2C7] focus:outline-none focus:ring-2 focus:ring-[#AFE1EA] transition-colors"
                >
                  Aceptar 
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <th scope="col" className="px-6 py-4 font-bold text-[#0AA2C7]">Editar</th>
              </tr>
            </thead>
            <tbody>
            {obrasSociales.map((os) => (
              <tr key={os.id} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{os.nombre}</td>
                <td className="px-6 py-4 text-gray-900">{os.estado}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onSelectObraSocial(os)}
                    className="p-2 text-[#4D94C8] hover:text-[#0AA2C7] hover:bg-[#E4F1F9] rounded-full transition-colors"
                    title="Editar obra social"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

