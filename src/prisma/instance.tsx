import { PrismaClient } from "@/generated/prisma";

export const prisma = new PrismaClient();

export type DBId = number;
export type DBData<T> = { id: DBId, data: T };
