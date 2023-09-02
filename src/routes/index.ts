import express, { Request } from "express";
import jwt, { JsonWebTokenError, JwtPayload, Secret } from "jsonwebtoken";
import verifyToken from "../util/auth";
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({
    message: "Welcome to the API",
  });
});

router.post("/highscores", verifyToken, (req: Request, res, next) => {
  jwt.verify(req.token, "secret", (err, authData: JwtPayload) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.json({
        user: authData.user.username,
        message: "highscores",
      });
    }
  });
});

router.post("/login", (req, res) => {
  // auth stuff with postman and mongo

  const user = {
    id: 1,
    username: "test",
    email: "gabe@gmail.com",
  };

  jwt.sign(
    { user: user },
    "secret",
    (err: JsonWebTokenError, token: string) => {
      res.json({
        token: token,
      });
    }
  );
});

export default router;
