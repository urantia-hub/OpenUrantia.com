import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | undefined = undefined;

export const getPrismaClient = () => {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
};

export default getPrismaClient;
