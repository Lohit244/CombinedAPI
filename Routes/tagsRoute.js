const express = require("express")
const router = express.Router()
const tags = require("../Models/tags")


/**
 * Returns all the tags in the database.
 * @param req - The request object.
 * @param res - The response object.
 * @returns None
 */
router.get("/", async(req,res)=>{
  try{
    const Tags = await tags.find()
    res.json(Tags)
  }catch (err){
    res.status(500).json({ message: err.message })
  }
})


/**
 * Create a new tag.
 * @param req - The request object.
 * @param res - The response object.
 * @returns None
 */
router.post("/",async(req,res)=>{
  const Tag = new tags({
    title: req.body.title,
  })
  try{
    const newTag = await Tag.save()
    res.status(201).send(newTag);
  }catch (err) {
    res.status(400).json({message: err.message})
  }
})

module.exports = router