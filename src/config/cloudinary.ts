import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadFile = async (file: Express.Multer.File, folder: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `course-platform/${folder}`,
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error) {
    throw new Error(`Failed to upload file: ${(error as Error).message}`);
  }
};

export const deleteFile = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Failed to delete file: ${(error as Error).message}`);
  }
};

export default cloudinary;
