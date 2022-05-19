const express = require('express');
const expController = require('../controllers/expControllers');
const authController = require('../controllers/authController');

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

module.exports = router;
