import dotenv from "dotenv";
import express from "express";
import jwt, { JsonWebTokenError, JwtPayload } from "jsonwebtoken";
import verifyToken from "../util/auth";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";

import User from "../models/user";
import HiScore from "../models/high_score";
import Tag from "../models/tag";

dotenv.config();
const JWTSecret = process.env.JWT_KEY;

const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({
    message: "Welcome to the API",
  });
});

// GET tags
router.get(
  "/tags",
  asyncHandler(async (req, res, next) => {
    const tags = Tag.find({}).exec();
    res.json({ tags });
  })
);

// GET high scores
router.get(
  "/highscores",
  asyncHandler(async (req, res, next) => {
    const hiScores = await HiScore.find().sort({ time: 1 }).exec();
    res.json({ hiScores });
  })
);

// POST high score
router.post(
  "/highscores",
  verifyToken,
  asyncHandler(async (req, res, next) => {
    console.log(req.session.iat);
    let time = 0;
    if (typeof req.session.iat === "number") {
      const date = Date.now();
      time = date - req.session.iat;
    }
    jwt.verify(req.token, JWTSecret, async (err, authData: JwtPayload) => {
      console.log(authData);
      if (err) {
        res.sendStatus(403);
      } else {
        const hiScore = new HiScore({
          time: time,
          userName: authData.user.username,
        });
        try {
          const results = await hiScore.save();
          res.json({ results });
        } catch (err) {
          return next(err);
        }
      }
    });
  })
);

// POST sign up
router.post(
  "/sign-up",
  asyncHandler(async (req, res, next) => {
    if (req.body.password === undefined) throw Error("password not entered");
    bcrypt.hash(
      req.body.password,
      10,
      async (err: Error, hashedPassword: string) => {
        if (err) {
          return next(err);
        }
        const user = new User({
          username: req.body.username,
          password: hashedPassword,
        });
        await user.save();
        console.log(`${user.username} signed up!`);
        res.sendStatus(200);
      }
    );
  })
);

// GET get timer session cookie
router.get("/start-timer", (req, res, next) => {
  const date = Date.now();
  req.session.iat = date;
  console.log(req.session.iat);
  res.json({ message: req.session.iat });
});

// POST log in
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    // auth stuff with postman and mongo
    const user = await User.findOne({ username: req.body.username }).exec();
    if (!user) throw Error("User not found");
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) throw Error("Invalid password");
    jwt.sign(
      { user: user },
      JWTSecret,
      (err: JsonWebTokenError, token: string) => {
        res.json({
          token: token,
        });
      }
    );
  })
);

export default router;
