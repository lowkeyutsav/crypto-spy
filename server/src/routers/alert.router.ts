import { Hono } from "hono";
import {
  getAllAlerts,
  getOwnAlerts,
  handleCreateAlert,
  handleDeleteAlert,
} from "../controllers/alert.controller.ts";
import { authGuard } from "../middlewares/authGuard.middleware.ts";
import { adminGuard } from "../middlewares/adminGaurd.middleware.ts";

export const alert = new Hono().basePath("/api/alert");

alert.get("/listings", adminGuard, getAllAlerts);
alert.get("/list", authGuard, getOwnAlerts);
alert.post("/create", authGuard, handleCreateAlert);
alert.delete("/delete", authGuard, handleDeleteAlert);
