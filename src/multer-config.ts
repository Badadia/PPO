import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './upload/temp', // Diretório temporário
    filename: (req, file, callback) => {
      const fileExt = path.extname(file.originalname);
      const fileName = uuidv4() + fileExt;
      callback(null, fileName);
    },
  }),
};
