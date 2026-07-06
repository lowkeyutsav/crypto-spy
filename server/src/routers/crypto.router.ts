import { Hono } from "hono";
import {
  handleGetCryptoItem,
  handleGetCryptoList,
} from "../controllers/crypto.controller.ts";
import { authGaurd } from "../middlewares/authGaurd.middleware.ts";

const crypto = new Hono().basePath("/api/crypto");

crypto.get("/listings", authGaurd, handleGetCryptoList);
crypto.get("/item/:id", authGaurd, handleGetCryptoItem);
