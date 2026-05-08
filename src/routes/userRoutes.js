const express = require('express');
const router = express.Router();
const { 
    getUsers, 
    registerUser, 
    loginUser, 
    updateUserProfile, 
    deleteUser 
} = require('../controllers/userController');

router.route('/').get(getUsers).post(registerUser);
router.post('/login', loginUser);
router.put('/profile', updateUserProfile);
router.delete('/:id', deleteUser);

module.exports = router;