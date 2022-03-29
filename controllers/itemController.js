var async = require('async');
const { body, validationResult } = require('express-validator');
var Category = require('../models/categoryModel')
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

exports.itemCreateGet = function(req, res) {
    async.parallel({
        categoryList: function(callback) {
            Category.find().exec(callback)
        }
    }, function(err, results) {
        if(err) { return next(err) }
        let sortedCategoryList = results.categoryList;
        sortedCategoryList.sort( function(a, b) {
            if(a.name.trim().toUpperCase() < b.name.trim().toUpperCase()) {
                return -1;
            }
            if(a.name.trim().toUpperCase() > b.name.trim().toUpperCase()) {
                return 1;
            }
            return 0;
        })
        res.render('itemForm', { title: 'Create Item', categoryList: sortedCategoryList })
    })
}

exports.itemCreatePost = [
    function(req, res, next) {
        if(!(req.body.category instanceof Array)) {
            if(typeof req.body.category === 'undefined') {
                req.body.category = [];
            }
            else {
                req.body.category = new Array(req.body.category)
            }
        }
        next();
    },
    body('name', 'Name must not be empty').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty').trim().isLength({ min: 1 }).escape(),
    body('category', 'At least one category must be chosen').not().isEmpty(),
    body('category.*').escape(),
    body('price', 'Price must not be empty').trim().isLength({ min: 1}).escape(),
    body('price').custom( function(value, { req }) {
        if(value < 0) {
            throw new Error('Price must not be less than 0')
        }
        return true;
    }),
    body('stock', 'Quantity must not be empty').trim().isLength({ min: 1 }).escape(),
    body('stock').custom( function(value, { req }) {
        if(value < 0) {
            throw new Error('Quantity must not be less than 0')
        }
        return true;
    }),
    function(req, res, next) {
        const errors = validationResult(req);

        var item = new Item({
            name: req.body.name,
            summary: req.body.summary,
            category: req.body.category,
            price: req.body.price,
            stock: req.body.stock
        });

        if(!errors.isEmpty()) {
            async.parallel({
                categoryList: function(callback) {
                    Category.find().exec(callback)
                }
            }, function(err, results) {
                if(err) { return next(err) }
                results.categoryList.forEach( function(category) {
                    if(item.category.indexOf(category._id) > -1) {
                        category.checked='true';
                    }
                })
                let sortedCategoryList = results.categoryList;
                sortedCategoryList.sort( function(a, b) {
                    if(a.name.trim().toUpperCase() < b.name.trim().toUpperCase()) {
                        return -1;
                    }
                    if(a.name.trim().toUpperCase() > b.name.trim().toUpperCase()) {
                        return 1;
                    }
                    return 0;
                })        
                res.render('itemForm', { title: 'Create Item', item: item, categoryList: sortedCategoryList, errors: errors.array() })
            })
            return;
        }
        else {
            item.save( function(err) {
                if(err) { return next(err) }
                res.redirect(item.url);
            })
        }
    }
];

exports.itemUpdateGet = function(req, res) {
    async.parallel({
        categoryList: function(callback) {
            Category.find().exec(callback)
        },
        item: function(callback) {
            Item.findById({ "_id": req.params.id }).populate('category').exec(callback)
        }
    }, function(err, results) {
        if(err) { return next(err) }
        let { categoryList, item } = results;
        categoryList.forEach( function(categoryFromList) {
            item.category.forEach( function(category) {
                if(category._id.toString() === categoryFromList._id.toString()) {
                    categoryFromList.checked = 'true';
                }
            })
        })
        let sortedCategoryList = categoryList;
        sortedCategoryList.sort( function(a, b) {
            if(a.name.trim().toUpperCase() < b.name.trim().toUpperCase()) {
                return -1;
            }
            if(a.name.trim().toUpperCase() > b.name.trim().toUpperCase()) {
                return 1;
            }
            return 0;
        })
        res.render('itemForm', { title: 'Update Item Details', item: item, categoryList: sortedCategoryList })
    })
}

exports.itemUpdatePost = [
    function(req, res, next) {
        if(!(req.body.category instanceof Array)) {
            if(typeof req.body.category === 'undefined') {
                req.body.category = [];
            }
            else {
                req.body.category = new Array(req.body.category)
            }
        }
        next();
    },
    body('name', 'Name must not be empty').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty').trim().isLength({ min: 1 }).escape(),
    body('category', 'At least one category must be chosen').not().isEmpty(),
    body('category.*').escape(),
    body('price', 'Price must not be empty').trim().isLength({ min: 1}).escape(),
    body('price').custom( function(value, { req }) {
        if(value < 0) {
            throw new Error('Price must not be less than 0')
        }
        return true;
    }),
    body('stock', 'Quantity must not be empty').trim().isLength({ min: 1 }).escape(),
    body('stock').custom( function(value, { req }) {
        if(value < 0) {
            throw new Error('Quantity must not be less than 0')
        }
        return true;
    }),
    function(req, res, next) {
        const errors = validationResult(req);

        var item = new Item({
            name: req.body.name,
            summary: req.body.summary,
            category: req.body.category,
            price: req.body.price,
            stock: req.body.stock,
            _id: req.params.id
        });

        if(!errors.isEmpty()) {
            async.parallel({
                categoryList: function(callback) {
                    Category.find().exec(callback)
                }
            }, function(err, results) {
                if(err) { return next(err) }
                let { categoryList, item } = results;
                categoryList.forEach( function(categoryFromList) {
                    item.category.forEach( function(category) {
                        if(category._id.toString() === categoryFromList._id.toString()) {
                            categoryFromList.checked = 'true';
                        }
                    })
                })
                let sortedCategoryList = categoryList;
                sortedCategoryList.sort( function(a, b) {
                    if(a.name.trim().toUpperCase() < b.name.trim().toUpperCase()) {
                        return -1;
                    }
                    if(a.name.trim().toUpperCase() > b.name.trim().toUpperCase()) {
                        return 1;
                    }
                    return 0;
                })        
                res.render('itemForm', { title: 'Create Item', item: item, categoryList: sortedCategoryList, errors: errors.array() })
            })
            return;
        }
        else {
            Item.findByIdAndUpdate(req.params.id, item, {}, function(err, theItem) {
                if(err) { return next(err) }
                res.redirect(theItem.url);
            })
        }
    }
];