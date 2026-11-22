import express from "express";
import { Comment } from "../schemas/mongooseSchema/postReactionSchema.mjs";
import {
  CommentReport,
  postReport,
} from "../schemas/mongooseSchema/repostSchema.mjs";
import { checkSchema, validationResult } from "express-validator";
import { reportInputSchema } from "../schemas/inputSchema/reportSchema.mjs";
import { isAdmin, isUserLoggedIn } from "../controllers/verifySession.mjs";
import mongoose from "mongoose";
import { Post } from "../schemas/mongooseSchema/postSchema.mjs";

const router = express.Router();
// get all reports
router.get("/", isAdmin, async (req, res) => {
  const commentReports = await CommentReport.find({});
  const postReports = await postReport.find({});
  return res.status(200).send({ commentReports, postReports });
});

router.post(
  "/comment",
  isUserLoggedIn,
  checkSchema(reportInputSchema),
  async (req, res) => {
    const reporter = req.session.passport.user.user._id;
    const {
      body: { commentId, reason },
    } = req;
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(401).send({ err: result.array().at(0).msg });
    try {
      const prevReport = await CommentReport.findOne({ commentId, reporter });
      if (prevReport)
        return res.status(200).send({
          res: "Alrady reported under review you can delete it and add new report",
          prevReport,
        });

      const theComment = await Comment.findById(commentId);
      if (!theComment)
        return res.status(404).send({ err: "Comment unvailable" });
      const theReport = new CommentReport({
        reason,
        commentId,
        reporter,
        status: "pending",
      });
      try {
        // console.log("sending");
        const reportSend = await theReport.save();
        // console.log("sent", reportSend);
        if (!reportSend)
          return res.status(404).send({ err: "somenthing went wrong" });
        return res.status(200).send({
          res: "Succeesfully reported and under admin review",
          reportSent: reportSend,
        });
      } catch (err) {
        // console.log("iner eroor handler", err);
        return res.sendStatus(300);
      }
    } catch (err) {
      // console.log("outer error handler");
      return res.status(200).send({ err: err || "unknown error" });
    }
  },
);
// dlete report of comment
router.delete("/comment/:id", isUserLoggedIn, async (req, res) => {
  const {
    params: { id },
  } = req;
  if (!mongoose.isValidObjectId(id))
    return res.status(401).send({ err: "invalid Id" });
  const reporter = req.session.passport.user.user._id;
  try {
    const theReport = await CommentReport.findById(id);
    if (!theReport) return res.status(404).send({ err: "report not found" });
    if (theReport.reporter != reporter)
      return res.status(401).send({
        err: "Cannot delete someone's report",
        reporter,
        theId: theReport.reporter || "null",
      });
    await CommentReport.findByIdAndDelete(id);
    return res.status(200).send({
      deletedReport: theReport,
      res: "report is deleted you can make another report if you're not satisfied with this decision",
    });
  } catch (err) {
    return res.status(500).send({ err });
  }
});
//get comment reports
router.get("/comment", isAdmin, async (req, res) => {
  try {
    const commentReports = await CommentReport.find({});
    return res.status(200).send(commentReports);
  } catch (err) {
    return res.status(500).send({ err });
  }
});
// report post
router.post(
  "/post",
  isUserLoggedIn,
  checkSchema(reportInputSchema),
  async (req, res) => {
    const reporter = req.session.passport.user.user._id;
    const {
      body: { postId, reason },
    } = req;
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(401).send({ err: result.array().at(0).msg });
    try {
      const prevReport = await postReport.findOne({ postId, reporter });
      if (prevReport)
        return res.status(200).send({
          res: "Alrady reported under review you can delete it and add new report",
          prevReport,
        });

      const theComment = await Post.findById(postId);
      if (!theComment)
        return res.status(404).send({ err: "Comment unvailable" });

      const reportObjec = {
        reason,
        postId,
        reporter,
        status: "pending",
      };
      const theReport = new postReport(reportObjec);
      try {
        // console.log("sending");
        const reportSend = await theReport.save();
        // console.log("created", reportObjec, "sent", reportSend);
        if (!reportSend)
          return res.status(404).send({ err: "somenthing went wrong" });
        return res.status(200).send({
          res: "Succeesfully reported and under admin review",
          reportSend,
        });
      } catch (err) {
        // console.log("iner eroor handler", err);
        return res.sendStatus(300);
      }
    } catch (err) {
      // console.log("outer error handler");
      return res.status(200).send({ err: err || "unknown error" });
    }
  },
);
// dlete report of post
router.delete("/post/:id", isUserLoggedIn, async (req, res) => {
  const {
    params: { id },
  } = req;
  if (!mongoose.isValidObjectId(id))
    return res.status(401).send({ err: "invalid Id" });
  const reporter = req.session.passport.user.user._id;
  try {
    const theReport = await postReport.findById(id);
    if (!theReport) return res.status(404).send({ err: "report not found" });
    if (theReport.reporter != reporter)
      return res.status(401).send({
        err: "Cannot delete someone's report",
        reporter,
        theId: theReport.reporter || "null",
      });
    await postReport.findByIdAndDelete(id);
    return res.status(200).send({
      deletedReport: theReport,
      res: "report is deleted you can make another report if you're not satisfied with this decision",
    });
  } catch (err) {
    return res.status(500).send({ err });
  }
});
//get posts reports
router.get("/post", isAdmin, async (req, res) => {
  try {
    const postReports = await postReport.find({});
    return res.status(200).send(postReports);
  } catch (err) {
    return res.status(500).send({ err });
  }
});

