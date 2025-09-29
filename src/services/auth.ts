import { PrismaClient } from "@prisma/client";
import type { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { RegisterDTO, LoginDTO } from "../dto/auth";
import {
  sign_access_token,
  sign_refresh_token,
  verify_refresh_token,
} from "../jwt";

const prisma = new PrismaClient();

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

const REFRESH_EXP = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

export async function register(data: RegisterDTO) {
  const { name, email, password, phone, role } = data;
  if (!name || !email || !password || !phone || !role) {
    throw new Error("Missing required fields");
  }
  if (!["ADMIN", "DRIVER"].includes(role)) {
    throw new Error("Role must be ADMIN or DRIVER");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(password, 10);
  const created = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      role: role as unknown as UserRole,
    },
  });

  const { password: _p, ...userSafe } = created as any;
  return userSafe;
}

export async function login(data: LoginDTO) {
  const { email, password } = data;
  if (!email || !password) throw new Error("Missing email or password");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || (user as any).is_deleted) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const accessToken = sign_access_token({ userId: user.id, role: user.role });

  // create refresh token (jti) and save record
  const jti = crypto.randomUUID();
  const { token: refreshToken } = sign_refresh_token(
    { userId: user.id, role: user.role },
    jti
  );

  const expiresAt = new Date(Date.now() + parseExpiryToMs(REFRESH_EXP));
  await prisma.refreshToken.create({
    data: {
      jti,
      userId: user.id,
      expiresAt,
    },
  });

  const { password: _p, ...userSafe } = user as any;
  return { accessToken, refreshToken, jti, user: userSafe };
}

export async function refresh(refreshTokenStr: string) {
  if (!refreshTokenStr) throw new Error("No refresh token provided");
  let payload: any;
  try {
    payload = verify_refresh_token(refreshTokenStr);
  } catch {
    throw new Error("Invalid refresh token");
  }
  const jti = payload.jti || (payload as any).jti;
  if (!jti) throw new Error("Invalid refresh token payload");

  const dbToken = await prisma.refreshToken.findUnique({ where: { jti } });
  if (!dbToken || dbToken.revoked || dbToken.expiresAt < new Date()) {
    throw new Error("Refresh token revoked or expired");
  }

  // rotate: revoke old token record
  await prisma.refreshToken.update({
    where: { jti },
    data: { revoked: true },
  });

  // issue new refresh token
  const newJti = crypto.randomUUID();
  const { token: newRefreshToken } = sign_refresh_token(
    { userId: dbToken.userId },
    newJti
  );
  const expiresAt = new Date(Date.now() + parseExpiryToMs(REFRESH_EXP));
  await prisma.refreshToken.create({
    data: {
      jti: newJti,
      userId: dbToken.userId,
      expiresAt,
    },
  });

  // new access token (include role if available in payload; fetch user if needed)
  const user = await prisma.user.findUnique({ where: { id: dbToken.userId } });
  if (!user) throw new Error("User not found");

  const accessToken = sign_access_token({ userId: user.id, role: user.role });
  return { accessToken, refreshToken: newRefreshToken, jti: newJti };
}

export async function logout(refreshTokenStr?: string) {
  if (!refreshTokenStr) return;
  try {
    const payload: any = verify_refresh_token(refreshTokenStr);
    const jti = payload.jti || payload?.jti;
    if (jti) {
      await prisma.refreshToken.updateMany({
        where: { jti },
        data: { revoked: true },
      });
    }
  } catch {
    // ignore invalid token
  }
}
