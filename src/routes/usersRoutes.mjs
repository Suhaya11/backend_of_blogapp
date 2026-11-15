import express, { json } from "express";
import { User, userSchema } from "../schemas/mongooseSchema/userSchema.mjs";
import { checkSchema, validationResult } from "express-validator";
import { AdduserSchema } from "../schemas/inputSchema/userSchema.mjs";
import mongoose from "mongoose";
import "../stratagies/local-stratagy.mjs";
import passport from "passport";
import { isAdmin, isUserLoggedIn } from "../controllers/verifySession.mjs";
const router = express.Router();

router.get("/", isAdmin, async (req, res) => {
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
router.get("/:id", isUserLoggedIn, async (req, res) => {
  const {
    params: { id },
  } = req;
  console.log("sesson", req.session);
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).send({ error: "invalid id" });
  }
  try {
    const theUser = await User.findById(id);
    console.log(theUser);
    if (!theUser) return res.status(404).send({ error: "user not found" });
    return res.status(200).send(theUser);
  } catch (err) {
    // console.log(err);

    return res.send({ err: err.message });
  }
});
// get user to loging
router.post(
  "/login",
  passport.authenticate("local"),
  checkSchema(AdduserSchema),
  async (req, res) => {
    console.log(req.session);
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(400).send({ error: result.array().at(0).msg });
    const { username, password } = req.body;

    try {
      const theUser = await User.findOne({ username, password });
      if (!theUser)
        return res.status(404).send({ error: "invalid credentials" });
      // console.log("from usersroutes", req.session);

      return res.status(200).send(theUser);
    } catch (err) {
      return res.status(401).send({ err: err.message });
    }
  },
);
router.patch("/edit/:id", isUserLoggedIn, async (req, res) => {
  // console.log("this is the passport object", req.session.passport);

  const {
    body: { username, email, password },
    params: { id },
  } = req;
  if (!mongoose.isValidObjectId(id))
    return res.status(401).send({ err: "invalid id" });

  if (id !== req.session.passport?.user?.user?._id)
    return res.status(401).send({ err: "Cannot edit someones Profile" });
  const theuser = await User.findById(id);
  if (!theuser) return res.status(404).send({ err: "something went wrong !!" });
  try {
    const updatedUser = await User.findByIdAndUpdate(id, {
      $set: {
        username,
        email,
        password,
      },
    });
    if (!updatedUser)
      return res.status(500).send({ err: "something went wrong " });
    const currentUserIndb = await User.findById(id);
    if (!currentUserIndb)
      return res.status(404).send({ err: "something went wrong" });
    // req.session.user = currentUserIndb;
    // passport.authenticate("local");
    res.status(200).send(currentUserIndb);
  } catch (err) {
    return res.status(401).send({ err });
  }
});
// log out
router.post("/logout", isUserLoggedIn, async (req, res) => {
  return req.logout((err) => (err ? res.sendStatus(401) : res.sendStatus(200)));
});

// find user by username and password
router.get("/user", checkSchema(AdduserSchema), async (req, res) => {
  const {
    body: { email, username, password },
  } = req;
  const result = validationResult(req);
  if (!result.isEmpty()) return res.send({ err: result.array().at(0).errmsg });
  const theUser = await User.findOne({ username, password });
  if (!theUser) return res.sendStatus(404);
  return res.send(theUser);
});
// delete user by admin
router.delete("/user:id", isAdmin, async (req, res) => {
  const {
    params: { id },
  } = req;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).send({ err: "User not found" });
    return res.status(200).send({ res: "Succesfully deleted the user", user });
  } catch (err) {
    return res.status(500).send({ err: err.message });
  }
});
export default router;
