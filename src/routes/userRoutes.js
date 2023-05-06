const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/logout', authController.logout);

// Protect CSRF for all http method after this middleware 
// router.use(authController.protect);

router.post('/register', authController.register);
router.post('/login', authController.login);


module.exports = router;