const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/logout').post(authController.protect, authController.logout);
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

module.exports = router;
