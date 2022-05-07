const express = require('express');
const expController = require('../controllers/expControllers');

const router = express.Router();

router.route('/').get(expController.getAllExp).post(expController.createExp);

router
	.route('/:id')
	.get(expController.getExp)
	.patch(expController.updateExp)
	.delete(expController.deleteExp);

module.exports = router;
