import express from "express";
import { checkSchema, validationResult } from "express-validator";
import { commentInputSchema } from "../schemas/inputSchema/commentSchema.mjs";
import mongoose from "mongoose";
import { Comment } from "../schemas/mongooseSchema/postReactionSchema.mjs";
import { Post } from "../schemas/mongooseSchema/postSchema.mjs";
import { isUserLoggedIn } from "../controllers/verifySession.mjs";

const router = express.Router();

//add comment
router.post("/comment", checkSchema(commentInputSchema), async (req, res) => {
  isUserLoggedIn(req, res);

  const result = validationResult(req);
  if (!result.isEmpty()) return res.status(401).send(result.array()[0].msg);
  const {
    body: { postId, message },
  } = req;
  if (String(postId).length < 30)
    return res.status(401).send({ err: "invalid post id" });
  // save the current post somewhere and compare the given value with the currentpost value before querying the db

  const thePost = await Post.findOne({ postId });
  if (!thePost) return res.status(404).send({ err: "post not found" });
  const comment = new Comment({
    postId,
    message,
    commenter: req.session?.passport?.user?.postingId,
  });
  try {
    const newComment = await comment.save();
    return res.status(200).send(newComment);
  } catch (err) {
    return res.status(500).send({ err: "something went wrong" });
  }

  //
});
//get single comment by id
router.get("/comment/:id", async (req, res) => {
  isUserLoggedIn(req, res);
  const {
    params: { id },
  } = req;
  if (!mongoose.isValidObjectId(id))
    return res.status(401).send({ err: "invalid comment id" });

  try {
    const theComment = await Comment.findById(id);
    if (!theComment) return res.status(404).send({ err: "not found" });
    return res.status(200).send(theComment);
  } catch (err) {
    return res.status(500).send({ err: "something went wrong" });
  }
});
//edit comment
router.patch(
  "/comment/edit",
  checkSchema(commentInputSchema),
  async (req, res) => {
    isUserLoggedIn(req, res);
    const {
      body: { message, id }, // on attach the postId and commenter on the body
    } = req;
    if (!mongoose.isValidObjectId(id))
      return res.status(401).send({ err: "invalid comment id" });

    try {
      const theComment = await Comment.findOne({ _id: id });
      if (!theComment) return res.status(404).send({ err: "not found" });
      if (!theComment.commenter == req.session?.passport?.user?.postingId)
        return res.status(401).send({ err: "Cannot edit someones comment" });
      const updatedComment = await Comment.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            message,
          },
        },
      );
      if (!updatedComment)
        return res.status(404).send({ err: "unable to update the comment" });
      const commentInDb = await Comment.findOne({ _id: id });

      return res
        .status(200)
        .send({ newComment: commentInDb, oldComment: updatedComment });
    } catch (err) {
      return res.status(500).send({ err: "something went wrong" });
    }
  },
);

//delete comment
router.delete("/comment", async (req, res) => {
  isUserLoggedIn(req, res);
  const id = req.body?.id;
  //   if (postId !== req.session?.passport?.user?.postingId)
  //     return res.status(401).send({ err: "cannot delete someone's posts" });
  if (!mongoose.isValidObjectId(id))
    return res.status(401).send({ err: "invalid id" });

  try {
    const theComment = await Comment.findById(id);
    if (!theComment) return res.status(404).send({ err: " comment not found" });
    if (theComment.commenter != req.session?.passport?.user?.postingId)
      return res.status(401).send({ err: "cannot delete someone's posts" });
    const deletedComment = await Comment.findOneAndDelete({ _id: id });
    return res.status(200).send(deletedComment);
  } catch (err) {
    return res.status(500).send({ err: String(err) });
  }
});

//get comment of a post
router.get("/comment", async (req, res) => {
  const {
    body: { postId },
  } = req;
  if (String(postId).length < 30)
    return res.status(401).send({ err: "invalid post id" });
  try {
    const comments = await Comment.find({ postId });

    return res.status(200).send(comments);
  } catch (err) {
    return res.status(500).send({ err: String(err) });
  }
});

// add or remove like
router.post("/like", async (req, res) => {
  const postId = req.body.postId;
});
// in the morning implement
//1 like and dislike
//2 addmin endpoing and account and his registration in db a startup
// 3 report for addmin on post and comment

//add or remove dislike

export default router;
