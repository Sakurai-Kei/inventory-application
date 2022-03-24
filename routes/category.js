var express = require('express');
var router = express.Router();

var categoryController = require('../controllers/categoryController');

router.get('/', categoryController.categoryList);

router.get('/:id', categoryController.categoryDetail);

module.exports = router;