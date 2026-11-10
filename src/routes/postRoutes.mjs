import express from "express";
import { checkSchema, validationResult } from "express-validator";
import { postSchema } from "../schemas/inputSchema/postSchema.mjs";
import { Post } from "../schemas/mongooseSchema/postSchema.mjs";
import mongoose from "mongoose";
import { isUserLoggedIn } from "../controllers/verifySession.mjs";

const router = express.Router();

//add post

router.post("/", checkSchema(postSchema), async (req, res) => {
  if (!req.session?.passport?.user?._id)
    return res.status(401).send({ err: "user not logged in" });
  const result = validationResult(req);
  if (!result.isEmpty())
    return res.status(401).send({ err: result.array().at(0).msg });
  const poster = req.session?.passport?.user?.postingId;
  const postId = crypto.randomUUID();
  const {
    body: { title, body },
  } = req;

  try {
    const addedPost = new Post({ title, body, poster, postId });
    const savedPost = await addedPost.save();
    res.status(204).send(savedPost);
  } catch (err) {
    return res.status(401).send({ err: err });
  }
});
// get all posts
router.get("/", async (req, res) => {
  return res.send("hhhhh");
  try {
    const posts = await Post.find({});
    return res.status(200).send(posts);
  } catch (err) {
    return res.send({ err });
  }
});
// get a post by id

router.get("/find/:id", async (req, res) => {
  const {
    params: { id },
  } = req;

  if (!mongoose.isValidObjectId(id))
    return res.status(300).send({ err: "invalid id " });

  const thePost = await Post.findOne({ postId: id });
  if (!thePost) return res.status(404).send({ err: "not found" });
  return res.status(200).send(thePost);
});
// get all post by current ser
router.get("/myPosts", async (req, res) => {
  isUserLoggedIn(req, res);
  const usersPosts = await Post.find({
    poster: req?.session?.passport?.user?.postingId,
  });
  return res.status(200).send(usersPosts);
});

//edit a post by its id
router.patch("/:id", checkSchema(postSchema), async (req, res) => {
  isUserLoggedIn(req, res);
  const result = validationResult(req);
  if (!result.isEmpty()) return res.status(400).send(result.array().at(0).msg);
  const {
    body: { title, body: postBody },
    params: { id },
  } = req;
  const thePost = await Post.findOne({ postId: id });
  if (!thePost) return res.status(404).send({ err: "not found" });
  if (thePost.poster != req.session?.passport?.user?.postingId)
    return res.status(401).send({
      err: "cannot edit someones post",
    });
  try {
    await Post.findByIdAndUpdate(id, {
      $set: {
        title,
        body: postBody,
      },
    });

    const updatedPost = await Post.findOne({ postId: id });
    return res.status(204).send(updatedPost);
  } catch (err) {
    return res.status(400).send({ err });
  }
});
// delete post by its id
router.delete("/:id", async (req, res) => {
  isUserLoggedIn(req, res);

  const {
    params: { id },
  } = req;
  if (!mongoose.isValidObjectId(id))
    return res.status(401).send({ err: "invalid id" });
  const thePost = await Post.findOne({ postId: id });
  if (!thePost) return res.status(404).send({ err: "not found" });
  if (thePost.poster != req?.session?.passport?.user?.postingId)
    return res.status(401).send({ err: "cannot delete someones post" });
  const deletedPost = await Post.findOneAndDelete({ postId: id });
  if (!deletedPost)
    return res.status(401).send({ err: "something went wrong" });
  return res.status(200).send(deletedPost);
});
//

export default router;
