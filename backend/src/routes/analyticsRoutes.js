import { Router } from "express";
import { stats } from "../controllers/analyticsController.js";

export const analyticsRoutes = Router();
analyticsRoutes.get("/stats", stats);
