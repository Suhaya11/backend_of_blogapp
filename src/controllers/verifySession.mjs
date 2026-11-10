import mongoose from "mongoose";

export const isUserLoggedIn = (req, res) => {
  if (!req.session?.passport?.user?._id)
    return res.status(401).send({ err: "user not logged in" });
  if (!mongoose.isValidObjectId(req.session?.passport?.user?._id))
    return res.status(401).send({ err: "invalid login" });
};
