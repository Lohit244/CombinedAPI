const express = require("express")
const router = express.Router()
const blog = require("../Models/blog")
const author = require("../Models/author")
const mongoose = require("mongoose")
/**
 * A middleware function that takes in a request and response object and returns a Blog object.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function to call.
 * @returns None
 */
async function getBlog(req,res,next){
  let Blog;
  try{
    Blog = await blog.findById(req.params.id);
    if(Blog == null){
      return res.status(404).json({message: `No Blog with the id ${req.params.id}`})
    }
  } catch (err){
    return res.status(500).json({message: err.message})
  }

  res.Blog = Blog;
  next();
}

/**
 * Finds the author with the given id and stores it in the request object.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns None
 */
async function getAuthor(req,res,next){
  let Blog;
  try{
    Author = await author.findById(req.body.author);
    if(Author == null){
      return res.status(404).json({message: `No Author with the given id ${req.body.author}}`})
    }
  } catch (err){
    return res.status(500).json({message: err.message})
  }

  res.Author = Author;
  next();
}
/* 
* Route - baseURL/blog/
* Gets an array of all the blogs in the database
*/
router.get("/",async(req,res)=>{
  try{
    const blogs = await blog.find()
    res.json(blogs)
  }catch (err){
    res.status(500).json({ message: err.message })
  }
})

/**
 * route - baseURL/blog/id/:id
 * A function that returns a JSON object containing the blog data.
 * @param res.Blog - The blog object from getBlog middleware
 */
router.get("/id/:id",getBlog, (req,res)=>{
  res.json(res.Blog);
})

/**
 * route - baseURL/blog/
 * Takes in a new blog and adds it to the database.
 * @param res.Author - The Author object from getAuthor middleware
 * @returns None
 */
router.post("/",getAuthor,async(req,res)=>{
  const Blog = new blog({
    title: req.body.title,
    author: req.body.author,
    tags: req.body.tags,
    likes: 0,
    thumbnail: req.body.thumbnail,
    content: req.body.content,
    category: req.body.category,
    summary: req.body.summary,
    createdAt: Date.now()
  })
  try{
    const newBlog = await Blog.save()
    req.body.tags.forEach(tag=>{
      if(res.Author.tags.find((t)=>{
        return t==tag;
      })){
        // Tag exists
      }else{
        res.Author.tags.push(tag);
      }
    })
    res.Author.save();
    res.status(201).send(newBlog);
  }catch (err) {
    res.status(400).json({message: err.message})
  }
})

/**
 * route - baseURL/blog/id/:id
 * Removes all blog posts from the database.
 * @param res.Blog - The blog object from getBlog middleware
 */
router.delete("/id/:id",  getBlog, async(req,res)=>{ 
  try{
    await res.Blog.remove();
    res.json({message: "Removed Succesfully"})
  }catch(err){
    res.status(500).json({message: err.message})
  }
})

/**
 * route - baseURL/blog/id/:id
 * Update a blog post with the given ID. 
 * @param res.Blog - The blog object from getBlog middleware
 */
router.patch("/id/:id",getBlog,async(req,res)=>{
  if(req.body.title != null){
    res.Blog.title = req.body.title;
  }

  if(req.body.author != null){
    res.Blog.author = req.body.author;
  }

  if(req.body.tags != null){
    res.Blog.tags = req.body.tags;
  }

  if(req.body.thumbnail != null){
    res.Blog.thumbnail = req.body.thumbnail;
  }
  
  if(req.body.content != null){
    res.Blog.content = req.body.content;
  }
  if(req.body.category != null){
    res.Blog.category = req.Blog.catergory;
  }
  if(req.body.summary != null){
    res.Blog.category = req.Blog.summary;
  }
  try{
    const newBlog = await res.Blog.save();
    res.json(newBlog);
  }catch(err){
    res.status(500).json({message: err.message});
  }
})

/**
 * route - baseURL/blog/tag
 * Finds all blogs with the given tags.
 */
router.get("/tag", async(req,res)=>{
  try{
    const Blogs = await blog.find({tags: {$all: req.body.tags}});
    res.json(Blogs);
  }catch(err){
    res.status(500).json({message: err.message});
  }
})

/**
 * route - baseURL/blog/new
 * Finds the latest 10 Blogs and sends an array of their {
 * Thumbnail, title, AuthorID, AuthorName, createdAt time
 * }
 */
router.get("/new",async(req,res)=>{
  try{
    const Blogs = await blog.find().sort({createdAt: -1}).limit(10);
    var ans = [];
    for(const curBlog of Blogs){
      const authorObj = await author.findById(mongoose.Types.ObjectId(curBlog.author));
      ans.push({
        title: curBlog.title,
        author: curBlog.author,
        authorName: authorObj.name,
        createdAt: curBlog.createdAt,
        thumbnail: curBlog.thumbnail,
      });
    };
    res.json(ans);
  }catch(err){
    res.status(500).json({message: err.message});
  }
})


module.exports = router
