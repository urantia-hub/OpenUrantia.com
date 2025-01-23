// Node modules.
import { User, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import { getPrismaClient } from "@/libs/prisma/client";

const prisma = getPrismaClient();

type UserServiceDependencies = {
  model: PrismaClient["user"];
};

export class UserService implements BaseService<User> {
  private model: PrismaClient["user"];

  constructor(
    dependencies: UserServiceDependencies = {
      model: prisma.user,
    }
  ) {
    this.model = dependencies.model;
  }

  /* BaseService implementation */
  async create(args: Prisma.UserCreateArgs): Promise<User> {
    return await this.model.create(args);
  }

  async delete(args: Prisma.UserDeleteArgs): Promise<User> {
    return await this.model.delete(args);
  }

  async deleteMany(
    args: Prisma.UserDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.model.deleteMany(args);
  }

  async find(args: Prisma.UserFindFirstArgs): Promise<User | null> {
    return await this.model.findFirst(args);
  }

  async findMany(args: Prisma.UserFindManyArgs): Promise<User[]> {
    return await this.model.findMany(args);
  }

  async get(id: string): Promise<User | null> {
    return await this.model.findFirst({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async upsert(args: Prisma.UserUpsertArgs): Promise<User> {
    return await this.model.upsert(args);
  }

  async updateMany(
    args: Prisma.UserUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.model.updateMany(args);
  }

  async count(args: Prisma.UserCountArgs): Promise<number> {
    return await this.model.count(args);
  }
}

export default UserService;
