import express, { json } from "express";
import { User, userSchema } from "../schemas/mongooseSchema/userSchema.mjs";
import { checkSchema, validationResult } from "express-validator";
import { AdduserSchema } from "../schemas/inputSchema/userSchema.mjs";
import mongoose from "mongoose";
import "../stratagies/local-stratagy.mjs";
import passport from "passport";
import { isUserLoggedIn } from "../controllers/verifySession.mjs";
const router = express.Router();

router.get("/", async (req, res) => {
  console.log(req.session);
  if (!req.session?.passport?.user?._id)
    return res.status(402).send({ err: "User not logged in" });
  if (
    !mongoose.isValidObjectId(req.session.passport.user._id) ||
    !(await User.findOne({ _id: req.session.passport.user._id }))
  )
    return res
      .status(402)
      .send({ err: "User not logged in or invalid login " });
  const theusers = await User.find();

  return res.send(theusers);
});
// Adding user api
router.post("/adduser", checkSchema(AdduserSchema), async (req, res) => {
  const {
    body: { password, username, email },
  } = req;
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.sendStatus(401);
  }
  const postingId = crypto.randomUUID();
  const theUser = new User({ email, password, username, postingId });
  try {
    const savedUser = await theUser.save();
    return res.status(201).send(savedUser);
  } catch (err) {
    console.log(err);
    return res.status(401).send({ err: err.errmsg });
  }
});
// retrive single user api with id
router.get("/:id", async (req, res) => {
  const { params } = req;
  console.log("sesson", req.session);
  if (!mongoose.isValidObjectId(params)) {
    return res.status(400).send({ error: "invalid id" });
  }
  try {
    const theUser = await User.findOne({ _id: params.id });
    console.log(theUser);
    if (!theUser) return res.status(404).send({ error: "user not found" });
    return res.status(200).send(theUser);
  } catch (err) {
    // console.log(err);

    return res.send({ error: err });
  }
});
// get user to loging
router.post(
  "/login",
  passport.authenticate("local"),
  checkSchema(AdduserSchema),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(400).send({ error: result.array().at(0).msg });
    const { username, password } = req.body;
    res.send("ok");
    try {
      const theUser = await User.findOne({ username, password });
      if (!theUser)
        return res.status(404).send({ error: "invalid credentials" });
      console.log("from usersroutes", req.session);
      req.session.user = theUser.id;
      return res.status(200).send(theUser);
    } catch (err) {
      return res.status(401).send({ error: err });
    }
  },
);
router.patch("/edit/:id", async (req, res) => {
  console.log("this is the passport object", req.session.passport);

  const {
    body: { username, email, password },
    params: { id },
  } = req;
  if (!mongoose.isValidObjectId(id))
    return res.status(401).send({ err: "invalid id" });

  isUserLoggedIn(req, res);

  if (id !== req.session.passport?.user?._id)
    return res.status(401).send({ err: "Cannot edit someones Profile" });
  const theuser = await User.findById(id);
  if (!theuser) return res.status(404).send({ err: "something went wrong !!" });
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          username,
          email,
          password,
        },
      },
    );
    if (!updatedUser)
      return res.status(500).send({ err: "something went wrong !!" });
    const currentUserIndb = await User.findById(id);
    if (!currentUserIndb)
      return res.status(404).send({ err: "something went wrong" });
    req.session.user = currentUserIndb;
    // passport.authenticate("local");
    res.status(200).send(currentUserIndb);
  } catch (err) {
    return res.status(401).send({ err });
  }
});
// log out
router.post("/logout", async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  req.logout((err) => (err ? res.sendStatus(401) : res.sendStatus(200)));
});

// find user by username and password
router.post("/user", checkSchema(AdduserSchema), async (req, res) => {
  const {
    body: { email, username, password },
  } = req;
  const result = validationResult(req);
  if (!result.isEmpty()) return res.send({ err: result.array().at(0).errmsg });
  const theUser = await User.findOne({ username, password });
  if (!theUser) return res.sendStatus(404);
  return res.send(theUser);
});

export default router;
