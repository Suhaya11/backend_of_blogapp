import mongoose from "mongoose";

export const isUserLoggedIn = (req, res, next) => {
  if (!req.session?.passport?.user?.user._id || !req.isAuthenticated())
    return res.status(401).send({ err: "user not logged in" });
  if (!mongoose.isValidObjectId(req.session?.passport?.user?.user?._id))
    return res.status(401).send({ err: "invalid login" });
  next();
};

export const isAdmin = (req, res, next) => {
  isUserLoggedIn(req, res);
  if (req.session.passport.user.type !== "admin")
    return res.status(401).send({ err: "You're not admin" });
  next();
};
