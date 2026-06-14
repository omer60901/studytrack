import { Router } from "express";
import { body } from "express-validator";
import { changePassword, forgotPassword, login, logout, me, register, updateMe } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const authRoutes = Router();

authRoutes.post("/register", body("email").isEmail(), body("password").isLength({ min: 6 }), body("username").notEmpty(), validate, register);
authRoutes.post("/login", body("email").isEmail(), body("password").notEmpty(), validate, login);
authRoutes.post("/forgot-password", body("email").isEmail(), validate, forgotPassword);
authRoutes.post("/logout", requireAuth, logout);
authRoutes.get("/me", requireAuth, me);
authRoutes.patch("/me", requireAuth, updateMe);
authRoutes.patch("/password", requireAuth, body("currentPassword").notEmpty(), body("newPassword").isLength({ min: 6 }), validate, changePassword);
