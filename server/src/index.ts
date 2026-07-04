import { Hono } from "hono";
import { auth } from "./lib/auth.ts";

const app = new Hono();

// app.use(
//   "/api/auth/*",
//   cors({
//     origin: ["http://localhost:5173", "http://localhost:3000"],
//     credentials: true,
//   }),
// );

app.get("/", (c) => {
  return c.text("Hono !");
});

app.on(["GET", "POST"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// Replace your temporary test route with this Hono-compatible version:
app.get("/test-login", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Test Better Auth Login</title>
    </head>
    <body style="font-family: sans-serif; padding: 20px;">
        <h3>Better Auth Test (Hono)</h3>
        <button id="loginBtn" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
            Sign in with Google
        </button>

        <script>
            document.getElementById('loginBtn').addEventListener('click', async () => {
                try {
                    const response = await fetch('/api/auth/sign-in/social', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ provider: 'google' })
                    });

                    const data = await response.json();
                    if (data.url) {
                        // Redirect browser to Google login screen
                        window.location.href = data.url;
                    } else {
                        alert("Error: No redirect URL returned from Better Auth");
                    }
                } catch (err) {
                    console.error(err);
                    alert("Check console for errors");
                }
            });
        </script>
    </body>
    </html>
  `);
});

const PORT = Number(Deno.env.get("PORT")) || 3000;

Deno.serve({ port: PORT }, app.fetch);
