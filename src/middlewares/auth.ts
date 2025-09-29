import { Request, Response, NextFunction } from "express";
import { verify_access_token } from "../jwt";

export interface AuthRequest extends Request {
  user?: { userId: number; role: string };
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer")
    return res.status(401).json({ error: "Invalid auth header" });

  const token = parts[1];
  try {
    const payload = verify_access_token(token) as {
      userId: number;
      role: string;
    };
    if (!payload || typeof payload.userId !== "number") {
      return res.status(401).json({ error: "Invalid token payload" });
    }
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function authorizeRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
