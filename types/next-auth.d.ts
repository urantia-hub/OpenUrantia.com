// types/next-auth.d.ts
import { User as NextAuthUser } from "next-auth";

// Extend the built-in types for NextAuth User
declare module "next-auth" {
  interface User {
    emailNotificationsEnabled?: boolean;
    lastNotificationAt?: Date;
    lastVisitedAt?: Date;
    lastVisitedGlobalId?: string;
    lastVisitedPaperId?: string;
    lastVisitedPaperTitle?: string;
  }
}
