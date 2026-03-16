// Node modules.
import { Bookmark, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import { getPrismaClient } from "@/libs/prisma/client";
import createLogger from "@/utils/logger";

const logger = createLogger("BookmarkService");

const prisma = getPrismaClient();

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

  async delete(args: Prisma.BookmarkDeleteArgs): Promise<Bookmark> {
    return await this.model.delete(args);
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

  getUserBookmarksWithDetails = async (
    userId: string,
    filter: { paperId?: number }
  ): Promise<any[]> => {
    // Handle fetching all bookmarks for a user.
    logger.info("Fetching bookmarks with filter", { filter: filter as unknown as Record<string, unknown> });
    const bookmarks = await this.findMany({
      where: {
        userId,
        ...(filter.paperId !== undefined && { paperId: `${filter.paperId}` }),
      },
    });

    // If there are no bookmarks, return an empty array.
    if (!bookmarks?.length) {
      logger.info("No bookmarks found");
      return [];
    }

    // Fetch the paperSectionParagraphIds details for each bookmark.
    const paperSectionParagraphIds = bookmarks.map(
      (bookmark) => bookmark.paperSectionParagraphId
    );
    logger.info("Fetching nodes details for paperSectionParagraphIds", { paperSectionParagraphIds: paperSectionParagraphIds as unknown as Record<string, unknown> });
    const nodesDetails = await this.getNodesByPaperSectionParagraphIds(
      paperSectionParagraphIds
    );

    // Add the paperSectionParagraphId details to each bookmark.
    logger.info("Adding nodes details to bookmarks");
    const bookmarksWithDetails = bookmarks.map((bookmark) => {
      const nodeDetail = nodesDetails.find(
        (nodeDetail: UBNode) =>
          nodeDetail.paperSectionParagraphId ===
          bookmark.paperSectionParagraphId
      );
      return {
        ...bookmark,
        ...nodeDetail,
        type: "bookmark",
      };
    });

    logger.info("bookmarksWithDetails", { count: bookmarksWithDetails?.length as unknown as Record<string, unknown> });
    return bookmarksWithDetails;
  };

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

export default BookmarkService;
