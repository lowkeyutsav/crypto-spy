import { Hono } from "hono";
import {
  handleGetCryptoItem,
  handleGetCryptoList,
} from "../controllers/crypto.controller.ts";
import { authGuard } from "../middlewares/authGuard.middleware.ts";

export const crypto = new Hono().basePath("/api/crypto");

crypto.get("/listings", authGuard, handleGetCryptoList);
crypto.get("/item/:id", authGuard, handleGetCryptoItem);
