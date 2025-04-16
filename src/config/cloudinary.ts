import { v2 as cloudinary, ResourceType } from 'cloudinary';
import streamifier from 'streamifier';
import { env } from './env';
import { AppError } from '../model/errorModel';
import { StatusCodes } from 'http-status-codes';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadFromBuffer = (
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' | 'video' | 'auto' = 'auto',
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `course-platform/${folder}`,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          reject(
            new AppError(`Upload failed: ${error.message}`, StatusCodes.INTERNAL_SERVER_ERROR),
          );
          return;
        }
        resolve(result?.secure_url || '');
      },
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export const deleteFile = async (url: string): Promise<void> => {
  try {
    if (!url) {
      throw new AppError('Invalid file URL', StatusCodes.BAD_REQUEST);
    }
    const publicId = url.split('/').slice(-1)[0].split('.')[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to delete file: ${(error as Error).message}`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

export default cloudinary;
