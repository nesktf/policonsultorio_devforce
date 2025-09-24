import { EstadoObraSocial, PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export type DBId = number;
export type DBData<T> = { id: DBId, data: T };

export async function getPacientes() {
  try {
    const [pacientes, obrasSociales] = await Promise.all([
      prisma.paciente.findMany({
        include: {
          obra_social: true,
        },
      }),
      prisma.obraSocial.findMany({
        where: {
          estado: 'ACTIVA'
        }
      })
    ]);
    return { pacientes, obrasSociales };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { pacientes: [], obrasSociales: [] };
  }
}
export class ObraSocialData {
  private nombre: string;
  private estado: EstadoObraSocial;

  constructor(nombre: string, estado?: EstadoObraSocial) {
    this.nombre = nombre;
    if (estado) {
      this.estado = estado;
    } else {
      this.estado = EstadoObraSocial.ACTIVA;
    }
  }

  getNombre(): string { return this.nombre; }
  getEstado(): EstadoObraSocial { return this.estado; }
};

export async function retrieveObrasSociales(estado?: EstadoObraSocial): Promise<Array<DBData<ObraSocialData>>> {
  try {
    return await prisma.obraSocial.findMany({ where: { estado }})
    .then((oss) => oss.map((os): DBData<ObraSocialData> => {
      return { id: os.id, data: new ObraSocialData(os.nombre, os.estado) };
    }));
  } catch (err) {
    console.log(`Error @ fetchObraSociales(): ${err}`);
    return []
  }
}

export async function findObrasSociales(nombre: string,
                                        estado?: EstadoObraSocial): Promise<Array<DBData<ObraSocialData>>> {
  try {
    return prisma.obraSocial.findMany({
      where: {
        nombre: {
          startsWith: nombre,
          mode: "insensitive",
        },
        estado
      },
    })
    .then((oss) => oss.map((os): DBData<ObraSocialData> => {
      return { id: os.id, data: new ObraSocialData(os.nombre, os.estado) };
    }));
  } catch (err) {
    console.log(`Error @ findObrasSociales(): ${err}`);
    return []
  }
}

export async function createObraSocial(os: ObraSocialData): Promise<DBData<ObraSocialData> | null> {
  try {
    let ret = await prisma.obraSocial.create({
      data: { nombre: os.getNombre(), estado: os.getEstado() }
    });
    return { id: ret.id, data: os };
  } catch (err) {
    console.log(`Error @ createObraSocial(): ${err}`);
    return null;
  }
}

export async function updateObraSocial(id: DBId, os: ObraSocialData): Promise<boolean> {
  try {
    await prisma.obraSocial.update({
      where: { id },
      data: { nombre: os.getNombre(), estado: os.getEstado() }
    });
    return true;
  } catch (err) {
    console.log(`Error @ updateObraSocial() ${err}`);
    return false;
  }
}
