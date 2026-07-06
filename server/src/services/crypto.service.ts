import db from "../db/index.ts";
import * as schema from "../db/schema.ts";
import { cryptoDataFetcher } from "../lib/cryptoDataFetcher.ts";
import { eq } from "drizzle-orm";

export const getCryptoList = async (
  limit: number,
  offset: number,
  currency: string,
) => {
  try {
    const data = await db.select().from(schema.cryptocurrencies).limit(limit)
      .offset(offset);

    if (data.length < limit) {
      const newResponse = await cryptoDataFetcher(limit, offset, currency);
      return newResponse;
    }

    return data;
  } catch (error) {
    console.error("Error occured in the getCryptoList service :", error);
    throw error;
  }
};

export const getCryptoItem = async (
  id: string,
) => {
  try {
    const data = await db.select().from(schema.cryptocurrencies).where(
      eq(schema.cryptocurrencies.id, id),
    );

    if (data.length === 0) return false;

    return data[0];
  } catch (error) {
    console.error("Error occured in the getyCryptoItem service :", error);
    throw error;
  }
};
