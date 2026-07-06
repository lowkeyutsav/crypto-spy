import { Context } from "hono";
import { getCryptoItem, getCryptoList } from "../services/crypto.service.ts";

export const handleGetCryptoList = async (c: Context) => {
  try {
    const params = c.req.query();
    const { limit, offset, currency } = params;
    const data = await getCryptoList(Number(limit), Number(offset), currency);

    return c.json({
      status: true,
      message: "Successfully fetched crypto listings data",
      data,
    });
  } catch (error) {
    console.error(
      "Error occureed in the getCryptoListings controller :",
      error,
    );
    c.json({
      status: false,
      error: "Internal server error ",
    });
  }
};

export const handleGetCryptoItem = async (c: Context) => {
  try {
    const id = String(c.req.param("id"));

    const data = await getCryptoItem(id);

    if (!data) {
      return c.json({
        status: false,
        message: "Invaild crypto id",
      });
    }

    return c.json({
      status: true,
      message: "Successfully fetched crypto item data",
      data: data,
    });
  } catch (error) {
    console.error(
      "Error occureed in the handleGetCryptoItem controller :",
      error,
    );
    c.json({
      status: false,
      error: "Internal server error ",
    });
  }
};
