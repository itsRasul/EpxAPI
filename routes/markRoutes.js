const express = require('express');
const markController = require('../controllers/markController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(authController.protect, markController.createMark)
  .get(authController.protect, authController.reStrictTo('admin'), markController.getAllMarks);

router.route('/myMarks').get(authController.protect, markController.getMyMarks);

router
  .route('/:id')
  .delete(authController.protect, authController.reStrictTo('admin'), markController.deleteMark);

router.route('/:id/deleteMyMark').delete(authController.protect, markController.deleteMyMark);

module.exports = router;
