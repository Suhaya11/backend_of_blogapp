import passport from "passport";
import { Strategy } from "passport-local";
import { User } from "../schemas/mongooseSchema/userSchema.mjs";
import { Admin } from "../schemas/mongooseSchema/adminSchema.mjs";
import bcrypt from "bcrypt";
passport.serializeUser(async (user, done) => {
  try {
    const type = user.constructor.modelName;

    done(null, { user, type });
  } catch (err) {
    done(err, null);
  }
});
passport.deserializeUser(async (obj, done) => {
  if (obj.type === "admin") {
    try {
      const findedUser = await Admin.findById(obj.user._id);
      if (!findedUser) throw new Error("user not found !");
      done(null, findedUser);
    } catch (err) {
      done(err, null);
    }
  } else {
    try {
      // console.log("the id ", obj.user._id);
      const findedUser = await User.findById(obj.user._id);
      if (!findedUser) throw new Error("user not found !");
      done(null, findedUser);
    } catch (err) {
      done(err, null);
    }
  }
});
export default passport.use(
  new Strategy(async (username, password, done) => {
    try {
      const findedUser = await User.findOne({ username });
      if (!findedUser || !(await bcrypt.compare(password, findedUser.password)))
        throw new Error("invalid credentials");
      done(null, findedUser);
    } catch (err) {
      done(err, null);
    }
  }),
);
