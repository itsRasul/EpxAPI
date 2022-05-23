const express = require('express');
const likeCommentController = require('../controllers/likeCommentModel');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(authController.protect, likeCommentController.getAllLikeComments)
  .post(authController.protect, likeCommentController.createLikeComment);

router
  .route('/:id')
  .get(likeCommentController.getLikeComment)
  .delete(
    authController.protect,
    authController.reStrictTo('admin'),
    likeCommentController.deleteLikeComment
  );

router
  .route('/:id/deleteMyLikeComment')
  .delete(authController.protect, likeCommentController.deleteMyLikeComment);

module.exports = router;
