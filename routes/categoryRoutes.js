const express = require('express');
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(categoryController.getAllCategories);
router.route('/:id').get(categoryController.getCategory);

router.use(authController.protect, authController.reStrictTo('admin'));

router.route('/').post(categoryController.createCategory);

router
  .route('/:id')
  .delete(categoryController.deleteCategory)
  .patch(categoryController.updateCategory);

module.exports = router;
