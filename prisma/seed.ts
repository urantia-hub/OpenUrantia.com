// Relative modules.
import BookmarkService from "@/services/bookmark";
import NoteService from "@/services/note";
import ShareService from "@/services/share";
import UserService from "@/services/user";
import { SharePlatform, User } from "@prisma/client";

const globalIds = [
  "1:2.-.-",
  "1:2.0.-",
  "1:2.0.1",
  "1:2.0.2",
  "1:2.0.3",
  "1:2.1.-",
  "1:2.1.1",
  "1:2.1.2",
  "1:2.1.3",
  "1:2.1.4",
  "1:2.1.5",
  "1:2.1.6",
  "1:2.1.7",
  "1:2.1.8",
  "1:2.1.9",
  "1:2.1.10",
  "1:2.1.11",
  "1:2.2.-",
  "1:2.2.1",
  "1:2.2.2",
  "1:2.2.3",
  "1:2.2.4",
  "1:2.2.5",
  "1:2.2.6",
  "1:2.2.7",
  "1:2.3.-",
  "1:2.3.1",
  "1:2.3.2",
  "1:2.3.3",
  "1:2.3.4",
  "1:2.3.5",
  "1:2.3.6",
  "1:2.4.-",
  "1:2.4.1",
  "1:2.4.2",
  "1:2.4.3",
  "1:2.4.4",
  "1:2.4.5",
  "1:2.5.-",
  "1:2.5.1",
  "1:2.5.2",
  "1:2.5.3",
  "1:2.5.4",
  "1:2.5.5",
  "1:2.5.6",
  "1:2.5.7",
  "1:2.5.8",
  "1:2.5.9",
  "1:2.5.10",
  "1:2.5.11",
  "1:2.5.12",
  "1:2.6.-",
  "1:2.6.1",
  "1:2.6.2",
  "1:2.6.3",
  "1:2.6.4",
  "1:2.6.5",
  "1:2.6.6",
  "1:2.6.7",
  "1:2.6.8",
  "1:2.6.9",
];

const seedUser = async (): Promise<User> => {
  const userService = new UserService();

  if (!process.env.SEED_EMAIL) {
    throw new Error("Missing env variable: SEED_EMAIL");
  }

  const user = await userService.create({
    data: {
      createdAt: new Date(),
      email: process.env.SEED_EMAIL,
      emailVerified: true,
      name: "Test Name",
      updatedAt: new Date(),
    },
  });

  return user;
};

const createShares = async (user: User): Promise<void> => {
  const shareService = new ShareService();
  const sharePlatforms: SharePlatform[] = [
    "COPY_LINK",
    "COPY_TEXT",
    "FACEBOOK",
    "INSTAGRAM",
    "WHATSAPP",
    "X",
  ];

  sharePlatforms.forEach(async (platform, index) => {
    const count = 10;
    for (let i = 0; i < count; i++) {
      await shareService.create({
        data: {
          count,
          createdAt: new Date(),
          globalId: globalIds[(index + 1) * (i + 1)],
          paperId: "2",
          paperSectionId: globalIds[(index + 1) * (i + 1)],
          paperSectionParagraphId: globalIds[(index + 1) * (i + 1)],
          platform,
          updatedAt: new Date(),
          userId: user.id,
        },
      });
    }
  });
};

const createBookmarks = async (user: User) => {
  const bookmarkService = new BookmarkService();
  const count = 10;
  for (let i = 0; i < count; i++) {
    await bookmarkService.create({
      data: {
        createdAt: new Date(),
        globalId: globalIds[i + 1],
        paperId: "2",
        paperSectionId: globalIds[i + 1],
        paperSectionParagraphId: globalIds[i + 1],
        updatedAt: new Date(),
        userId: user.id,
      },
    });
  }
};

const createNotes = async (user: User) => {
  const noteService = new NoteService();
  const count = 10;
  for (let i = 0; i < count; i++) {
    await noteService.create({
      data: {
        createdAt: new Date(),
        globalId: globalIds[i + 1],
        paperId: "2",
        paperSectionId: globalIds[i + 1],
        paperSectionParagraphId: globalIds[i + 1],
        text: "seed",
        updatedAt: new Date(),
        userId: user.id,
      },
    });
  }
};

/**
 * Actual script that runs
 */
(async () => {
  try {
    console.log("[SEED DB] Database seeding starting...");

    // User-specific seed.
    const user = await seedUser();
    await createShares(user);
    await createBookmarks(user);
    await createNotes(user);

    console.log("[SEED DB] Database seeding complete.");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
