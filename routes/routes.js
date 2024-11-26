const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth.js');
const { verifyToken } = require('../middleware/verify.js');
const getProfile = require('../controller/getProfile.js');
const updateProfile = require('../controller/updateProfile.js');
const deleteProfile = require('../controller/deleteProfile.js');
const getArticle = require('../controller/article.js');
const getHealthStore = require('../controller/getHealthStore.js');
const { upload, uploadProfileImage } = require('../controller/imgUpload.js');

router.get("/", (req, res) => {
    res.status(200).json({
        "message": "Mindcare respond good"
    })
});

router.post("/register", auth.registration);
router.post("/login", auth.login);
router.get("/profile", verifyToken, getProfile.getProfile);
router.put("/profile/edit", verifyToken, updateProfile.updateProfile);
router.delete("/profile/delete", verifyToken, deleteProfile.deleteProfile);
router.get("/article", verifyToken, getArticle.getArticle);
router.get("/getStore", verifyToken, getHealthStore.getHealthStore);
router.post('/upload-profile', verifyToken, upload.single('profileImage'), uploadProfileImage);

module.exports = router;