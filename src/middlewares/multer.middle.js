import multer from "multer";  // Multer is a middleware for handling multipart/form-data, which is primarily used for uploading files. It is written on top of busboy for maximum efficiency.

const storage = multer.diskStorage({ // The diskStorage function is used to define the storage engine. It takes an object with two properties: destination and filename. 
  destination: function (req, file, cb) { // The destination property is used to define the folder where the file will be saved. 
    cb(null, "public/temp"); // The destination is the folder where the file will be saved. In this case, the file will be saved in the public/temp folder. 
  },
  filename: function (req, file, cb) { // The filename property is used to define the name of the file. 
    cb(null, file.fieldname); // file.fieldname is the name of the input field associated with the file. It is used to save the file with the same name as the input field name. 
  },
});

export const upload = multer({storage }); // The upload function is used to upload the file. It takes an object with the storage property, which is set to the storage engine defined above. 
