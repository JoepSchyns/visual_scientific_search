const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AuthorModel = require('./AuthorModel')

const Paper = new Schema({
  title: String,
  url: String,
  authors: [AuthorModel],
  description: String,
  citedCount: Number,
  citedUrl: String,
  relatedUrl: String,
  pdf: String,
  updated: { type: Date, default: Date.now },
},{
    collection: 'papers'
});

module.exports = mongoose.model('Paper', Paper);