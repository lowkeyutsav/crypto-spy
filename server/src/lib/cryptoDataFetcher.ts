import axios from "axios";
import db from "../db/index.ts";
import * as schema from "../db/schema.ts";

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

export const cryptoDataFetcher = async (
  limit: number = 10,
  offset: number = 0,
  currency: string = "USD",
) => {
  try {
    const url = Deno.env.get("COINCAP_BASE_URL") as string +
      `listings/latest?start=${offset}&limit=${limit}&covert=${currency}`;
    const response = await axios.get(
      url,
      {
        timeout: 10000,
      },
    );
    const data: CryptoAsset[] = response.data;
    const returingData = [];

    for (const obj of data) {
      const {
        name,
        symbol,
        slug,
        quote,
      } = obj;

      const priceUSD = quote?.USD?.price;

      const newCrypto = await db.insert(schema.cryptocurrencies).values({
        ticker: symbol,
        name: name,
        slug: slug,
        currentPrice: priceUSD,
      }).returning();

      returingData.push(newCrypto);
    }
    return returingData;
  } catch (error) {
    console.error(
      "Error occured on the cryptoDataFetcher utility func :",
      error,
    );
    throw error;
  }
};
