import { Request, Response } from "express";
import {
  BusinessInfoReq,
  businessInfoSchema,
} from "../schemas/businessInfo.schema";
import { BusinessInfo } from "../models/business.model";

export const saveBusinessInfoHandler = async (
  req: Request<{}, {}, BusinessInfoReq>,
  res: Response,
) => {
  const result = businessInfoSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      data: result.error.flatten().fieldErrors,
    });
  }
  const payload = result.data;
  try {
    const { sub } = req.user;
    const businessInfo = await BusinessInfo.findOneAndUpdate(
      { userId: sub },
      payload,
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Business info saved successfully",
      data: businessInfo,
    });
  } catch (error) {
    console.error("Business info handler error:", error);
  }
};

export const getBusinessInfoHandler = async (req: Request, res: Response) => {
  try {
    const { sub } = req.user;
  } catch (error) {
    console.error("Get business info handler error:", error);
  }
};

export const deleteBusinessInfoHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { sub } = req.user;
  } catch (error) {
    console.error("Delete business info handler error:", error);
  }
};
