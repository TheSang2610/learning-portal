const express = require('express');
const router = express.Router();
const {
    getUsers,
    registerUser,
    loginUser,
    googleLogin,
    updateUserProfile,
    deactivateMyAccount,
    getInstructorsByProvider,
    updateUserRole,
    deleteUser 
} = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { loginRateLimit } = require('../middlewares/loginRateLimit');
const { getMyProfile, getMyActivity } = require('../controllers/activityController');

router.get('/instructors', protect, admin, getInstructorsByProvider);

router.route('/').get(protect, admin, getUsers).post(registerUser);
router.post('/login', loginRateLimit, loginUser);
router.get('/profile', protect, getMyProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/deactivate', protect, deactivateMyAccount);
router.get('/activity', protect, getMyActivity);
router.put('/:id/role', protect, admin, updateUserRole);
router.delete('/:id', protect, admin, deleteUser);
router.post('/google', googleLogin);

module.exports = router;
