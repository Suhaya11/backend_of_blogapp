import express from "express";
import mongoose from "mongoose";
import usersRouter from "./src/routes/usersRoutes.mjs";
import session from "express-session";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import passport from "passport";
import postRouter from "./src/routes/postRoutes.mjs";
import reactionRoute from "./src/routes/reactionRoutes.mjs";
const PORT = process.env.PORT || 3002;

const app = express();
app.use(cookieParser("sulaimann"));
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
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/records")
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
    secret: "sulaiman haladu yau",
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
app.use("/api/users", usersRouter);
app.use("/api/posts", postRouter);
app.use("/api/post/reaction", reactionRoute);
app.get("/", (req, res) => {
  console.log(req.session);
  req.session.visited = true;
  res.send({ msg: "successfull setup server" });
});
