# Crypto Spy

A real-time cryptocurrency price monitoring and alerting system. Set custom price thresholds for your favorite cryptocurrencies and receive instant email notifications when those targets are crossed.

## Tech Stack

- **Runtime:** [Deno](https://deno.land/)
- **Framework:** [Hono](https://hono.dev/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Database:** PostgreSQL (via [Neon](https://neon.tech/))
- **Auth:** [Better Auth](https://www.better-auth.com/)
- **Email:** [Nodemailer](https://nodemailer.com/) (Gmail SMTP)
- **Crypto Data:** [CoinMarketCap API](https://coinmarketcap.com/api/)

## Features

- **Real-Time Price Sync** -- Background worker powered by `Deno.cron` fetches live crypto prices every hour via the CoinMarketCap API.
- **Custom Price Alerts** -- Create alerts with a target price and trigger direction (`ABOVE` / `BELOW`). Receive an email notification exactly once when the threshold is crossed.
- **Smart Performance Indexing** -- Composite database index (`idx_active_alerts`) on `isActive` and `isTriggered` for fast alert lookups.
- **Role-Based Access Control** -- User and Admin roles with dedicated route guards (`authGuard`, `adminGuard`).
- **Authentication** -- Email/password sign-up with email verification, password reset flows, and Google OAuth via Better Auth.
- **Reliable Alert Dispatch** -- Alerts are marked as triggered after notification to prevent duplicate emails.

## Project Structure

```
crypto-spy/
├── client/                          # Frontend (planned)
└── server/
    ├── deno.json                    # Deno config, tasks, and import maps
    ├── drizzle.config.ts            # Drizzle Kit configuration
    ├── drizzle/                     # Generated SQL migrations
    └── src/
        ├── index.ts                 # App entrypoint (Hono server + cron)
        ├── controllers/             # Request handlers
        │   ├── alert.controller.ts
        │   └── crypto.controller.ts
        ├── services/                # Business logic
        │   ├── alert.service.ts
        │   └── crypto.service.ts
        ├── routers/                 # Route definitions
        │   ├── alert.router.ts
        │   └── crypto.router.ts
        ├── middlewares/             # Auth & role guards
        │   ├── authGuard.middleware.ts
        │   └── adminGaurd.middleware.ts
        ├── db/                      # Database connection & schema
        │   ├── index.ts
        │   └── schema.ts
        └── lib/                     # Shared utilities
            ├── auth.ts              # Better Auth configuration
            ├── cryptoDataFetcher.ts # CoinMarketCap API fetcher
            ├── mailSender.ts        # Nodemailer wrapper
            ├── password.ts          # Bcrypt hash/verify
            └── worker.ts            # Cron job: price alert checker
```

## Getting Started

### Prerequisites

- [Deno](https://deno.land/) v1.40+
- A PostgreSQL database (e.g. [Neon](https://neon.tech/))
- A [CoinMarketCap API](https://coinmarketcap.com/api/) key
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) for SMTP
- (Optional) A [Google Cloud](https://console.cloud.google.com/) project for OAuth

### Environment Variables

Create `server/.env`:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

COINCAP_BASE_URL=https://pro-api.coinmarketcap.com/v1/cryptocurrency/
COINCAP_API_KEY=your_coinmarketcap_api_key

EMAIL_ADDRESS=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

BETTER_AUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Install & Run

```bash
cd server

# Install dependencies (Deno auto-resolves from deno.json)
deno install

# Push schema to the database
deno task db:push

# Start the dev server (with file watching)
deno task dev
```

The server starts at `http://localhost:3000`.

### Available Tasks

| Task                  | Description                         |
| --------------------- | ----------------------------------- |
| `deno task dev`       | Start dev server with hot reload    |
| `deno task db:push`   | Push schema changes to the database |
| `deno task migration:run`   | Run pending SQL migrations    |
| `deno task migration:generate` | Generate migrations from schema |

## API Reference

All routes (except auth) require a valid session token in the `Authorization` header.

### Auth

| Method | Endpoint              | Description              | Auth     |
| ------ | --------------------- | ------------------------ | -------- |
| POST   | `/api/auth/sign-up`   | Register a new account   | Public   |
| POST   | `/api/auth/sign-in`   | Sign in                  | Public   |
| POST   | `/api/auth/sign-out`  | Sign out                 | Session  |
| GET    | `/api/auth/verify-email` | Verify email address   | Public   |
| POST   | `/api/auth/forget-password` | Request password reset | Public  |
| POST   | `/api/auth/reset-password` | Reset password         | Public   |

### Cryptocurrency

| Method | Endpoint                | Description                              | Auth   |
| ------ | ----------------------- | ---------------------------------------- | ------ |
| GET    | `/api/crypto/listings`  | List cryptocurrencies (paginated)        | User   |
| GET    | `/api/crypto/item/:id`  | Get a single cryptocurrency by ID        | User   |

### Alerts

| Method | Endpoint            | Description                                  | Auth  |
| ------ | ------------------- | -------------------------------------------- | ----- |
| GET    | `/api/alert/listings` | List all alerts (admin only)               | Admin |
| GET    | `/api/alert/list`     | List current user's active, untriggered alerts | User |
| POST   | `/api/alert/create`   | Create a new price alert                   | User  |
| DELETE | `/api/alert/delete/:id` | Delete an alert by ID                    | User  |

### Create Alert Payload

```json
{
  "cryptoId": "uuid-of-cryptocurrency",
  "targetPrice": 69000,
  "direction": "ABOVE",
  "emailNotification": true,
  "pushNotification": false
}
```

## Database Schema

Key tables managed by Drizzle ORM:

- **`user`** -- User accounts with email, role (`USER` / `ADMIN`), and OAuth support
- **`cryptocurrencies`** -- Tracked coins with ticker, name, slug, and live price
- **`price_alerts`** -- User-created alerts linking a user to a crypto with a target price and direction
- **`session`** / **`account`** / **`verification`** -- Managed by Better Auth for sessions and OAuth

## License

ISC
