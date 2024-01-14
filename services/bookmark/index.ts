// Node modules.
import { Bookmark, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import prisma from "@/prisma/client";
import axios from "axios";

type BookmarkServiceDependencies = {
  model: PrismaClient["bookmark"];
};

export class BookmarkService implements BaseService<Bookmark> {
  private model: PrismaClient["bookmark"];

  constructor(
    dependencies: BookmarkServiceDependencies = {
      model: prisma.bookmark,
    }
  ) {
    this.model = dependencies.model;
  }

  /* BaseService implementation */
  async create(args: Prisma.BookmarkCreateArgs): Promise<Bookmark> {
    return await this.model.create(args);
  }

  async delete(id: string): Promise<Bookmark> {
    return await this.model.delete({
      where: { id },
    });
  }

  async deleteMany(
    args: Prisma.BookmarkDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.model.deleteMany(args);
  }

  async find(args: Prisma.BookmarkFindFirstArgs): Promise<Bookmark | null> {
    return await this.model.findFirst(args);
  }

  async findMany(args: Prisma.BookmarkFindManyArgs): Promise<Bookmark[]> {
    return await this.model.findMany(args);
  }

  async get(id: string): Promise<Bookmark | null> {
    return await this.model.findFirst({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.BookmarkUpdateInput
  ): Promise<Bookmark> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async upsert(args: Prisma.BookmarkUpsertArgs): Promise<Bookmark> {
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

export default BookmarkService;
