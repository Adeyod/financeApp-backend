import multer, { FileFilterCallback } from 'multer';
import fs from 'fs';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = '../uploads';

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    console.log('I am inside multer');
    console.log(file);

    cb(null, file.originalname + '-' + uniqueSuffix);
  },
});

const maxLimit = 2000000;

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  console.log(req);
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg'
  ) {
    cb(null, true);
  } else if (file.size > maxLimit) {
    console.log('Max limit exceeded');
    cb(new Error('File format not supported'));
  } else {
    cb(new Error('File format not supported'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: maxLimit, files: 10 },
});

export default upload;
