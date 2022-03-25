var async = require('async');
var mongoose = require('mongoose');

var mongoURI = require('./mongodb-connection-string');

var Category = require('./models/categoryModel');
var Item = require('./models/itemModel')

var mongoDB = process.env.MONGODB_URI || mongoURI.mongoURI();
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection
db.on('error', console.error.bind(console, 'MONGODB Connection Error:'));

var categories = [];
var items = [];

function categoryCreate(name, summary, cb) {
    let categoryDetail = {
        name: name,
        summary: summary,
    }

    var category = new Category(categoryDetail);

    category.save(function (err) {
        if(err) { 
            cb(err, null); 
            return 
        }
        console.log('New Category: ' + category);
        categories = categories.concat(category);
        cb(null, category);
    })
}

function itemCreate(name, summary, category, price, stock) {
    let itemDetail = {
        name: name,
        summary: summary,
        price: price,
        stock: stock
    }
    if(category != false) { itemDetail.category = category }
    let item = new Item(itemDetail);

    item.save(function (err) {
        if(err) {
            cb(err, null);
            return
        }
        console.log('New Item: ' + item);
        items = items.concat(item);
    })
}

function createCategories(cb) {
    async.series([
        function(callback) {
            categoryCreate('Kitchen', 'All your culinary needs, here with us!', callback)
        },
        function(callback) {
            categoryCreate('Bathroom', 'Get clean with us!', callback)
        },
        function(callback) {
            categoryCreate('Living Room', 'Comfy sofa leads to good time', callback)
        },
        function(callback) {
            categoryCreate('Study Room', 'Look stylish and learn effectively with us!', callback)
        },
    ], cb)
}

function createItems(cb) {
    async.parallel([
        function(callback) {
            itemCreate('Fork', 'Fork for any stabbing purposes (for foods only hopefully)', [categories[0]], 15, 10, callback)
        },        
        function(callback) {
            itemCreate('Soap', 'Kills 99.99%', [categories[1]], 5, 25, callback)
        },        
        function(callback) {
            itemCreate('Sofa', 'Good sofa right here', [categories[2]], 100, 15, callback)
        },        
        function(callback) {
            itemCreate('Bookshelf', 'For when digital is not enough', [categories[3]], 2, 20, callback)
        },        
    ], cb)
}

async.series([
    createCategories,
    createItems
], function(err, results) {
    if(err) { console.log('Final ERR: ' + err) }
    else { console.log('PROCESS DONE') }
    mongoose.connection.close;
})