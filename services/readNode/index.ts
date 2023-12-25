// Node modules.
import axios from "axios";
import { ReadNode, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import prisma from "@/prisma/client";

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

  async delete(id: string): Promise<ReadNode> {
    return await this.model.delete({
      where: { id },
    });
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

  async getNodesByPaperSectionParagraphIds(
    paperSectionParagraphIds: string[]
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${
          process.env.NEXT_PUBLIC_URANTIA_DEV_API_HOST
        }/api/v1/urantia-book/paragraphs?paperSectionParagraphIds=${paperSectionParagraphIds.join(
          ","
        )}`
      );
      return response.data?.data?.results;
    } catch (error) {
      console.error("Unable to fetch nodes by paperSectionParagraphIds", error);
      return [];
    }
  }
}

export default ReadNodeService;
