// Node modules.
import { Paper, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import { getPrismaClient } from "@/libs/prisma/client";

const prisma = getPrismaClient();

type PaperServiceDependencies = {
  model: PrismaClient["paper"];
};

export class PaperService implements BaseService<Paper> {
  private model: PrismaClient["paper"];

  constructor(
    dependencies: PaperServiceDependencies = {
      model: prisma.paper,
    }
  ) {
    this.model = dependencies.model;
  }

  /* BaseService implementation */
  async create(args: Prisma.PaperCreateArgs): Promise<Paper> {
    return await this.model.create(args);
  }

  async delete(args: Prisma.PaperDeleteArgs): Promise<Paper> {
    return await this.model.delete(args);
  }

  async deleteMany(
    args: Prisma.PaperDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.model.deleteMany(args);
  }

  async find(args: Prisma.PaperFindFirstArgs): Promise<Paper | null> {
    return await this.model.findFirst(args);
  }

  async findMany(args: Prisma.PaperFindManyArgs): Promise<Paper[]> {
    return await this.model.findMany(args);
  }

  async get(id: string): Promise<Paper | null> {
    return await this.model.findFirst({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.PaperUpdateInput): Promise<Paper> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async upsert(args: Prisma.PaperUpsertArgs): Promise<Paper> {
    return await this.model.upsert(args);
  }
}

export default PaperService;
