import { Router } from "express";
import { body } from "express-validator";
import { generatePlan } from "../controllers/aiController.js";
import { validate } from "../middleware/validate.js";

export const aiRoutes = Router();
aiRoutes.post("/plan", body("prompt").isLength({ min: 10 }), validate, generatePlan);
