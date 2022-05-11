const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/updateMe').patch(authController.protect, authController.updateMe);
router.route('/updateMyPassword').patch(authController.protect, authController.updateMyPassword);
router.route('/').get(userController.getAllUser).post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.route('/:id/updateUserPassword').patch(userController.updateUserPassword);

module.exports = router;
