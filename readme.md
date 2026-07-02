🕵️‍♂️ Crypto Spy

A high-performance, real-time cryptocurrency price monitoring and alerting system. Crypto Spy allows users to set custom price thresholds (offsets) for their favorite cryptocurrencies and receive instant notifications via email when those limits are crossed.

Built with a modern, ultra-fast backend stack using Deno, Hono, Drizzle ORM, PostgreSQL, and Better Auth.
🚀 Features

    Real-Time Price Spy Engine: A lightweight, automated background sync worker powered by Deno Cron that fetches crypto live feeds via 3rd-party APIs.

    Smart Performance Indexing: Utilizes custom composite database indexes (idx_active_alerts) to scan millions of user rules in milliseconds with near-zero CPU overhead.

    Reliable Alert Dispatcher: Tracks state meticulously to ensure users get notified exactly once when a target triggers, preventing notification spam.

    Robust Authentication: Secure user management, session handling, and credential safety out of the box with Better Auth.

    Lightweight & Modular: Written in TypeScript, leveraging Hono's blazing-fast router running natively on the Deno runtime.
