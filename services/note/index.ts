// Node modules.
import { Note, Prisma, PrismaClient } from "@prisma/client";
// Relative modules.
import BaseService from "@/services/base";
import { getPrismaClient } from "@/libs/prisma/client";
import createLogger from "@/utils/logger";

const logger = createLogger("NoteService");

const prisma = getPrismaClient();

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

  getUserNotesWithDetails = async (
    userId: string,
    filter: { paperId?: number }
  ) => {
    // Handle fetching all notes for a user.
    logger.info("Fetching notes with filter", { filter: filter as unknown as Record<string, unknown> });
    const notes = await this.findMany({
      where: {
        userId,
        ...(filter.paperId && { paperId: `${filter.paperId}` }),
      },
    });

    // If there are no notes, return an empty array.
    if (!notes?.length) {
      logger.info("No notes found");
      return [];
    }

    // Fetch the paperSectionParagraphId details for each note.
    const paperSectionParagraphId = notes.map(
      (note) => note.paperSectionParagraphId
    );
    logger.info("Fetching nodes details for paperSectionParagraphId", { paperSectionParagraphId: paperSectionParagraphId as unknown as Record<string, unknown> });
    const nodesDetails = await this.getNodesByPaperSectionParagraphIds(
      paperSectionParagraphId
    );

    // Add the paperSectionParagraphId details to each note.
    logger.info("Adding nodes details to notes");
    const notesWithDetails = notes.map((note) => {
      const nodeDetail = nodesDetails.find(
        (nodeDetail: UBNode) =>
          nodeDetail.paperSectionParagraphId === note.paperSectionParagraphId
      );
      return {
        ...note,
        ...nodeDetail,
        noteText: note.text,
        type: "note",
      };
    });

    logger.info("notesWithDetails", { count: notesWithDetails?.length as unknown as Record<string, unknown> });
    return notesWithDetails;
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

export default NoteService;
