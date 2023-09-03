import dotenv from "dotenv";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import session from "cookie-session";
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
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
});
app.use(limiter);

// Set up mongoose connection
mongoose.set("strictQuery", false);

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
}
main().catch((err) => console.log(err));

app.use(logger("dev"));

const corsOptions = {
  origin: "https://https://photo-tagging-app-api-production.up.railway.app/",
};
app.use(cors(corsOptions));

const sessionKey = process.env.SESSION_KEY;

//Session cookie expires in one hour
app.use(
  session({
    secret: sessionKey,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/", indexRouter);

const port = +process.env.PORT || 3000;
console.log(port);
app.listen(port, "0.0.0.0", () => {
  console.log(`⚡️[server]: Server is running on port ${port}`);
});
