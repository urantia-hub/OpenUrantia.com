// Node modules.
import { Prisma, PrismaClient, ReadNode } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import { getPrismaClient } from "@/libs/prisma/client";
import createLogger from "@/utils/logger";

const logger = createLogger("ReadNodeService");

const prisma = getPrismaClient();

type ReadNodeServiceDependencies = {
  model: PrismaClient["readNode"];
};

export class ReadNodeService implements BaseService<ReadNode> {
  private model: PrismaClient["readNode"];

  constructor(
    dependencies: ReadNodeServiceDependencies = {
      model: prisma.readNode,
    }
  ) {
    this.model = dependencies.model;
  }

  /* BaseService implementation */
  async create(args: Prisma.ReadNodeCreateArgs): Promise<ReadNode> {
    return await this.model.create(args);
  }

  async delete(args: Prisma.ReadNodeDeleteArgs): Promise<ReadNode> {
    return await this.model.delete(args);
  }

  async deleteMany(
    args: Prisma.ReadNodeDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.model.deleteMany(args);
  }

  async find(args: Prisma.ReadNodeFindFirstArgs): Promise<ReadNode | null> {
    return await this.model.findFirst(args);
  }

  async findMany(args: Prisma.ReadNodeFindManyArgs): Promise<ReadNode[]> {
    return await this.model.findMany(args);
  }

  async get(id: string): Promise<ReadNode | null> {
    return await this.model.findFirst({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.ReadNodeUpdateInput
  ): Promise<ReadNode> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async upsert(args: Prisma.ReadNodeUpsertArgs): Promise<ReadNode> {
    return await this.model.upsert(args);
  }

  async findReadsForPopularPapers(
    startDate: Date,
    endDate: Date
  ): Promise<ReadNode[]> {
    return await this.model.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        createdAt: true,
        globalId: true,
        paperId: true,
        paperSectionId: true,
        paperSectionParagraphId: true,
        updatedAt: true,
        userId: true,
      },
    });
  }

  async getNodesByPaperSectionParagraphIds(
    paperSectionParagraphIds: string[]
  ): Promise<UBNode[]> {
    try {
      const { fetchParagraphs } = await import("@/libs/urantiaApi/client");
      return await fetchParagraphs(paperSectionParagraphIds);
    } catch (error) {
      logger.error("Unable to fetch nodes by paperSectionParagraphIds", error);
      return [];
    }
  }
}

export default ReadNodeService;
