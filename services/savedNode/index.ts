// Node modules.
import { SavedNode, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import prisma from "@/prisma/client";
import axios from "axios";

type SavedNodeServiceDependencies = {
  model: PrismaClient["savedNode"];
};

export class SavedNodeService implements BaseService<SavedNode> {
  private model: PrismaClient["savedNode"];

  constructor(
    dependencies: SavedNodeServiceDependencies = {
      model: prisma.savedNode,
    }
  ) {
    this.model = dependencies.model;
  }

  /* BaseService implementation */
  async create(args: Prisma.SavedNodeCreateArgs): Promise<SavedNode> {
    return await this.model.create(args);
  }

  async delete(id: string): Promise<SavedNode> {
    return await this.model.delete({
      where: { id },
    });
  }

  async deleteMany(
    args: Prisma.SavedNodeDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.model.deleteMany(args);
  }

  async find(args: Prisma.SavedNodeFindFirstArgs): Promise<SavedNode | null> {
    return await this.model.findFirst(args);
  }

  async findMany(args: Prisma.SavedNodeFindManyArgs): Promise<SavedNode[]> {
    return await this.model.findMany(args);
  }

  async get(id: string): Promise<SavedNode | null> {
    return await this.model.findFirst({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.SavedNodeUpdateInput
  ): Promise<SavedNode> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async upsert(args: Prisma.SavedNodeUpsertArgs): Promise<SavedNode> {
    return await this.model.upsert(args);
  }

  async getNodesByPaperSectionParagraphIds(
    paperSectionParagraphIds: string[]
  ): Promise<any> {
    try {
      const response = await axios.get(
        `${
          process.env.URANTIA_DEV_API_HOST
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

export default SavedNodeService;
