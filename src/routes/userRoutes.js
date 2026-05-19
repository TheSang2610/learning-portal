const express = require('express');
const router = express.Router();
const {
    getUsers,
    registerUser,
    loginUser,
    googleLogin,
    updateUserProfile, 
    deleteUser 
} = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/').get(protect, admin, getUsers).post(registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, updateUserProfile);
router.delete('/:id', protect, admin, deleteUser);
router.post('/google', googleLogin);

module.exports = router;
