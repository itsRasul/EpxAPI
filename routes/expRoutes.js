const express = require('express');
const expController = require('../controllers/expControllers');
const authController = require('../controllers/authController');
const likeRouter = require('./likeRotes');
const dissLikeRouter = require('./dissLikeRoutes');
const markRouter = require('./markRoutes');

const router = express.Router();

router
  .route('/')
  .get(expController.getAllExp)
  .post(authController.protect, expController.createExp);

router
  .route('/:id')
  .get(expController.getExp)
  .patch(authController.protect, authController.reStrictTo('admin'), expController.updateExp)
  .delete(authController.protect, authController.reStrictTo('admin'), expController.deleteExp);

router.route('/:id/deleteMyExp').delete(authController.protect, expController.deleteMyExp);
router.route('/:id/updateMyExp').patch(authController.protect, expController.updateMyExp);

router.use('/:expId/likes', likeRouter);
router.use('/:expId/disslikes', dissLikeRouter);
router.use('/:expId/marks', markRouter);
module.exports = router;
