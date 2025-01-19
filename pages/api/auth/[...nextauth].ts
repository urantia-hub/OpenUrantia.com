// Node modules.
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth";
import { Resend } from "resend";
import type { Adapter } from "next-auth/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
// Relative modules.
import { getPrismaClient } from "@/libs/prisma/client";
import {
  getMagicLinkEmailHTML,
  getMagicLinkEmailText,
} from "@/utils/email-templates/magicLink";

const resend = new Resend(process.env.RESEND_API_KEY);

const prisma = getPrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        try {
          console.log("Sending magic link email to", email);
          await resend.emails.send({
            from: process.env.EMAIL_FROM as string,
            to: email,
            subject: "Sign in to UrantiaHub",
            html: getMagicLinkEmailHTML(url),
            text: getMagicLinkEmailText(url),
          });
          console.log("Magic link sent successfully.");
        } catch (error: any) {
          console.error("Error sending magic link email", error);
          throw new Error("Error sending magic link email");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    error: "/auth/error",
    signIn: "/auth/sign-in",
    signOut: "/auth/sign-out",
    verifyRequest: "/auth/verify-request",
  },
};

export default NextAuth(authOptions);
