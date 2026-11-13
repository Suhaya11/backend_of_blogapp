import express from "express";
import { Comment } from "../schemas/mongooseSchema/postReactionSchema.mjs";
import {
  CommentReport,
  postReport,
} from "../schemas/mongooseSchema/repostSchema.mjs";
import { checkSchema, validationResult } from "express-validator";
import { reportInputSchema } from "../schemas/inputSchema/reportSchema.mjs";
import { isUserLoggedIn } from "../controllers/verifySession.mjs";
import mongoose from "mongoose";
import { Post } from "../schemas/mongooseSchema/postSchema.mjs";

const router = express.Router();
router.post("/comment", checkSchema(reportInputSchema), async (req, res) => {
  isUserLoggedIn(req, res);
  const reporter = req.session.passport.user.postingId;
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
    if (!theComment) return res.status(404).send({ err: "Comment unvailable" });
    const theReport = new CommentReport({
      reason,
      commentId,
      reporter,
    });
    try {
      console.log("sending");
      const reportSend = await theReport.save();
      console.log("sent", reportSend);
      if (!reportSend)
        return res.status(404).send({ err: "somenthing went wrong" });
      return res.status(200).send({
        res: "Succeesfully reported and under admin review",
      });
    } catch (err) {
      console.log("iner eroor handler", err);
      return res.sendStatus(300);
    }
  } catch (err) {
    console.log("outer error handler");
    return res.status(200).send({ err: err || "unknown error" });
  }
});
// dlete report of comment
router.delete("/comment/:id", async (req, res) => {
  isUserLoggedIn(req, res);
  const {
    params: { id },
  } = req;
  if (!mongoose.isValidObjectId(id))
    return res.status(401).send({ err: "invalid Id" });
  const reporter = req.session.passport.user.postingId;
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
router.get("/comment", async (req, res) => {
  isUserLoggedIn(req, res);
  try {
    const commentReports = await CommentReport.find({});
    return res.status(200).send(commentReports);
  } catch (err) {
    return res.status(500).send({ err });
  }
});
// report post
router.post("/post", checkSchema(reportInputSchema), async (req, res) => {
  isUserLoggedIn(req, res);
  const reporter = req.session.passport.user.postingId;
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
    if (!theComment) return res.status(404).send({ err: "Comment unvailable" });
    const theReport = new postReport({
      reason,
      postId,
      reporter,
    });
    try {
      console.log("sending");
      const reportSend = await theReport.save();
      console.log("sent", reportSend);
      if (!reportSend)
        return res.status(404).send({ err: "somenthing went wrong" });
      return res.status(200).send({
        res: "Succeesfully reported and under admin review",
      });
    } catch (err) {
      console.log("iner eroor handler", err);
      return res.sendStatus(300);
    }
  } catch (err) {
    console.log("outer error handler");
    return res.status(200).send({ err: err || "unknown error" });
  }
});
// dlete report of post
router.delete("/post/:id", async (req, res) => {
  isUserLoggedIn(req, res);
  const {
    params: { id },
  } = req;
  if (!mongoose.isValidObjectId(id))
    return res.status(401).send({ err: "invalid Id" });
  const reporter = req.session.passport.user.postingId;
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
router.get("/post", async (req, res) => {
  isUserLoggedIn(req, res);
  try {
    const postReports = await postReport.find({});
    return res.status(200).send(postReports);
  } catch (err) {
    return res.status(500).send({ err });
  }
});

export default router;
