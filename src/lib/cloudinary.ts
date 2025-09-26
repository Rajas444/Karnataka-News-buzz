
import { v2 as cloudinary } from 'cloudinary';

// These should be set in your .env file
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Cloudinary environment variables are not set. Image uploads will fail.');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export const uploadToCloudinary = async (
  fileDataUri: string,
  folder: string
): Promise<{ secure_url: string; public_id: string }> => {
  try {
    const result = await cloudinary.uploader.upload(fileDataUri, {
      folder: folder,
      resource_type: 'auto',
    });
    return { secure_url: result.secure_url, public_id: result.public_id };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image.');
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        // We don't throw an error here because failing to delete an old image
        // shouldn't block the user from proceeding with their action.
    }
}
