var async = require('async');
var Category = require('../models/categoryModel');
var Item = require('../models/itemModel');

exports.categoryList = function(req, res) {
    async.parallel({
        categoryList: function(callback) {
            Category.find().exec(callback)
        }
    }, function(err, results) {
        if(err) { return next(err) }
        res.render('categories', { title: 'Category List', categories: results.categoryList })
    })
};

exports.categoryDetail = function (req, res) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback)
        },
        items: function(callback) {
            Item.find({ 'category': req.params.id }).populate('category').exec(callback)
        }
    }, function(err, results) {
        if(err) { return next(err) };
        res.render('categoryDetail', { category: results.category, items: results.items })
    })
};