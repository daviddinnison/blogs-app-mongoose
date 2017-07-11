const mongoose = require('mongoose');

//schema for blogs
const blogsSchema = mongoose.Schema({
  title: {type: String, required: true},
  content:{type: String, required: true},
  author: {type: String, required: true},
  created: {type: Date}
});

const Blogs = mongoose.model('Blogs', blogsSchema);

module.exports = {Blogs};