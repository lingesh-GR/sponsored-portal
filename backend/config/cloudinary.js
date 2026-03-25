const multer = require('multer');

// MOCK CLOUDINARY CONFIG (Local Development)
// Modified to properly parse FormData even when Cloudinary is bypassed.
const storage = multer.memoryStorage();
const uploadParser = multer({ storage: storage });

module.exports = {
    // This middleware now correctly parses the "scheme_name" field from FormData
    upload: (req, res, next) => {
        console.log("Cloudinary Mock: Parsing FormData fields...");
        
        // We use .any() or .single() to trigger the body parser in multer
        const parser = uploadParser.any();
        parser(req, res, (err) => {
           if (err) {
               console.error("Multer parse error:", err.message);
               return next(err);
           }
           console.log("Form fields parsed successfully (Local Mode)");
           req.file = null; // Mark as no file uploaded
           next();
        });
    }
};
