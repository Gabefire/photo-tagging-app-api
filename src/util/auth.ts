import { NextFunction, Request, RequestHandler, Response } from "express";

export interface JWTRequestType extends Request {
  token: string;
}

export default function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
): RequestHandler {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];
  console.log(bearerHeader);
  if (bearerHeader) {
    const token = bearerHeader.split(" ")[1];
    req.token = token;
    next();
  } else {
    res.sendStatus(403);
    return;
  }
}
