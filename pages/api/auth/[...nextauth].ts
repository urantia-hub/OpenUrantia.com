// Node modules.
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth";
import sgMail from "@sendgrid/mail";
import type { Adapter } from "next-auth/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

// Setting SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const mail = {
          to: email,
          from: process.env.SENDGRID_FROM as string,
          templateId: process.env.SENDGRID_SIGN_IN_TEMPLATE_ID as string,
          dynamicTemplateData: {
            signInUrl: url,
          },
        };

        try {
          console.log("Sending magic link email.", mail);
          await sgMail.send(mail);
          console.log("Magic link sent successfully.");
        } catch (error: any) {
          console.error("Error sending magic link email", error);
          if (error.response) {
            console.error(error.response.body);
          }
          throw new Error("Error sending magic link email");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
};

export default NextAuth(authOptions);
