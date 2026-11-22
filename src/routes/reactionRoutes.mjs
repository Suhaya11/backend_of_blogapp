import express from "express";
import { checkSchema, validationResult } from "express-validator";
import { commentInputSchema } from "../schemas/inputSchema/commentSchema.mjs";
import mongoose from "mongoose";
import {
  Comment,
  Dislike,
  Like,
} from "../schemas/mongooseSchema/postReactionSchema.mjs";
import { Post } from "../schemas/mongooseSchema/postSchema.mjs";
import { isUserLoggedIn } from "../controllers/verifySession.mjs";
// import { reportInputSchema } from "../schemas/inputSchema/reportSchema.mjs";
// import { CommentReport } from "../schemas/mongooseSchema/repostSchema.mjs";

const router = express.Router();

//add comment
router.post(
  "/comment",
  isUserLoggedIn,
  checkSchema(commentInputSchema),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) return res.status(401).send(result.array()[0].msg);
    const {
      body: { postId, message },
    } = req;
    if (!mongoose.isValidObjectId(postId))
      return res.status(401).send({ err: "invalid post id" });

    const commenter = req.session?.passport?.user?.user._id;
    const comment = new Comment({
      postId,
      message,
      commenter,
    });

    try {
      const newComment = await comment.save();
      return res.status(200).send(newComment);
    } catch (err) {
      return res.status(500).send({ err: "something went wrong" });
    }
  },
);
//get single comment by id
router.get("/comment/:id", isUserLoggedIn, async (req, res) => {
  // isUserLoggedIn(req, res);
  const {
    params: { id },
  } = req;
  if (!mongoose.isValidObjectId(id))
    return res.status(401).send({ err: "invalid comment id" });

  try {
    const theComment = await Comment.findById(id);

    if (!theComment) return res.status(404).send({ err: "comment not found" });
    return res.status(200).send(theComment);
  } catch (err) {
    return res.status(500).send({ err: "something went wrong" });
  }
});
//edit comment
router.patch(
  "/comment/edit/:id",
  isUserLoggedIn,
  checkSchema(commentInputSchema),
  async (req, res) => {
    const {
      params: { id },
      body: { message, postId }, // on attach the postId and commenter on the body
    } = req;
    if (!mongoose.isValidObjectId(id))
      return res.status(401).send({ err: "invalid comment id" });
    // try {
    //   const thePost = await Post.findById(postId);
    //   if (!thePost)
    //     return res.status(404).send({ err: "unable to find the Post" });
    //   const updatedComments = thePost.comment.map((comment) => {
    //     if (comment._id == id) {
    //       comment.message = message;
    //       return comment;
    //     }
    //     return comment;
    //   });
    //   try {
    //     const oldPost = await Post.findByIdAndUpdate(postId, {
    //       $set: {
    //         comment: updatedComments,
    //       },
    //     });
    //     const updatedPostWithComments = await Post.findById(postId);
    //     return res
    //       .status(200)
    //       .send({ newPost: updatedPostWithComments, oldPost });
    //   } catch (err) {
    //     return res.status(200).send({ err: err.message });
    //   }
    // } catch (err) {
    //   return;
    // }
    try {
      const theComment = await Comment.findOne({ _id: id });
      if (!theComment) return res.status(404).send({ err: "not found" });
      if (!theComment.commenter == req.session?.passport?.user?._id)
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
router.delete("/comment/:id", isUserLoggedIn, async (req, res) => {
  const {
    params: { id },
  } = req;
  //   if (postId !== req.session?.passport?.user?.postingId)
  //     return res.status(401).send({ err: "cannot delete someone's posts" });
  if (!mongoose.isValidObjectId(id))
    return res.status(401).send({ err: "invalid commentId id" });
  // try {
  //   const thePost = await Post.findById(postId);
  //   if (!thePost) return res.status(404).send({ err: "comment not found" });
  //   await Post.findByIdAndUpdate(postId, {
  //     $set: {
  //       comment: thePost.comment.map((comment) => {
  //         if (comment._id != id) return comment;
  //       }),
  //     },
  //   });
  //   const updatedPost = await Post.findById(postId);
  //   return res
  //     .status(200)
  //     .send({
  //       updatedComment: updatedPost.comment,
  //       oldComment: thePost.comment,
  //     });
  // } catch (err) {
  //   return res.status(500).send({ err: err.message });
  // }
  try {
    const theComment = await Comment.findById(id);
    if (!theComment) return res.status(404).send({ err: " comment not found" });
    if (theComment.commenter != req.session?.passport?.user?._id)
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
router.post("/like", isUserLoggedIn, async (req, res) => {
  const postId = req.body.postId;
  const userId = req.session.passport.user.user._id;

  // try {
  //   const liked = await Like.findOne({ postId, liker: userPostingId });
  //   const disLiked = await Dislike.findOne({ postId, disliker: userPostingId });
  //   if (!liked && !disLiked) {
  //     try {
  //       const addedLike = new Like({ postId, liker: userPostingId });
  //       await addedLike.save();
  //       const totalLikes = await Like.find({ postId });
  //       const response = { totalLikes, currentUserStatus: "liked" };
  //       return res.status(200).send(response);
  //     } catch (err) {
  //       return res.status(500).send({ err });
  //     }
  //   } else if (liked) {
  //     try {
  //       const removeLike = await Like.findOneAndDelete({
  //         postId,
  //         liker: userPostingId,
  //       });
  //       if (!removeLike) return res.sendStatus(404);

  //       const totalLikes = await Like.findOne({ postId });
  //       const response = { totalLikes, currentUserStatus: "not liked" };
  //       return res.status(200).send(response);
  //     } catch (err) {
  //       return res.status(500).send(err);
  //     }
  //   } else if (disLiked) {
  //     try {
  //       await Dislike.findOneAndDelete({ postId, disliker: userPostingId });
  //       const newLike = new Like({ postId, liker: userPostingId });
  //       await newLike.save();
  //       const totalLikes = await Like.find({ postId });
  //       const response = { totalLikes, currentUserStatus: "liked" };
  //       return res.status(200).send(response);
  //     } catch (err) {
  //       return res.status(500).send({ err });
  //     }
  //   } else {
  //     try {
  //       await Like.findOneAndDelete({ liker: userPostingId, postId });
  //       await Dislike.findOneAndDelete({ disliker: userPostingId, postId });
  //       const totalLikes = await Like.find({ postId });
  //       return res
  //         .status(200)
  //         .send({ totalLikes, currentUserStatus: "not liked" });
  //     } catch (err) {
  //       return res.status(500).send({ err });
  //     }
  //   }
  // } catch (err) {
  //   return res.status(500).send({ err });
  // }
  try {
    const thePost = await Post.findById(postId);
    if (!thePost) return res.status(404).send({ err: "post not found" });

    if (thePost.dislikes.includes(userId)) {
      await Post.findByIdAndUpdate(postId, {
        $set: {
          dislikes: thePost.dislikes.filter((id) => id != userId),
        },
        $push: {
          likes: userId,
        },
      });
    }
    if (thePost.likes.includes(userId)) {
      await Post.findByIdAndUpdate(postId, {
        $set: {
          likes: thePost.likes.filter((id) => id != userId),
        },
      });
    }
    if (!thePost.likes.includes(userId) && !thePost.dislikes.includes(userId)) {
      await Post.findByIdAndUpdate(postId, {
        $push: {
          likes: userId,
        },
      });
    }
    const theUpdatedPost = await Post.findById(postId);
    return res.status(200).send(theUpdatedPost);
    // update the post
  } catch (err) {
    return res.status(400).send({ err: err.message });
  }
});
//add dislike or remove dislike
router.post("/dislike", isUserLoggedIn, async (req, res) => {
  const postId = req.body.postId;
  const userId = req.session.passport.user.user._id;

  // try {
  //   const liked = await Like.findOne({ postId, liker: userPostingId });
  //   const disLiked = await Dislike.findOne({ postId, disliker: userPostingId });
  //   if (!liked && !disLiked) {
  //     try {
  //       const addedDislike = new Dislike({ postId, disliker: userPostingId });
  //       await addedDislike.save();
  //       const totalDislikes = await Dislike.find({ postId });
  //       const response = { totalDislikes, currentUserStatus: "disliked" };
  //       return res.status(200).send(response);
  //     } catch (err) {
  //       return res.status(500).send({ err });
  //     }
  //   } else if (liked) {
  //     try {
  //       const addedDislike = new Dislike({ postId, disliker: userPostingId });
  //       await addedDislike.save();
  //       const removeLike = await Like.findOneAndDelete({
  //         postId,
  //         liker: userPostingId,
  //       });
  //       if (!removeLike) return res.sendStatus(404);

  //       const totalDislikes = await Dislike.find({ postId });
  //       const response = { totalDislikes, currentUserStatus: "disliked" };
  //       return res.status(200).send(response);
  //     } catch (err) {
  //       return res.status(500).send(err);
  //     }
  //   } else if (disLiked) {
  //     try {
  //       await Dislike.findOneAndDelete({ postId, disliker: userPostingId });
  //       // const newLike = new Like({ postId, liker: userPostingId });
  //       // await newLike.save();
  //       const totalDislikes = await Dislike.find({ postId });
  //       const response = { totalDislikes, currentUserStatus: "not disliked" };
  //       return res.status(200).send(response);
  //     } catch (err) {
  //       return res.status(500).send({ err });
  //     }
  //   } else {
  //     try {
  //       await Like.findOneAndDelete({ liker: userPostingId, postId });
  //       await Dislike.findOneAndDelete({ disliker: userPostingId, postId });
  //       const totalDislikes = await Like.find({ postId });
  //       return res
  //         .status(200)
  //         .send({ totalDislikes, currentUserStatus: "not disliked" });
  //     } catch (err) {
  //       return res.status(500).send({ err });
  //     }
  //   }
  // } catch (err) {
  //   return res.status(500).send({ err });
  // }
  try {
    const thePost = await Post.findById(postId);
    if (!thePost) return res.status(404).send({ err: "post not found" });

    if (thePost.likes.includes(userId)) {
      await Post.findByIdAndUpdate(postId, {
        $set: {
          likes: thePost.likes.filter((id) => id != userId),
        },
        $push: {
          dislikes: userId,
        },
      });
    }
    if (thePost.dislikes.includes(userId)) {
      await Post.findByIdAndUpdate(postId, {
        $set: {
          dislikes: thePost.dislikes.filter((id) => id != userId),
        },
      });
    }
    if (!thePost.likes.includes(userId) && !thePost.dislikes.includes(userId)) {
      await Post.findByIdAndUpdate(postId, {
        $push: {
          dislikes: userId,
        },
      });
    }
    const theUpdatedPost = await Post.findById(postId);
    return res.status(200).send(theUpdatedPost);
    // update the post
  } catch (err) {
    return res.status(400).send({ err: err.message });
  }
});
// report comment

//next test reports end point for comments
// implement report for post
// add admin account
//test the ovaerall app endpoints
//the move on to frontend

export default router;
