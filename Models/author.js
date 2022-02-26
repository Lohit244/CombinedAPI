const mongoose = require("mongoose")

/**
 * The author schema for the database.
 * @param name - The name of the author.
 * @param photo - The photo url of the author.
 * @param desc - The description of the author.
 * @param tags - The tags of the author's posts.
 * @param createdAt - The timestamp of the profile's creation.
 * @returns None
 */
const authorSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  tags: {
    type: Array,
    required: false,
    default: []
  },
  createdAt: {
    type: Date,
    required: true
  }
})

module.exports = mongoose.model('naps_author',authorSchema)