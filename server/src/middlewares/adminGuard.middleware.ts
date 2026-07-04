import { Context, Next } from "hono";
import { auth } from "../lib/auth.ts";

export const adminGuard = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (session?.user.role !== "ADMIN") {
    return c.json({ error: "Forbidden: Admins only" }, 403);
  }

  c.set("user", session.user);

  await next();
};
