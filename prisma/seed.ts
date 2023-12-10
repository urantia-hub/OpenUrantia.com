// Relative modules.
import NodeCommentService from "@/services/nodeComment";
import NodeReferenceService from "@/services/nodeReference";
import SavedNodeService from "@/services/savedNode";
import SharedNodeService from "@/services/sharedNode";
import UserService from "@/services/user";
import { SharedNodePlatform, User } from "@prisma/client";

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

const createSharedNodes = async (user: User): Promise<void> => {
  const sharedNodeService = new SharedNodeService();
  const sharedNodePlatforms: SharedNodePlatform[] = [
    "FACEBOOK",
    "INSTAGRAM",
    "WHATSAPP",
    "X",
  ];

  sharedNodePlatforms.forEach(async (platform, index) => {
    const count = 10;
    for (let i = 0; i < count; i++) {
      await sharedNodeService.create({
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

const createSavedNodes = async (user: User) => {
  const savedNodeService = new SavedNodeService();
  const count = 10;
  for (let i = 0; i < count; i++) {
    await savedNodeService.create({
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

const createComments = async (user: User) => {
  const nodeCommentService = new NodeCommentService();
  const count = 10;
  for (let i = 0; i < count; i++) {
    await nodeCommentService.create({
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

const createNodeRefs = async () => {
  const nodeReferenceService = new NodeReferenceService();
  const count = 10;
  for (let i = 0; i < count; i++) {
    await nodeReferenceService.create({
      data: {
        authors: ["Seed Author", "Seed Author Two"],
        createdAt: new Date(),
        description: "Seed description",
        globalId: globalIds[i + 1],
        link: "https://www.google.com",
        page: `${i + 1}`,
        paperId: "2",
        paperSectionId: globalIds[i + 1],
        paperSectionParagraphId: globalIds[i + 1],
        publishedAt: new Date(),
        title: "Seed Title",
        updatedAt: new Date(),
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
    await createSharedNodes(user);
    await createSavedNodes(user);
    await createComments(user);

    // Misc seeds.
    await createNodeRefs();

    console.log("[SEED DB] Database seeding complete.");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
