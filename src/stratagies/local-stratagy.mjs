import passport from "passport";
import { Strategy } from "passport-local";
import { User } from "../schemas/mongooseSchema/userSchema.mjs";
passport.serializeUser(async (user, done) => {
  try {
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
passport.deserializeUser(async (id, done) => {
  try {
    const findedUser = await User.findById(id);
    if (!findedUser) throw new Error("user not found !");
    done(null, findedUser);
  } catch (err) {
    done(err, null);
  }
});
export default passport.use(
  new Strategy(async (username, password, done) => {
    try {
      const findedUser = await User.findOne({ username });
      if (!findedUser || findedUser.password !== password)
        throw new Error("invalid credentials");
      done(null, findedUser);
    } catch (err) {
      done(err, null);
    }
  }),
);
