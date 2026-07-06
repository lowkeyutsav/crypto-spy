import { Context } from "hono";
import {
  createAlert,
  deleteAlert,
  getAlertListings,
  getOwnAlertListings,
} from "../services/alert.service.ts";

export const getAllAlerts = async (c: Context) => {
  try {
    const { limit = 10, offset = 0 } = c.req.query();
    const data = await getAlertListings(Number(limit), Number(offset));

    return c.json({
      status: true,
      message: "Successfully fetched alerts",
      data,
    });
  } catch (error) {
    console.error("Error occured in the getAllAlerts controller :", error);
    throw error;
  }
};

export const getOwnAlerts = async (c: Context) => {
  try {
    const { limit = 10, offset = 0 } = c.req.query();
    const id = c.get("user").id;

    const data = await getOwnAlertListings(
      id as string,
      Number(limit),
      Number(offset),
    );

    return c.json({
      status: true,
      message: "Successfully fetched alerts",
      data,
    });
  } catch (error) {
    console.error("Error occured in the getOwnAlerts controller :", error);
    throw error;
  }
};

export const handleCreateAlert = async (c: Context) => {
  try {
    const body = await c.req.json();
    const id = c.get("user").id;
    const data = await createAlert(id, body);

    if (!data) {
      return c.json({
        status: false,
        message: "All fields are required",
      });
    }

    return c.json({
      status: true,
      message: "Successfully created new Alert",
      data,
    });
  } catch (error) {
    console.error("Error occured in the handleCreateAlert controller :", error);
    throw error;
  }
};

export const handleDeleteAlert = async (c: Context) => {
  try {
    const id = c.req.param("id");

    const status = await deleteAlert(id as string);

    if (!status) {
      return c.json({
        status: false,
        message: "Invaild alert id",
      });
    }

    return c.json({
      status: true,
      message: "Successfully deleted the alert",
    });
  } catch (error) {
    console.error("Error occured in the handleCreateAlert controller :", error);
    throw error;
  }
};
