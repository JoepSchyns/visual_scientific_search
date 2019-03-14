const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuthorModel = new Schema({
  name: String,
  url: String,
  updated: { type: Date, default: Date.now },
},{
    collection: 'authors'
});

module.exports = mongoose.model('AuthorModel', AuthorModel);