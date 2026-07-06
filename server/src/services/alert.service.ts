import db from "../db/index.ts";
import * as schema from "../db/schema.ts";
import { and, eq } from "drizzle-orm";

interface handleCreateAlertInterface {
  cryptoId: string;
  targetPrice: number;
  direction: "ABOVE" | "BELOW";
  emailNotification?: boolean;
  pushNotification?: boolean;
}

export const getAlertListings = async (
  limit: number = 0,
  offset: number = 0,
) => {
  try {
    const data = await db.select().from(schema.priceAlerts).limit(Number(limit))
      .offset(Number(offset));

    return data;
  } catch (error) {
    console.error("Error occured in the getAlertListintgs service : ", error);
    throw error;
  }
};

export const getOwnAlertListings = async (
  id: string,
  limit: number = 0,
  offset: number = 0,
) => {
  try {
    const data = await db.select()
      .from(schema.priceAlerts)
      .where(and(
        and(
          eq(schema.priceAlerts.isActive, true),
          eq(schema.priceAlerts.isTriggered, false),
        ),
        eq(schema.priceAlerts.userId, id),
      ))
      .limit(Number(limit))
      .offset(Number(offset));

    return data;
  } catch (error) {
    console.error("Error occured in the getOwnAlertListings service :", error);
    throw error;
  }
};

export const createAlert = async (
  id: string,
  body: handleCreateAlertInterface,
) => {
  try {
    const {
      cryptoId,
      targetPrice,
      direction,
      emailNotification = true,
      pushNotification = true,
    } = body;

    if (!cryptoId || !targetPrice || !direction) {
      return false;
    }

    const userId = id;

    const alertPayload = {
      userId,
      cryptoId,
      targetPrice,
      direction,
      emailNotification,
      pushNotification,
    };

    const data = await db.insert(schema.priceAlerts).values(alertPayload)
      .returning();

    return data;
  } catch (error) {
    console.error("Error occured in the handleCreateAlert service :", error);
    throw error;
  }
};

export const deleteAlert = async (id: string) => {
  try {
    const data = await db.delete(schema.priceAlerts).where(
      eq(schema.priceAlerts, id),
    ).returning();

    if (data.length === 0) return false;

    return true;
  } catch (error) {
    console.error(
      "Error occured in the the handleDeleteAlert service :",
      error,
    );
    throw error;
  }
};
