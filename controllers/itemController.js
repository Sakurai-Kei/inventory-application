var async = require('async');
var Item = require('../models/itemModel');


exports.itemList = function(req, res) {
    async.parallel({
        itemList: function(callback) {
            Item.find().exec(callback)
        }
    }, function(err, results) {
        if(err) { return next(err) }
        res.render('items', { title: 'Item List', itemList: results.itemList })
    })
}

exports.itemDetail = function(req, res) {
    async.parallel({
        item: function(callback) {
            Item.findById(req.params.id).populate('category').exec(callback)
        }
    }, function (err, results) {
        if(err) { return next(err) }
        res.render('itemDetail', { item: results.item })
    })
};