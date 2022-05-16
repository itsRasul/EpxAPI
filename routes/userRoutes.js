const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/logout').post(authController.protect, authController.login);
router.route('/updateMe').patch(authController.protect, authController.updateMe);
router.route('/updateMyPassword').patch(authController.protect, authController.updateMyPassword);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);
router.route('/me').get(authController.protect, userController.getMe);
router.route('/deleteMe').delete(authController.protect, authController.deleteMe);
router.route('/').get(userController.getAllUser).post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.route('/:id/updateUserPassword').patch(userController.updateUserPassword);

module.exports = router;
