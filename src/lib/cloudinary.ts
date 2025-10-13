
import { v2 as cloudinary } from 'cloudinary';

// These should be set in your .env file
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName) {
  console.warn('Cloudinary cloud name is not set. Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME. Image uploads may fail.');
}
if (!apiKey || !apiSecret) {
  console.warn('Cloudinary API key/secret are not set. Authenticated image uploads will fail. Using unsigned uploads as fallback.');
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
    // Use signed upload if credentials are provided
    if (apiKey && apiSecret) {
        const result = await cloudinary.uploader.upload(fileDataUri, {
            folder: folder,
            resource_type: 'auto',
        });
        return { secure_url: result.secure_url, public_id: result.public_id };
    } else {
        // Fallback to unsigned upload if API key/secret are missing
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        if (!uploadPreset) {
            throw new Error("Cloudinary upload preset is not defined. Please set NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.");
        }
        const result = await cloudinary.uploader.unsigned_upload(fileDataUri, uploadPreset, {
            folder: folder,
            resource_type: 'auto',
        });
        return { secure_url: result.secure_url, public_id: result.public_id };
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image.');
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    if (!apiKey || !apiSecret) {
        console.warn("Cannot delete from Cloudinary: API key/secret not configured.");
        return;
    }
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        // We don't throw an error here because failing to delete an old image
        // shouldn't block the user from proceeding with their action.
    }
}
