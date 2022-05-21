const express = require('express');
const authController = require('../controllers/authController');
const commentController = require('../controllers/commentController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(authController.protect, commentController.createComment)
  .get(authController.protect, commentController.getAllComments);

router
  .route('/:id/deleteMyComment')
  .delete(authController.protect, commentController.deleteMyComment);

router
  .route('/:id/updateMyComment')
  .patch(authController.protect, commentController.updateMyComment);

router
  .route('/:id')
  .get(commentController.getComment)
  .patch(
    authController.protect,
    authController.reStrictTo('admin'),
    commentController.updateComment
  )
  .delete(
    authController.protect,
    authController.reStrictTo('admin'),
    commentController.deleteComment
  );

module.exports = router;
