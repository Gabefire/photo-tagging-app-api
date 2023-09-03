import dotenv from "dotenv";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import session from "express-session";
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
app.use(compression());
app.use(helmet());
const limter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
});
app.use(limter);

// Set up mongoose connection
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URI;

async function main() {
  await mongoose.connect(mongoDB);
}
main().catch((err) => console.log(err));

app.use(logger("dev"));

const corsOptions = {
  origin: "http://localhost:3000",
};
app.use(cors(corsOptions));

const sessionKey = process.env.SESSION_KEY;

//Session cookie expires in one hour
app.use(
  session({
    secret: sessionKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, maxAge: 1000 * 60 * 60 },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", indexRouter);

const port = 3000;
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
