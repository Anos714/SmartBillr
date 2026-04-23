import { AuthenticatedUser } from "../middlewares/requireAuth.middleware";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
