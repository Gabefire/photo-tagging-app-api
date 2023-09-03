import dotenv from "dotenv";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import session from "express-session";
import logger from "morgan";
import mongoose from "mongoose";

import indexRouter from "./routes/index";

dotenv.config();

const app = express();

// Set up mongoose connection
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URI;

async function main() {
  await mongoose.connect(mongoDB);
}
main().catch((err) => console.log(err));

app.use(logger("dev"));

const sessionKey = process.env.SESSION_KEY;

app.use("/api/start", session({ secret: sessionKey }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", indexRouter);

const port = 3000;
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
