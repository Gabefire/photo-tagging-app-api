export {};

declare global {
  namespace Express {
    export interface Request {
      token: string;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    iat: Number;
  }
}
