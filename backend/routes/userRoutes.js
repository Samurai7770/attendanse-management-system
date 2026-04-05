const express = require('express');
const router = express.Router();
const { findOrCreateUser, logout, getCurrentUser, getUsers } = require('../controllers/userController');

router.post('/login', findOrCreateUser);
router.post('/logout', logout);
router.get('/me', getCurrentUser);
router.get('/', getUsers);

module.exports = router;