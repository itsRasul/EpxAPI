const express = require('express');
const expController = require('../controllers/expControllers');

const router = express.Router();

router.route('/').get(expController.getAllExp);

module.exports = router;
