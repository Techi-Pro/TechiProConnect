import multer from 'multer';
import path from 'path';

// Set storage options for multer (files will be saved to 'uploads' folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Define upload directory
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);  // Extract file extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Only accept certain file types (e.g., PDF, JPEG, PNG)
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and image files are allowed.'));
    }
  }
});


