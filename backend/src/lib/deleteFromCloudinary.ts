import cloudinary from "../config/cloudinary";

export const deleteFromCloudinary = async (
  publicId?: string | null,
): Promise<void> => {
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
};
