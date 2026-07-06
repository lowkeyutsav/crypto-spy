import { auth } from "../lib/auth.ts";
import { Context, Next } from "hono";

export const authGuard = async (c: Context, next: Next) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    if (!session) {
      return c.json({ error: "Forbidden : Only for signed users" }, 401);
    }
    c.set("user", session.user);
    await next();
  } catch (error) {
    console.error("Error occured in the auth middleware :", error);
    c.error = error as Error;
    await next();
  }
};
