// Node modules.
import { CuratedQuote, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import { getPrismaClient } from "@/libs/prisma/client";
import createLogger from "@/utils/logger";

const logger = createLogger("CuratedQuoteService");

const prisma = getPrismaClient();

type CuratedQuoteServiceDependencies = {
  model: PrismaClient["curatedQuote"];
};

export class CuratedQuoteService implements BaseService<CuratedQuote> {
  private model: PrismaClient["curatedQuote"];

  constructor(
    dependencies: CuratedQuoteServiceDependencies = {
      model: prisma.curatedQuote,
    }
  ) {
    this.model = dependencies.model;
  }

  /* BaseService implementation */
  async create(args: Prisma.CuratedQuoteCreateArgs): Promise<CuratedQuote> {
    return await this.model.create(args);
  }

  async delete(args: Prisma.CuratedQuoteDeleteArgs): Promise<CuratedQuote> {
    return await this.model.delete(args);
  }

  async deleteMany(
    args: Prisma.CuratedQuoteDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.model.deleteMany(args);
  }

  async find(
    args: Prisma.CuratedQuoteFindFirstArgs
  ): Promise<CuratedQuote | null> {
    return await this.model.findFirst(args);
  }

  async findMany(
    args: Prisma.CuratedQuoteFindManyArgs
  ): Promise<CuratedQuote[]> {
    return await this.model.findMany(args);
  }

  async get(id: string): Promise<CuratedQuote | null> {
    return await this.model.findFirst({
      where: { id },
    });
  }

  async update(
    id: string,
    data: Prisma.CuratedQuoteUpdateInput
  ): Promise<CuratedQuote> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async upsert(args: Prisma.CuratedQuoteUpsertArgs): Promise<CuratedQuote> {
    return await this.model.upsert(args);
  }

  async getRandom(options?: {
    amount?: number;
    enriched?: boolean;
    sent?: boolean;
  }): Promise<CuratedQuote[] | null> {
    // Get distinct quotes by globalId using Prisma's distinct feature
    const sentCuratedQuotes = await this.model.findMany({
      where: {
        sentAt: options?.sent ? { not: null } : undefined,
      },
      distinct: ["globalId"],
      orderBy: {
        createdAt: "desc",
      },
    });

    // If there are no sent curated quotes, return null
    if (!sentCuratedQuotes.length) {
      return null;
    }

    // Generate unique random indexes
    const amount = options?.amount || 1;
    const indexes = new Set<number>();
    while (indexes.size < Math.min(amount, sentCuratedQuotes.length)) {
      indexes.add(Math.floor(Math.random() * sentCuratedQuotes.length));
    }

    // Get the quotes at the random indexes
    const unenrichedQuotes = Array.from(indexes).map(
      (index) => sentCuratedQuotes[index]
    );

    // If the quotes are not enriched, return them
    if (!options?.enriched) {
      return unenrichedQuotes;
    }

    // Get the paragraph nodes for the quotes
    const paragraphNodes = await Promise.all(
      unenrichedQuotes.map((quote) => this.getNodeByGlobalId(quote.globalId))
    );

    // Add the paragraph nodes to the quotes
    const enrichedQuotes = unenrichedQuotes.map((quote) => {
      const paragraphNode = paragraphNodes.find(
        (node: any) => node.globalId === quote.globalId
      );

      return {
        ...quote,
        paragraphNode,
      };
    });

    // Return the enriched quotes
    return enrichedQuotes;
  }

  async getNodeByGlobalId(globalId: string): Promise<UBNode | null> {
    try {
      const { fetchParagraph } = await import("@/libs/urantiaApi/client");
      return await fetchParagraph(globalId);
    } catch (error) {
      logger.error("Unable to fetch node by globalId", error);
      return null;
    }
  }
}

export default CuratedQuoteService;
