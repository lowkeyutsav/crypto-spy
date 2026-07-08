import { Hono } from "hono";
// import { cors } from "hono/cors";
import { auth } from "./lib/auth.ts";
import { crypto } from "./routers/crypto.router.ts";
import { alert } from "./routers/alert.router.ts";
import { runPriceAlertCheck } from "./lib/worker.ts";

const app = new Hono();

// app.use(
//   "*",
//   cors({
//     origin: ["http://localhost:5173", "http://localhost:3000"],
//     credentials: true,
//   }),
// ); for later use

//TODO: add redis and rate limiting in these

app.get("/", (c) => {
  return c.text("Hono !");
});

app.on(["GET", "POST"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.route("/", crypto);
app.route("/", alert);

Deno.cron("price-alert-check", "0 * * * *", async () => {
  console.log("Running price alert check...");
  await runPriceAlertCheck();
});

const PORT = Number(Deno.env.get("PORT")) || 3000;

Deno.serve({ port: PORT }, app.fetch);
