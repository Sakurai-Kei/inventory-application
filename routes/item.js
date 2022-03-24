var express = require('express');
var router = express.Router();

var itemController = require('../controllers/itemController');

router.get('/', itemController.itemList)

router.get('/:id', itemController.itemDetail);

module.exports = router;