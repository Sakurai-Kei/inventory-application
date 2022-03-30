var express = require('express');
var router = express.Router();

var categoryController = require('../controllers/categoryController');

router.get('/', categoryController.categoryList);

router.get('/create', categoryController.createCategoryGet);

router.post('/create', categoryController.createCategoryPost)

router.get('/:id', categoryController.categoryDetail);

router.get('/:id/update', categoryController.categoryUpdateGet);

router.post('/:id/update', categoryController.categoryUpdatePost);

module.exports = router;