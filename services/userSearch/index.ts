// Node modules.
import { Prisma, PrismaClient, UserSearch } from "@prisma/client";
// Relative modules.
import { getPrismaClient } from "@/libs/prisma/client";

const prisma = getPrismaClient();

type UserSearchServiceDependencies = {
  model: PrismaClient["userSearch"];
};

export class UserSearchService {
  private model: PrismaClient["userSearch"];

  constructor(
    dependencies: UserSearchServiceDependencies = {
      model: prisma.userSearch,
    }
  ) {
    this.model = dependencies.model;
  }

  async create(args: {
    data: { searchQuery: string; resultCount: number; userId?: string };
  }): Promise<UserSearch> {
    return await this.model.create({
      data: {
        searchQuery: args.data.searchQuery,
        resultCount: args.data.resultCount,
        ...(args.data.userId && {
          user: { connect: { id: args.data.userId } },
        }),
      },
    });
  }

  async getPopularSearches(args: {
    startDate: string;
    endDate: string;
    limit?: number;
  }): Promise<{ searchQuery: string; count: number }[]> {
    const results = await this.model.groupBy({
      by: ["searchQuery"],
      where: {
        createdAt: {
          gte: new Date(args.startDate),
          lte: new Date(args.endDate),
        },
      },
      _count: {
        searchQuery: true,
      },
      having: {
        searchQuery: {
          _count: {
            gt: 5,
          },
        },
      },
      orderBy: {
        _count: {
          searchQuery: "desc",
        },
      },
      take: args.limit || 10,
    });

    return results.map((r) => ({
      searchQuery: r.searchQuery,
      count: r._count.searchQuery,
    }));
  }

  async getRecentSearches(args: {
    userId: string;
    limit?: number;
  }): Promise<UserSearch[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const results = await this.model.findMany({
      where: {
        userId: args.userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      distinct: ["searchQuery"],
      take: args.limit || 10,
    });

    return results;
  }
}

export default UserSearchService;
