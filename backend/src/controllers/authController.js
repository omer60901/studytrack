import { User } from "../models/User.js";
import { signToken } from "../services/token.js";

function publicUser(user) {
  const object = user.toObject();
  delete object.password;
  return object;
}

export async function register(req, res) {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) return res.status(409).json({ message: "Email already registered" });

  const user = await User.create(req.body);
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}

export async function login(req, res) {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await user.comparePassword(req.body.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
}

export function logout(_req, res) {
  res.json({ message: "Logged out" });
}

export function me(req, res) {
  res.json({ user: req.user });
}

export async function updateMe(req, res) {
  const allowed = ["username", "avatar", "language", "theme"];
  const patch = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const user = await User.findByIdAndUpdate(req.user._id, patch, { new: true }).select("-password");
  res.json({ user });
}

export function forgotPassword(_req, res) {
  res.json({ message: "If the email exists, a reset link was sent" });
}

export async function changePassword(req, res) {
  const user = await User.findById(req.user._id);
  if (!user || !(await user.comparePassword(req.body.currentPassword))) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }
  user.password = req.body.newPassword;
  await user.save();
  res.json({ message: "Password changed" });
}
