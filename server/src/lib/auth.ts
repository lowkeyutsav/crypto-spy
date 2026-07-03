import { betterAuth } from "better-auth";
import { mailSender } from "./mailSender.ts";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { hashPassword, verifyPassword } from "./password.ts";
import db from "../db/index.ts";
import * as authSchema from "../db/schema.ts"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema : authSchema
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    onExistingUserSignUp: async ({ user }, request) => {
      try {
        await mailSender({
          email: user.email,
          subject: "Sign-up attempt with your email",
          text:
            "Someone tried to create an accound using your email address. If this was you , trying to signin instead you can successfully ignore this email",
        });
      } catch (error) {
        console.error("Failed to send sign-up attempt email" , error)
      }
    },
    sendResetPassword: async ({ user, url, token }, request) => {
      try {
        await mailSender({
          email: user.email,
          subject: "Reset your password",
          text: `Click the link to reset your password: ${url}`,
        });
      } catch (error) {
        console.error("Failed to send password reset email" , error)
      }
    },
    onPasswordReset: async ({ user }, request) => {
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
        console.error("Failed to send verification email" , error)
      }
    },
  },
});