router.patch("/review/:id", isAdmin, async (req, res) => {
  const {
    body: { status, adminMessage },
    params: { id },
  } = req;
  if (!mongoose.isValidObjectId(id))
    return res.status(401).send({ err: "invalid Id" });
  if (status === "decline") {
    // use encryption for the accept and declined words
    try {
      const findCommentReport = await CommentReport.findById(id);
      const findPostReport = await postReport.findById(id);
      if (!findCommentReport && !findPostReport)
        return res.status(404).send({ err: "report not found" });
      if (findCommentReport && findPostReport)
        return res
          .status(500)
          .send({ err: "two reports with the same id something went wrong" });
      if (findCommentReport) {
        await CommentReport.findByIdAndUpdate(id, {
          $set: {
            status: "declined",
            adminMessage,
          },
        });
        const updatedReport = await CommentReport.findById(id);

        const originalComment = await Comment.findById(
          findPostReport.commentId,
        );
        return res
          .status(200)
          .send({ theComment: originalComment, updatedReport });
      }
      if (findPostReport) {
        await postReport.findByIdAndUpdate(id, {
          $set: {
            status: "declined",
            adminMessage,
          },
        });
        const updatedReport = await postReport.findById(id);
        const originalPost = await Post.findById(findPostReport.postId);
        return res.status(200).send({ originalPost, updatedReport });
      }
      throw new Error("something went wrong");
    } catch (err) {
      return res.status(500).send({ err: err.message });
    }
  } else if (status === "accept") {
    try {
      const findCommentReport = await CommentReport.findById(id);
      const findPostReport = await postReport.findById(id);
      if (!findCommentReport && !findPostReport)
        return res.status(404).send({ err: "report not found" });
      if (findCommentReport && findPostReport)
        return res
          .status(500)
          .send({ err: "two reports with the same id something went wrong" });
      if (findCommentReport) {
        await CommentReport.findByIdAndUpdate(id, {
          $set: {
            status: "accepted",
          },
        });
        try {
          const updatedReport = await CommentReport.findById(id);
          const originalComment = await Comment.findById(
            findPostReport.commentId,
          );
          await Comment.findByIdAndUpdate(updatedReport.postId, {
            $set: {
              title: "Reported",
              body: "This post was removed by admin due to it's violation to the community standard ",
            },
          });
          const removedComment = await Post.findById(updatedReport.postId);

          return res
            .status(200)
            .send({ originalComment, removedComment, updatedReport });
        } catch (err) {
          return res.status(500).send(err.message);
        }
      }
      if (findPostReport) {
        await postReport.findByIdAndUpdate(id, {
          $set: {
            status: "accepted",
          },
        });

        try {
          const updatedReport = await postReport.findById(id);
          const originalPost = await Post.findById(findPostReport.postId);
          await Post.findByIdAndUpdate(updatedReport.postId, {
            $set: {
              title: "Reported",
              body: "This post was removed by admin due to it's violation to the community standard ",
            },
          });
          const removedPost = await Post.findById(updatedReport.postId);

          return res
            .status(200)
            .send({ originalPost, removedPost, updatedReport });
        } catch (err) {
          return res.status(500).send(err.message);
        }
      }
      throw new Error("something went wrong");
    } catch (err) {
      return res.status(500).send({ err: err.message });
    }
  } else return res.status(401).send({ err: "invalid command" });
});
export default router;
