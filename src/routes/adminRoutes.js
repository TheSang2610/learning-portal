const express = require('express');
const router = express.Router();
const { capIdHopLe } = require('../middlewares/idHopLe');

// Chan id sai dinh dang -> 404 thay vi 500. Xem middlewares/idHopLe.js
capIdHopLe(router);
const { protect, admin } = require('../middlewares/authMiddleware');
const {
    // Dashboard
    getDashboardStatistics,

    // Users Management
    getAllUsers,
    getUserDetails,
    createUserAdmin,
    updateUserAdmin,
    updateUserStatus,
    deleteUserAdmin,

    // Courses Management
    getAllCourses,
    getCourseDetailsAdmin,
    updateCoursePublishStatus,
    deleteCourseAdmin,

    // Enrollments Management
    getAllEnrollments,
    getEnrollmentDetailsAdmin,
    updateEnrollmentStatus,

    // Certificates Management
    getAllCertificates,
    verifyCertificate,
    revokeCertificate,

    // Reviews Management
    getAllReviews,
    deleteReviewAdmin
} = require('../controllers/adminController');

// Middleware: Protect all routes with admin authentication
router.use(protect, admin);

// ============ Dashboard ============
router.get('/dashboard/statistics', getDashboardStatistics);

// ============ Users Management ============
router.get('/users', getAllUsers);
router.post('/users', createUserAdmin);
router.get('/users/:id', getUserDetails);
router.put('/users/:id', updateUserAdmin);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUserAdmin);

// ============ Courses Management ============
router.get('/courses', getAllCourses);
router.get('/courses/:id', getCourseDetailsAdmin);
router.put('/courses/:id/publish', updateCoursePublishStatus);
router.delete('/courses/:id', deleteCourseAdmin);

// ============ Enrollments Management ============
router.get('/enrollments', getAllEnrollments);
router.get('/enrollments/:id', getEnrollmentDetailsAdmin);
router.put('/enrollments/:id/status', updateEnrollmentStatus);

// ============ Certificates Management ============
router.get('/certificates', getAllCertificates);
router.get('/certificates/:verificationCode/verify', verifyCertificate);
router.put('/certificates/:id/revoke', revokeCertificate);

// ============ Reviews Management ============
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReviewAdmin);

module.exports = router;
