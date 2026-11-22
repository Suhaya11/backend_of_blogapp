import express from "express";
import "../stratagies/admin-local-stratagy.mjs";
import passport from "passport";
const router = express.Router();
router.post(
  "/login",
  passport.authenticate("admin-local"),
  async (req, res) => {
    return res.sendStatus(200);
  },
);

export default router;
