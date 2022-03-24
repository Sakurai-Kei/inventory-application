var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ItemSchema = new Schema(
    {
        name: { type: String, required: true },
        summary: { type: String, required: true },
        category:[{ type: Schema.Types.ObjectId, ref: 'Category'}],
        price: { type: Number, required: true, min: 0 },
        stock: { type: Number, required: true, min: 0}
    }
);

ItemSchema.virtual('url').get( function() {
    return '/item/' + this._id;
});

module.exports = mongoose.model('Item', ItemSchema);