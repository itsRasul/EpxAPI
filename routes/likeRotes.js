const express = require('express');
const likeController = require('../controllers/likeController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, authController.reStrictTo('admin'), likeController.getAllLikes)
  .post(authController.protect, likeController.createLike);

router
  .route('/:id')
  .get(likeController.getLike)
  .delete(authController.protect, authController.reStrictTo('admin'), likeController.deleteLike);

router.route('/:id/deleteMyLike').delete(authController.protect, likeController.deleteMyLike);
module.exports = router;
