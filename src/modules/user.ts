import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../services/user";

const router = Router();

// GET all users
router.get("/", async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
});

// GET user by ID
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const user = await getUserById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// POST create user
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;
  const user = await createUser(name, email, password);
  res.status(201).json(user);
});

// PUT update user
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, email, password } = req.body;
  const user = await updateUser(id, { name, email, password });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// DELETE user
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const user = await deleteUser(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

export default router;
