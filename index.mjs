import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import usersRouter from "./src/routes/usersRoutes.mjs";
import session from "express-session";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import passport from "passport";
import postRouter from "./src/routes/postRoutes.mjs";
import reactionRoute from "./src/routes/reactionRoutes.mjs";
import reportRouter from "./src/routes/reportRoutes.mjs";
import adminRoute from "./src/routes/adminRoute.mjs";
import { Admin } from "./src/schemas/mongooseSchema/adminSchema.mjs";
const PORT = process.env.PORT || 3002;

const app = express();
app.use(cookieParser(process.env.COOKIEPARSER_SECRET));
// app.use(
//   session({
//     secret: "this is the secret",
//     cookie: { maxAge: 600000 },
//     saveUninitialized: true,
//     resave: false,
//     store: MongoStore.create({
//       client: mongoose.connection.getClient(),
//     }),
//   }),
// );

app.use(express.json());

// connect to db
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    try {
      const newAdmin = {
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
        secret: process.env.ADMIN_SECRET,
        auth: process.env.ADMIN_AUTH,
      };

      const adminAccount = await Admin.findOne(newAdmin);
      if (!adminAccount) {
        console.log(newAdmin);
        const admin = new Admin(newAdmin);
        await admin.save();
      } else {
        const myAdmin = await Admin.findOne(newAdmin);
        console.log(myAdmin);
      }
    } catch (err) {
      console.log(err);
    }
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log("Listening on port ", PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1000 * 60 * 60 * 24, secure: false },
    resave: false,

    saveUninitialized: false,
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
    }),
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/yanargizo", adminRoute);
app.use("/api/users", usersRouter);
app.use("/api/posts", postRouter);
app.use("/api/post/reaction", reactionRoute);
app.use("/api/reports/", reportRouter);
app.get("/", (req, res) => {
  console.log(req.session);
  req.session.visited = true;
  res.send({ msg: "successfull setup server" });
});
