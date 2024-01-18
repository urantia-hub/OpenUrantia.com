// Node modules.
import axios from "axios";
import { Note, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import prisma from "@/prisma/client";

type NoteServiceDependencies = {
  model: PrismaClient["note"];
};

export class NoteService implements BaseService<Note> {
  private model: PrismaClient["note"];

  constructor(
    dependencies: NoteServiceDependencies = {
      model: prisma.note,
    }
  ) {
    this.model = dependencies.model;
  }

  /* BaseService implementation */
  async create(args: Prisma.NoteCreateArgs): Promise<Note> {
    return await this.model.create(args);
  }

  async delete(args: Prisma.NoteDeleteArgs): Promise<Note> {
    return await this.model.delete(args);
  }

  async deleteMany(
    args: Prisma.NoteDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.model.deleteMany(args);
  }

  async find(args: Prisma.NoteFindFirstArgs): Promise<Note | null> {
    return await this.model.findFirst(args);
  }

  async findMany(args: Prisma.NoteFindManyArgs): Promise<Note[]> {
    return await this.model.findMany(args);
  }

  async get(id: string): Promise<Note | null> {
    return await this.model.findFirst({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.NoteUpdateInput): Promise<Note> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  async upsert(args: Prisma.NoteUpsertArgs): Promise<Note> {
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

export default NoteService;
