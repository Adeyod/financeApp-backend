import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiOptions,
} from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
import { rejects } from 'assert';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type FilePath = string;
type FolderName = string;

type CloudinaryType = { url: string; public_id: string } | undefined;

const cloudinaryUploads = async (
  file: FilePath,
  folder: FolderName
): Promise<CloudinaryType> => {
  return new Promise((resolve, reject) => {
    const options: UploadApiOptions = {
      resource_type: 'auto',
      folder: folder,
    };
    cloudinary.uploader.upload(
      file,
      options,
      (error: any, result: UploadApiResponse | undefined) => {
        if (error) {
          return reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        } else {
          reject(new Error('Unknown error occurred during the upload process'));
        }
      }
    );
  });
};

const uploader = async (path: FilePath): Promise<CloudinaryType> => {
  return await cloudinaryUploads(path, 'FundFlow');
};

const singleFileUpload = async (
  file: { path: FilePath },
  res: any
): Promise<CloudinaryType> => {
  const { path } = file;
  try {
    const newPath = await uploader(path);
    fs.unlinkSync(path);
    return newPath;
  } catch (error: any) {
    console.error(error.message);
  }
};

const multipleFileUpload = async (
  files: Array<{ path: FilePath }>,
  res: any
): Promise<CloudinaryType[]> => {
  let urls: CloudinaryType[] = [];

  for (const file of files) {
    const { path } = file;
    try {
      const newPath = await uploader(path);

      if (urls) {
        if (newPath) {
          urls.push(newPath);
        }

        fs.unlinkSync(path);
      }
    } catch (error: any) {
      console.error(error.message);
    }
  }

  return urls;
};

const handleFileUpload = async (req: any, res: any) => {
  try {
    let newPath;
    if (req.file) {
      newPath = await singleFileUpload(req.file, res);
    }
    if (req.files && req.files.length > 1) {
      newPath = await multipleFileUpload(req.files, res);
    } else if (req.files && req.files.length === 1) {
      newPath = await multipleFileUpload(req.files[0], res);
    }

    return newPath;
  } catch (error) {
    console.log(error);
  }
};

const cloudinaryDestroy = async (public_id: string | string[]) => {
  try {
    const publicIdsArray = Array.isArray(public_id) ? public_id : [public_id];
    const deletePromise = publicIdsArray.map(async (publicId) => {
      try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
      } catch (error) {
        console.log(error);
      }
    });

    const deletedResult = await Promise.all(deletePromise);
  } catch (error) {
    console.log(error);
  }
};

export { cloudinaryDestroy, handleFileUpload };
