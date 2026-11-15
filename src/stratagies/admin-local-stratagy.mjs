import passport from "passport";
import { Strategy } from "passport-local";

import { Admin } from "../schemas/mongooseSchema/adminSchema.mjs";

export default passport.use(
  "admin-local",
  new Strategy(async (username, password, done) => {
    try {
      const findedUser = await Admin.findOne({ username, password });
      if (
        !findedUser ||
        findedUser.password !== password ||
        findedUser.secret !== process.env.ADMIN_SECRET ||
        findedUser.auth !== process.env.ADMIN_AUTH
      )
        throw new Error("invalid credentials");
      done(null, findedUser);
    } catch (err) {
      done(err, null);
    }
  }),
);
// check web for the probabity of using morethan 2 checks with local startated
// install encryption package and encrypt each password
// initiate notification endpoint for admin to send notification to user or users
// test the endpoints and ensure they are working
// then switch to frontEnd and start building it
