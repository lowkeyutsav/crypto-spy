import axios from "axios";
import { and, eq } from "drizzle-orm";
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

export const runPriceAlertCheck = async () => {
  try {
    const alerts = await db.select().from(schema.priceAlerts).where(and(
      eq(schema.priceAlerts.isActive, true),
      eq(schema.priceAlerts.isTriggered, false),
    ));

    if (alerts.length === 0) {
      console.log("No active alerts to check.");
      return;
    }

    const limit = alerts.length;

    const url = Deno.env.get("COINCAP_BASE_URL") as string +
      `listings/latest?start=&limit=${limit}&convert=${"USD"}`;
    const response = await axios.get(url, { timeout: 10000 });
    const data: CryptoAsset[] = response.data;

    for (const obj of data) {
      const { name, quote } = obj;
      const priceUSD = quote?.USD?.price;

      await db.update(schema.cryptocurrencies).set({
        currentPrice: priceUSD,
      }).where(
        eq(schema.cryptocurrencies.name, name),
      ).returning();

      for (const alert of alerts) {
        const newPriceGreater = priceUSD! > alert.targetPrice;
        const shouldTrigger =
          (newPriceGreater && alert.direction === "ABOVE") ||
          (!newPriceGreater && alert.direction === "BELOW");

        if (shouldTrigger) {
          const userResult = await db.select({ email: schema.user.email })
            .from(schema.user)
            .where(eq(schema.user.id, alert.userId))
            .limit(1);

          if (userResult.length > 0) {
            const userEmail = userResult[0].email;
            void mailSender({
              email: userEmail,
              subject:
                `Alert triggered: ${name} price is now ${priceUSD} (${alert.direction})`,
            });
          }

          await db.update(schema.priceAlerts).set({
            isTriggered: true,
          }).where(eq(schema.priceAlerts.id, alert.id));
        }
      }
    }

    console.log("Price alert check completed successfully.");
  } catch (error) {
    console.error("Error in runPriceAlertCheck:", error);
  }
};
