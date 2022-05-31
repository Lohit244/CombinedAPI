const express = require("express");
const User = require("../Models/UserModel");
const router = express.Router()
const authorschema = require("../Models/author")
const blog = require("../Models/blog")
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
// Data -> Name, Photo, Description, Tags (Auto Generated)
// TODO 

/**
 * A middleware function that takes in a request and response object and returns a promise that resolves to the author with the given ID.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function to call.
 * @returns None
 */
async function getAuthor(req,res,next){
  let Author;
  try{
    Author = await authorschema.findById(req.params.id);
    if(Author == null){
      return res.status(404).json({message: "No Author With Given ID"});
    }
  } catch (err){
    return res.status(500).json({message: err.message});
  }

  res.Author = Author;
  next();

}

/**
 * Route - baseURL/author/
 * Returns a list of all authors in the database.
 */
router.get("/",async(req,res)=>{
  try{
    const authors = await authorschema.find();
    res.json(authors);
  }catch(err){
    return res.status(500).json({message: err.message});
  }
})

/**
 * Route - baseURL/author/id/:id/
 * A simple function that returns the author and his blogs array.
 * @param res.Author - the author Object from the getAuthor middleware
 */

router.get("/id/:id",getAuthor,async(req,res)=>{
  Blogs = await blog.find({author: req.params.id});
  res.json({...res.Author._doc, Blogs});
})



/**
 * Takes in a request and response object and creates a new author.
 */
router.post("/",async(req,res)=>{
  let token;
  if ( req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try{
      const decoded = await (promisify)(jwt.verify)(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id);
      if(currentUser.role!="owner"){
        res.status(401).json({message: "You are not authorized to perform this action"});
      }
    }catch(err){
      res.status(400).json({message: err.message})
      return;
    }
  }else{
    res.status(401).json({message: "You're not Logged In"});
    return;
  }

  const Author = new authorschema({
    name: req.body.name,
    photo: req.body.photo,
    desc: req.body.desc,
    rollNum: req.body.rollNum,
    createdAt: Date.now()
  })
  try{
    const newAuthor = await Author.save();
    res.status(201).send(newAuthor);
  } catch (err){
    res.status(400).json({message: err.message});
  }
})


/**
 * Update the author with the given ID.
 * Route - baseURL/author/id/:id
 * @param res.Author - the author Object from the getAuthor middleware
 */
router.patch("/id/:id",getAuthor,async(req,res)=>{
  if(req.body.name != null){
    res.Author.name = req.body.name;
  }

  if(req.body.photo != null){
    res.Author.photo = req.body.photo;
  }

  if(req.body.desc != null){
    res.Author.desc = req.body.desc;
  }

  if(req.body.tags != null){
    res.Author.tags = req.body.tags;
  }

  try{
    const newAuthor = await res.Author.save();
    res.json(newAuthor);
  }catch(err){
    res.status(500).json({message: err.message});
  }
})

/**
 * Removes the Author from the database.
 * Route - baseURL/author/id/:id
 * @param res.Author - the author Object from the getAuthor middleware
 * @returns None
 */
router.delete("/id/:id",getAuthor,async(req,res)=>{
  try{
    await res.Author.remove();
    res.json({message: "Removed Successfully"});
  }catch(err){
    res.status(500).json({message: err.message});
  }
})

/**
 * Route - baseURL/author/tag
 * Returns a list of authors that have the given tags.
 * !! takes input from the request BODY
 * @returns None
 */
router.get("/tag", async(req,res)=>{
  try{
    const Authors = await authorschema.find({tags:{$all :req.body.tags}});
    res.json(Authors);
  }catch(err){
    res.status(500).json({message: err.message});
  }
})


module.exports = router