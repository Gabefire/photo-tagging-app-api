import express from "express";
import jwt, { JsonWebTokenError, JwtPayload } from "jsonwebtoken";
import verifyToken from "../util/auth";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";

import User from "../models/user";
import HiScore from "../models/high_score";

const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({
    message: "Welcome to the API",
  });
});

// GET high scores
router.get(
  "/highscores",
  asyncHandler(async (req, res, next) => {
    const hiScores = await HiScore.find({}, "time display_name")
      .populate("user")
      .exec();
    res.json({});
  })
);

// POST high score
router.post(
  "/highscores",
  verifyToken,
  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, "secret", async (err, authData: JwtPayload) => {
      if (err) {
        res.sendStatus(403);
      } else {
        const hiScore = new HiScore({
          time: 0,
          userName: authData.id,
        });
        try {
          await hiScore.save();
        } catch (err) {
          return next(err);
        }
      }
    });
  })
);

router.post(
  "/sign-up",
  asyncHandler(async (req, res, next) => {
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
      }
    );
  })
);

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
      "secret",
      (err: JsonWebTokenError, token: string) => {
        res.json({
          token: token,
        });
      }
    );
  })
);

export default router;
