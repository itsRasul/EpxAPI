const express = require('express');
const expController = require('../controllers/expControllers');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, expController.getAllExp)
  .post(expController.createExp);

router
  .route('/:id')
  .get(expController.getExp)
  .patch(expController.updateExp)
  .delete(expController.deleteExp);

module.exports = router;
