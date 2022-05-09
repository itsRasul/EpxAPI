const express = require('express');
const userController = require('../controllers/userController');

const router = express();

router.route('/').get(userController.getAllUser).post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.route('/:id/updateUserPassword').patch(userController.updateUserPassword);
module.exports = router;
