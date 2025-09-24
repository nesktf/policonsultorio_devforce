import { prisma} from "@/prisma/instance";

export default async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({ where: { email } });
}
