var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategorySchema = new Schema(
    {
        name: { type: String, required: true, minlength: 3, maxlength: 50 },
        summary: { type: String },
    }
);

CategorySchema.virtual('url').get( function() {
    return '/category/' + this._id;
});

module.exports = mongoose.model('Category', CategorySchema);