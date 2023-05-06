const express = require('express');
const { uploader } = require('../utils/fileReader');
const fileController = require('../controllers/fileController');
const { isAuthenticated } = require('../controllers/authController');

const router = express.Router();

router.get('/downloadFile', fileController.downloadFile);
router.get('/downloadFolder', fileController.downloadFolder);

router.post('/upload', isAuthenticated, uploader.single('attachment'), fileController.uploadFiles);
router.post('/createFolder', isAuthenticated, fileController.createFolder);
router.post('/createTextFile', isAuthenticated, fileController.createTextFile);

router.patch('/editFileName', isAuthenticated, fileController.editFileName);
// router.patch('/editFolderName', fileController.editFolderName);

router.delete('/', fileController.delete);

module.exports = router;