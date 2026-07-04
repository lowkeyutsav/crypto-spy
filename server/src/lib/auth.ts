import { betterAuth } from "better-auth";
import { mailSender } from "./mailSender.ts";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { hashPassword, verifyPassword } from "./password.ts";
import db from "../db/index.ts";
import * as authSchema from "../db/schema.ts";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  baseUrl: Deno.env.get("BETTER_AUTH_URL"),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    onExistingUserSignUp: async ({ user }) => {
      try {
        await mailSender({
          email: user.email,
          subject: "Sign-up attempt with your email",
          text:
            "Someone tried to create an accound using your email address. If this was you , trying to signin instead you can successfully ignore this email",
        });
      } catch (error) {
        console.error("Failed to send sign-up attempt email", error);
      }
    },
    sendResetPassword: async ({ user, url }) => {
      try {
        await mailSender({
          email: user.email,
          subject: "Reset your password",
          text: `Click the link to reset your password: ${url}`,
        });
      } catch (error) {
        console.error("Failed to send password reset email", error);
      }
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
    password: {
      hash: hashPassword,
      verifyPassword: verifyPassword,
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await mailSender({
          email: user.email,
          subject: "Email verification for your account on crypto spy",
          text: `Click the link to verify your account: ${url}`,
        });
      } catch (error) {
        console.error("Failed to send verification email", error);
      }
    },
  },
  socialProviders: {
    google: {
      clientId: Deno.env.get("GOOGLE_CLIENT_ID") as string,
      clientSecret: Deno.env.get("GOOGLE_CLIENT_SECRET") as string,
    },
  },
});
