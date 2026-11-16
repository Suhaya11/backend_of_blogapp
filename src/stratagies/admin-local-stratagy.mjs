import passport from "passport";
import { Strategy } from "passport-local";

import { Admin } from "../schemas/mongooseSchema/adminSchema.mjs";
import bcrypt from "bcrypt";
export default passport.use(
  "admin-local",
  new Strategy(
    { passReqToCallback: true },
    async (req, username, password, done) => {
      try {
        const { secret, auth } = req.body;
        const findedUser = await Admin.findOne({
          username,
        });
        if (
          !findedUser ||
          !(await bcrypt.compare(password, findedUser.password)) ||
          !(await bcrypt.compare(secret, findedUser.secret)) ||
          !(await bcrypt.compare(auth, findedUser.auth))
        )
          throw new Error("invalid credentials");
        done(null, findedUser);
      } catch (err) {
        done(err, null);
      }
    },
  ),
);
// check web for the probabity of using morethan 2 checks with local startated
// install encryption package and encrypt each password
// initiate notification endpoint for admin to send notification to user or users
// test the endpoints and ensure they are working
// then switch to frontEnd and start building it
