const express = require('express');
const rateLimit = require('express-rate-limit');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const followRouter = require('./followRoutes');

const router = express();

const rateLimiterApi = rateLimit({
  max: 20,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests, please try again!',
});

router.route('/signup').post(rateLimiterApi, authController.signup);
router.route('/login').post(rateLimiterApi, authController.login);
router.route('/logout').post(rateLimiterApi, authController.protect, authController.logout);
router
  .route('/updateMe')
  .patch(
    authController.protect,
    userController.updateUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
  );
router.route('/updateMyPassword').patch(authController.protect, authController.updateMyPassword);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);
router.route('/me').get(authController.protect, userController.getMe);
router.route('/deleteMe').delete(authController.protect, authController.deleteMe);
router.route('/my-exps-stats').get(authController.protect, userController.getMyExpsStats);
router.route('/top-users').get(authController.protect, userController.getTopUsersMonthly);
// router
//   .route('/uploadVideo')
//   .post(authController.protect, userController.uploadVideo, userController.uploadVideoHandler);
router
  .route('/')
  .get(authController.protect, authController.reStrictTo('admin'), userController.getAllUser)
  .post(authController.protect, authController.reStrictTo('admin'), userController.createUser);

router
  .route('/:id/updateUserPassword')
  .patch(
    authController.protect,
    authController.reStrictTo('admin'),
    userController.updateUserPassword
  );

router
  .route('/:id')
  .get(userController.getUser)
  .patch(authController.protect, authController.reStrictTo('admin'), userController.updateUser)
  .delete(authController.protect, authController.reStrictTo('admin'), userController.deleteUser);

router.use('/:userId/follows', followRouter);

module.exports = router;
