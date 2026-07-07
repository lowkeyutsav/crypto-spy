import axios from "axios";
import { and, eq } from "drizzle-orm";
import { Context } from "hono";
import db from "../db/index.ts";
import * as schema from "../db/schema.ts";
import { mailSender } from "./mailSender.ts";

interface CryptoAsset {
  name: string;
  symbol: string;
  slug: string;
  quote: {
    USD?: {
      price: number;
    };
  };
}

export const worker = async (c: Context) => {
  try {
    const alerts = await db.select().from(schema.priceAlerts).where(and(
      eq(schema.priceAlerts.isActive, true),
      eq(schema.priceAlerts.isTriggered, false),
    ));
    const email = c.get("user").email;

    const cryptos = await db.select().from(schema.priceAlerts);

    const limit = cryptos.length;

    try {
      const url = Deno.env.get("COINCAP_BASE_URL") as string +
        `listings/latest?start=&limit=${limit}&convert=${"USD"}`;
      const response = await axios.get(
        url,
        {
          timeout: 10000,
        },
      );
      const data: CryptoAsset[] = response.data;

      for (const obj of data) {
        const {
          name,
          quote,
        } = obj;

        const priceUSD = quote?.USD?.price;

        const newCrypto = await db.update(schema.cryptocurrencies).set({
          currentPrice: priceUSD,
        }).where(
          eq(schema.cryptocurrencies.name, name),
        ).returning();

        for (const alert of alerts) {
          const newPriceGreater = priceUSD! > alert.targetPrice;
          if (newPriceGreater && alert.direction === "ABOVE") {
            void mailSender({ email, subject: "alert triggered upwards" }); // just fucntional
          } else if (!newPriceGreater && alert.direction === "BELOW") {
            void mailSender({ email, subject: "alert triggered downwards" });
          }
        }
      }
    } catch (error) {
      console.error("Error occured in the inner try block:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error occured in the worker function :", error);
    throw error;
  }
};
