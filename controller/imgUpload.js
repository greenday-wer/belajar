const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const multerGoogleStorage = require('multer-cloud-storage');
const path = require('path');

// Inisialisasi Google Cloud Storage
const storage = new Storage();
const bucketName = 'capstone-profile'; // Ganti dengan nama bucket Anda
const bucket = storage.bucket(bucketName);

// Konfigurasi multer untuk Google Cloud Storage
const upload = multer({
    storage: multerGoogleStorage.storageEngine({
        bucket: bucketName, // Nama bucket Google Cloud
        projectId: 'learned-balm-442802-r6', // ID Project Google Cloud
        keyFilename: path.join(__dirname, '..', 'config', 'credential.json'), // Path ke file kredensial yang benar
        destination: (req, file, cb) => {
            cb(null, 'profile-pictures/'); // Folder dalam bucket
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // Maksimum ukuran file 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only JPEG, PNG, and JPG images are allowed!'));
        }
        cb(null, true);
    }
});

// Fungsi untuk menangani upload profil ke Google Cloud Storage
const uploadProfileImage = (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'Please upload a valid image!' });
        }

        // Mendapatkan URL file yang diupload
        const fileUrl = `https://storage.googleapis.com/${bucketName}/profile-pictures/${file.filename}`;

        res.status(200).json({
            message: 'Profile image uploaded successfully!',
            fileUrl: fileUrl,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ekspor controller dan upload middleware
module.exports = {
    upload,
    uploadProfileImage
};
