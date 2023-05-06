const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const { getCurrentDir } = require('../utils/fileReader');

const router = express.Router();

router.get('/register', authController.isLoggedIn, viewController.registerPage);
router.get('/login', authController.isLoggedIn, viewController.loginPage);
router.get(['/', '/home'], authController.isAuthenticated, getCurrentDir, viewController.homePage);

module.exports = router;