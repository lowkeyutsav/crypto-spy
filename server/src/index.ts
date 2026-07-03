import { Hono } from "hono";
import { auth } from "./lib/auth.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hono !");
});

app.on(["GET", "POST"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

const PORT = Number(Deno.env.get("PORT")) || 3000;

Deno.serve({ port: PORT }, app.fetch);
