import { Router } from "express";
import * as authService from "../services/auth";
import { set_refresh_cookie, clear_refresh_cookie } from "../jwt";
import { RegisterDTO, LoginDTO } from "../dto/auth";

const router = Router();

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const data: RegisterDTO = req.body;
    const user = await authService.register(data);
    res.status(201).json({ user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const data: LoginDTO = req.body;
    const { accessToken, refreshToken, user } = await authService.login(data);
    set_refresh_cookie(res, refreshToken);
    res.json({ accessToken, user });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

// POST /auth/refresh
router.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ error: "No refresh token" });
    const { accessToken, refreshToken } = await authService.refresh(token);
    set_refresh_cookie(res, refreshToken);
    res.json({ accessToken });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

// POST /auth/logout
router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;
    if (token) await authService.logout(token);
    clear_refresh_cookie(res);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
