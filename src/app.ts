import dotenv from "dotenv";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import session from "express-session";
import mongoStore from "connect-mongo";
import logger from "morgan";
import mongoose from "mongoose";

import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import indexRouter from "./routes/index";

dotenv.config();

const app = express();

// deployment
app.set("trust proxy", 1);
app.use(compression());
app.use(helmet());
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
});
app.use(limiter);

// Set up mongoose connection
mongoose.set("strictQuery", false);

async function main() {
  await mongoose.connect(process.env.MONGO_URL, {
    dbName: "photo-tag-app",
    retryWrites: true,
    w: "majority",
  });
}
main().catch((err) => console.log(err));

app.use(logger("dev"));

app.use(
  cors({
    origin: process.env.DOMAIN,
    methods: ["POST", "GET", "PUT", "OPTIONS", "HEAD"],
    credentials: true,
  })
);

const sessionKey = process.env.SESSION_KEY;

//Session cookie expires in one hour
app.use(
  ["/start-timer", "/highscores"],
  session({
    name: "time session",
    secret: sessionKey,
    resave: true,
    saveUninitialized: true,
    store: mongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      dbName: "photo-tag-app",
    }),
    cookie: {
      maxAge: 100 * 60 * 60,
      secure: true,
      sameSite: "none",
      httpOnly: false,
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/", indexRouter);

const port = +process.env.PORT || 3000;
console.log(port);
app.listen(port, "0.0.0.0", () => {
  console.log(`⚡️[server]: Server is running on port ${port}`);
});
