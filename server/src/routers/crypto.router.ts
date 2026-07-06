import { Hono } from "hono";
import {
  handleGetCryptoItem,
  handleGetCryptoList,
} from "../controllers/crypto.controller.ts";

const crypto = new Hono().basePath("/api/crypto");

crypto.get("/listings", handleGetCryptoList);
crypto.get("/item/:id", handleGetCryptoItem);
