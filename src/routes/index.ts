import dotenv from "dotenv";
import express from "express";
import jwt, { JsonWebTokenError, JwtPayload } from "jsonwebtoken";
import verifyToken from "../util/auth";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";

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
    const tags = await Tag.find({}).exec();
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
    let time = 0;
    if (typeof req.session.iat === "number") {
      const date = Date.now();
      time = date - req.session.iat;
    } else {
      req.session.destroy((err: Error) => {
        if (err) {
          throw new Error(err.message);
        }
      });
      res.status(403).json({ message: "no session cookie" });
      return next();
    }
    jwt.verify(req.token, JWTSecret, async (err, authData: JwtPayload) => {
      if (err) {
        res.sendStatus(403).json({ message: "JWT token did not match" });
      } else {
        const hiScore = new HiScore({
          time: time,
          user: authData.user.username,
        });
        try {
          const results = await hiScore.save();
          console.log("JWT did not match");
          res.json({ results });
        } catch (err) {
          return next(err);
        }
      }
    });
  })
);

// POST sign up
router.post("/sign-up", [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("please provide a username")
    .escape()
    .custom(async (value: string) => {
      try {
        const user = await User.find({ username: value }).exec();
        if (user) {
          throw new Error("username already taken");
        }
      } catch (err) {
        return true;
      }
    }),
  body("password")
    .trim()
    .isLength({ min: 5 })
    .withMessage("password must be at least 5 characters"),
  body("passwordConfirmation")
    .trim()
    .custom((value: string, { req }) => {
      return value === req.body.password;
    }),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json(errors);
    }
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
  }),
]);

// GET timer session cookie
router.get("/start-timer", (req, res, next) => {
  const date = Date.now();
  req.session.iat = date;
  req.session.save();
  res.status(200).send(req.sessionID);
});

// POST log in
router.post(
  "/login",
  asyncHandler(async (req, res) => {
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
