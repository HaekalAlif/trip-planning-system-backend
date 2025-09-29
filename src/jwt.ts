import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Response } from "express";

const ACCESS_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_EXPIRES =
  process.env.ACCESS_TOKEN_EXPIRES_IN || process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

function parseExpiryToMs(exp: string) {
  const m = exp.match(/^(\d+)([smhd])$/);
  if (!m) return 7 * 24 * 3600 * 1000;
  const val = Number(m[1]);
  const unit = m[2];
  const mul: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return val * (mul[unit] ?? mul.d);
}

export function sign_access_token(payload: object) {
  return (jwt as any).sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
}

export function sign_refresh_token(payload: object, jti?: string) {
  const id = jti || crypto.randomUUID();
  const token = (jwt as any).sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
    jwtid: id,
  });
  return { token, jti: id };
}

export function verify_access_token(token: string) {
  return jwt.verify(token, ACCESS_SECRET) as any;
}

export function verify_refresh_token(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as any;
}

export const refresh_cookie_options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: parseExpiryToMs(REFRESH_EXPIRES),
};

export function set_refresh_cookie(res: Response, token: string) {
  res.cookie("refresh_token", token, refresh_cookie_options);
}

export function clear_refresh_cookie(res: Response) {
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}
