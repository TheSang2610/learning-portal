const express = require('express');
const router = express.Router();
const {
    getUsers,
    registerUser,
    loginUser,
    googleLogin,
    updateUserProfile,
    getInstructorsByProvider,
    updateUserRole,
    deleteUser 
} = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/instructors', protect, admin, getInstructorsByProvider);

router.route('/').get(protect, admin, getUsers).post(registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, updateUserProfile);
router.put('/:id/role', protect, admin, updateUserRole);
router.delete('/:id', protect, admin, deleteUser);
router.post('/google', googleLogin);

module.exports = router;
