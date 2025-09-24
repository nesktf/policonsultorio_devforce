import { PrismaClient } from '@/generated/prisma';

declare global {
  // eslint-disable-next-line no-var -- Next.js hot reload enforces var on global
  var prismaGlobal: PrismaClient | undefined;
}

const prisma = globalThis.prismaGlobal ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
