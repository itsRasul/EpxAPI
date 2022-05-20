const express = require('express');
const dissLikeController = require('../controllers/dissLikeController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(authController.protect, dissLikeController.getAllDissLikes)
  .post(authController.protect, dissLikeController.createDissLike);

router
  .route('/:id')
  .get(dissLikeController.getDissLike)
  .delete(
    authController.protect,
    authController.reStrictTo('admin'),
    dissLikeController.deleteDissLike
  );

router
  .route('/:id/deleteMyDissLike')
  .delete(authController.protect, dissLikeController.deleteMyDissLike);

module.exports = router;
