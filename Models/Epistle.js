const mongoose = require("mongoose")

/**
 * A Mongoose schema for a epistle post.
 * @param title - The title of the epistle post.
 * @param content - The content of the epistle post.
 * @param DateAdded - The time of epistle post
 * @param links - The links of the epistle post
 * @param author - The author of the epistle post
 * @returns None
 */

const EpistleSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
      },
      DateAdded: {
        type: Date,
        required: true,
      },
      links: {
        type: [String],
        required: true,
      },
      content: {
        type: String,
        required: true,
      }
})

module.exports = mongoose.model('Epistle',EpistleSchema)