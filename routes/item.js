var express = require('express');
var router = express.Router();

var itemController = require('../controllers/itemController');

router.get('/', itemController.itemList)

router.get('/create', itemController.itemCreateGet);

router.post('/create', itemController.itemCreatePost)

router.get('/:id', itemController.itemDetail);

router.get('/:id/update', itemController.itemUpdateGet);

router.post('/:id/update', itemController.itemUpdatePost);

router.get('/:id/delete', itemController.itemDeleteGet);

router.post('/:id/delete', itemController.itemDeletePost);



module.exports = router;