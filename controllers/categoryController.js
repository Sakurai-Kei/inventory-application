var async = require('async');
const { body, validationResult } = require('express-validator');
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

exports.createCategoryGet = function(req, res) {
    res.render('categoryForm', { title: 'Create Category' })
}

exports.createCategoryPost = [
    body('name', 'Name must not be empty').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty').trim().isLength({ min: 1 }).escape(),
    function(req, res, next) {
        const errors = validationResult(req);

        var category = new Category({
            name: req.body.name,
            summary: req.body.summary
        })
        if(!errors.isEmpty()) {
            res.render('categoryForm', { title: 'Create Category', category: category, errors: errors.array()})
        }
        else {
            async.parallel({
                categoryList: function(callback) {
                    Category.find().exec(callback)
                }
            }, function(err, results) {
                if(err) { return next(err) }
                let duplicate = undefined;
                const { categoryList } = results;
                categoryList.forEach( function(categoryFromList) {
                    if(categoryFromList.name.toUpperCase() === category.name.toUpperCase()) {
                        duplicate = true;
                    }
                })
                if(duplicate) {
                    res.render('categoryForm', { title: 'Create Category', category: category, errors: [{ msg: 'Category already existed' }]})
                }
                else {
                    category.save( function(err) {
                        if(err) {return next(err) }
                        res.redirect(category.url)
                    })                    
                }
            })
        }  
    }
]