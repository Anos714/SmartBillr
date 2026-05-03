import cloudinary from "../config/cloudinary";

export type CloudinaryUploadResult = {
  url: string;
  publicId: string;
};

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder = "smartbillr/business-assets",
): Promise<CloudinaryUploadResult> => {
  const base64File = `data:${file.mimetype};base64,${file.buffer.toString(
    "base64",
  )}`;

  const uploadedFile = await cloudinary.uploader.upload(base64File, {
    folder,
    resource_type: "image",

    transformation: [
      {
        width: 800,
        crop: "limit",
        quality: "auto",
        format: "webp", //avif format
      },
    ],
  });

  return {
    url: uploadedFile.secure_url,
    publicId: uploadedFile.public_id,
  };
};
