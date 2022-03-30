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

exports.categoryUpdateGet = function(req, res) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback);
        }
    }, function(err, results) {
        if(err) { return next(err) }
        let { category } = results;
        res.render('categoryForm', { title: 'Update Category', category: category })
    })
};

exports.categoryUpdatePost = [
    body('name', 'Name must not be empty').trim().isLength({ min:1 }).escape(),
    body('summary', 'Summary must not be empty').trim().isLength({ min: 1 }).escape(),
    function(req, res, next) {
        const errors = validationResult(req);

        var category = new Category({
            name: req.body.name,
            summary: req.body.summary,
            _id: req.params.id
        });

        if(!errors.isEmpty()) {
            res.render('categoryForm', { title: 'Update Category', category: category, errors: errors });
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
                        if(categoryFromList._id.toString() === category._id.toString()) {
                            duplicate = false;
                        }
                    }
                })
                if(duplicate) {
                    res.render('categoryForm', { title: 'Update Category', category: category, errors: [{ msg: 'Category already existed' }] })
                }
                else {
                    Category.findByIdAndUpdate(req.params.id, category, {}, function(err, theCategory) {
                        if(err) { return next(err) }
                        res.redirect(theCategory.url);
                    })
                }
            })
        }
    }
];

exports.categoryDeleteGet = function(req, res) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback)
        },
        itemFromCategory: function(callback) {
            Item.find({ 'category': req.params.id }).populate('category').exec(callback)
        }
    }, function(err, results) {
        if(err) { return next(err) }
        let { category, itemFromCategory } = results;
        res.render('categoryDelete', { title: 'Delete Category', category: category, item: itemFromCategory })
    })
};

exports.categoryDeletePost = function(req, res) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.body.categoryid).exec(callback)
        },
        itemFromCategory: function(callback) {
            Item.find({ 'category': req.body.categoryid }).populate('category').exec(callback)
        }
    }, function(err, results) {
        if(err) { return next(err) }
        let { category, itemFromCategory } = results;
        if(!itemFromCategory) {
            res.render('categoryDelete', { title: 'Delete Category', category: category, item: itemFromCategory })
        }
        else {
            Category.findByIdAndDelete(req.body.categoryid, function deleteCategory(err) {
                if(err) { return next(err) }
                res.redirect('/category')
            })
        }
    })
};