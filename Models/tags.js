const mongoose = require("mongoose")

/**
 * A mongoose schema for the blog tags model.
 * @param title - The title of the tag.
 * @returns None
 */
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  }
})


module.exports = mongoose.model('naps_tags', blogSchema)
