// Node modules.
import { Share, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import { getPrismaClient } from "@/libs/prisma/client";

const prisma = getPrismaClient();

type ShareServiceDependencies = {
  model: PrismaClient["share"];
};

export class ShareService implements BaseService<Share> {
  private model: PrismaClient["share"];

  constructor(
    dependencies: ShareServiceDependencies = {
      model: prisma.share,
    }
  ) {
    this.model = dependencies.model;
  }

  /* BaseService implementation */
  async create(args: Prisma.ShareCreateArgs): Promise<Share> {
    return await this.model.create(args);
  }

  async delete(args: Prisma.ShareDeleteArgs): Promise<Share> {
    return await this.model.delete(args);
  }

  async deleteMany(
    args: Prisma.ShareDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.model.deleteMany(args);
  }

  async find(args: Prisma.ShareFindFirstArgs): Promise<Share | null> {
    return await this.model.findFirst(args);
  }

  async findMany(args: Prisma.ShareFindManyArgs): Promise<Share[]> {
    return await this.model.findMany(args);
  }

  async get(id: string): Promise<Share | null> {
    return await this.model.findFirst({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.ShareUpdateInput): Promise<Share> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async upsert(args: Prisma.ShareUpsertArgs): Promise<Share> {
    return await this.model.upsert(args);
  }
}

export default ShareService;
